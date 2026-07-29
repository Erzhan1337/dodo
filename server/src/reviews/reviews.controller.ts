import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { CreateProductReviewDto } from './dto/create-product-review.dto';
import { ProductReviewsQueryDto } from './dto/reviews-query.dto';
import { UpdateProductReviewDto } from './dto/update-product-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('product/:productId')
  getProductReviews(
    @Param('productId') productId: string,
    @Query() query: ProductReviewsQueryDto,
  ) {
    return this.reviewsService.getProductReviews(productId, query);
  }

  @Get('my')
  @Auth()
  getMyReviews(@CurrentUser('id') userId: string) {
    return this.reviewsService.getMyReviews(userId);
  }

  @Post()
  @Auth()
  createReview(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateProductReviewDto,
  ) {
    return this.reviewsService.createReview(userId, dto);
  }

  @Patch(':id')
  @Auth()
  updateReview(
    @CurrentUser('id') userId: string,
    @Param('id') reviewId: string,
    @Body() dto: UpdateProductReviewDto,
  ) {
    return this.reviewsService.updateReview(userId, reviewId, dto);
  }

  @Delete(':id')
  @Auth()
  deleteReview(
    @CurrentUser('id') userId: string,
    @Param('id') reviewId: string,
  ) {
    return this.reviewsService.deleteReview(userId, reviewId);
  }
}
