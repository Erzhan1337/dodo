import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, STATUS } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductReviewDto } from './dto/create-product-review.dto';
import { UpdateProductReviewDto } from './dto/update-product-review.dto';
import {
  AdminReviewsQueryDto,
  ProductReviewsQueryDto,
  ReviewSortBy,
  ReviewSortOrder,
} from './dto/reviews-query.dto';

const reviewSelect = {
  id: true,
  rating: true,
  comment: true,
  productId: true,
  userId: true,
  orderItemId: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, name: true } },
  product: { select: { id: true, name: true, imageUrl: true } },
} satisfies Prisma.ProductReviewSelect;

type ReviewWithRatingTarget = {
  id: string;
  productId: string;
  rating: number;
};

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);
  private readonly reviewableStatuses = new Set<STATUS>([STATUS.SUCCEEDED]);

  constructor(private readonly prisma: PrismaService) {}

  async getProductReviews(productId: string, query: ProductReviewsQueryDto) {
    await this.assertProductExists(productId);

    const { page, limit, skip } = this.getPagination(query, 5);
    const where: Prisma.ProductReviewWhereInput = { productId };

    const [total, reviews] = await Promise.all([
      this.prisma.productReview.count({ where }),
      this.prisma.productReview.findMany({
        where,
        select: reviewSelect,
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: limit,
      }),
    ]);

    return this.paginated(reviews, total, page, limit);
  }

  async getMyReviews(userId: string) {
    return this.prisma.productReview.findMany({
      where: { userId },
      select: reviewSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAdminReviews(query: AdminReviewsQueryDto) {
    const { page, limit, skip } = this.getPagination(query, 10);
    const search = query.search?.trim();
    const where: Prisma.ProductReviewWhereInput = {
      rating: query.rating,
      OR: search
        ? [
            { comment: { contains: search, mode: 'insensitive' } },
            { product: { name: { contains: search, mode: 'insensitive' } } },
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { user: { phone: { contains: search, mode: 'insensitive' } } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
          ]
        : undefined,
    };

    const [total, reviews] = await Promise.all([
      this.prisma.productReview.count({ where }),
      this.prisma.productReview.findMany({
        where,
        select: reviewSelect,
        orderBy: this.getAdminOrderBy(query.sortBy, query.sortOrder),
        skip,
        take: limit,
      }),
    ]);

    return this.paginated(reviews, total, page, limit);
  }

  async createReview(userId: string, dto: CreateProductReviewDto) {
    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id: dto.orderItemId },
      select: {
        id: true,
        review: { select: { id: true } },
        productItem: { select: { productId: true } },
        order: { select: { userId: true, status: true } },
      },
    });

    if (!orderItem) throw new NotFoundException('Order item not found');
    if (orderItem.order.userId !== userId) {
      throw new ForbiddenException('You can review only your own order items');
    }
    if (!this.reviewableStatuses.has(orderItem.order.status)) {
      throw new BadRequestException('Only completed orders can be reviewed');
    }
    if (orderItem.review) {
      throw new BadRequestException('Order item has already been reviewed');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const review = await tx.productReview.create({
          data: {
            orderItemId: orderItem.id,
            userId,
            productId: orderItem.productItem.productId,
            rating: dto.rating,
            comment: this.normalizeComment(dto.comment),
          },
          select: reviewSelect,
        });

        await this.applyProductRatingDelta(
          tx,
          review.productId,
          review.rating,
          1,
        );

        return review;
      });
    } catch (error) {
      this.handleReviewMutationError(error);
    }
  }

  async updateReview(
    userId: string,
    reviewId: string,
    dto: UpdateProductReviewDto,
  ) {
    const existing = await this.getOwnedReview(userId, reviewId);
    const nextRating = dto.rating ?? existing.rating;

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.productReview.update({
        where: { id: reviewId },
        data: {
          ...(dto.rating !== undefined ? { rating: dto.rating } : {}),
          ...(dto.comment !== undefined
            ? { comment: this.normalizeComment(dto.comment) }
            : {}),
        },
        select: reviewSelect,
      });

      const ratingDelta = nextRating - existing.rating;
      if (ratingDelta !== 0) {
        await this.applyProductRatingDelta(tx, existing.productId, ratingDelta, 0);
      }

      return review;
    });
  }

  async deleteReview(userId: string, reviewId: string) {
    const existing = await this.getOwnedReview(userId, reviewId);
    await this.deleteReviewWithAggregate(existing);
    return { id: reviewId };
  }

  async deleteReviewAsAdmin(adminId: string, reviewId: string) {
    const review = await this.getReviewTarget(reviewId);
    await this.deleteReviewWithAggregate(review);
    this.logger.log(`admin=${adminId} action="deleted product review" target=${reviewId}`);
    return { id: reviewId };
  }

  async deleteReviewsForOrder(tx: Prisma.TransactionClient, orderId: string) {
    const reviews = await tx.productReview.findMany({
      where: { orderItem: { orderId } },
      select: { id: true, productId: true, rating: true },
    });

    for (const review of reviews) {
      await tx.productReview.delete({ where: { id: review.id } });
      await this.applyProductRatingDelta(
        tx,
        review.productId,
        -review.rating,
        -1,
      );
    }
  }

  private async deleteReviewWithAggregate(review: ReviewWithRatingTarget) {
    await this.prisma.$transaction(async (tx) => {
      await tx.productReview.delete({ where: { id: review.id } });
      await this.applyProductRatingDelta(
        tx,
        review.productId,
        -review.rating,
        -1,
      );
    });
  }

  private async getOwnedReview(userId: string, reviewId: string) {
    const review = await this.prisma.productReview.findUnique({
      where: { id: reviewId },
      select: { id: true, userId: true, productId: true, rating: true },
    });

    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId) {
      throw new ForbiddenException('You can manage only your own reviews');
    }

    return review;
  }

  private async getReviewTarget(reviewId: string) {
    const review = await this.prisma.productReview.findUnique({
      where: { id: reviewId },
      select: { id: true, productId: true, rating: true },
    });

    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  private async assertProductExists(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) throw new NotFoundException('Product not found');
  }

  private async applyProductRatingDelta(
    tx: Prisma.TransactionClient,
    productId: string,
    ratingDelta: number,
    countDelta: number,
  ) {
    await tx.$executeRaw`
      UPDATE "products"
      SET
        "rating_sum" = GREATEST("rating_sum" + ${ratingDelta}, 0),
        "rating_count" = GREATEST("rating_count" + ${countDelta}, 0),
        "rating_avg" = CASE
          WHEN GREATEST("rating_count" + ${countDelta}, 0) = 0 THEN 0
          ELSE ROUND(
            (
              GREATEST("rating_sum" + ${ratingDelta}, 0)::numeric /
              GREATEST("rating_count" + ${countDelta}, 0)::numeric
            ),
            2
          )::double precision
        END,
        "updated_at" = CURRENT_TIMESTAMP
      WHERE "id" = ${productId}
    `;
  }

  private normalizeComment(comment?: string) {
    const value = comment?.trim();
    return value ? value : null;
  }

  private getPagination(
    query: { page?: number; limit?: number },
    defaultLimit: number,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? defaultLimit;
    return { page, limit, skip: (page - 1) * limit };
  }

  private paginated<T>(data: T[], total: number, page: number, limit: number) {
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private getAdminOrderBy(
    sortBy?: ReviewSortBy,
    sortOrder?: ReviewSortOrder,
  ): Prisma.ProductReviewOrderByWithRelationInput {
    const order = sortOrder ?? ReviewSortOrder.DESC;

    switch (sortBy) {
      case ReviewSortBy.RATING:
        return { rating: order };
      case ReviewSortBy.PRODUCT:
        return { product: { name: order } };
      case ReviewSortBy.USER:
        return { user: { name: order } };
      case ReviewSortBy.CREATED_AT:
      default:
        return { createdAt: order };
    }
  }

  private handleReviewMutationError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Order item has already been reviewed');
      }

      if (error.code === 'P2025') {
        throw new NotFoundException('Review not found');
      }
    }

    throw error;
  }
}
