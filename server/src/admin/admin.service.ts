import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, STATUS, UserRole } from '@prisma/client';
import { hash } from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeKzPhone } from '../auth/lib/phone';
import {
  AdminCategoriesQueryDto,
  AdminCategoriesSortBy,
  AdminIngredientsQueryDto,
  AdminIngredientsSortBy,
  AdminOrdersQueryDto,
  AdminOrdersSortBy,
  AdminPaginationDto,
  AdminProductsQueryDto,
  AdminProductsSortBy,
  AdminUsersQueryDto,
  AdminUsersSortBy,
  SortOrder,
} from './dto/admin-query.dto';
import {
  AdminCreateProductDto,
  AdminProductItemDto,
  AdminUpdateProductDto,
} from './dto/admin-product.dto';
import {
  AdminCreateCategoryDto,
  AdminUpdateCategoryDto,
} from './dto/admin-category.dto';
import {
  AdminCreateIngredientDto,
  AdminUpdateIngredientDto,
} from './dto/admin-ingredient.dto';
import { AdminUpdateOrderStatusDto } from './dto/admin-order.dto';
import {
  AdminCreateUserDto,
  AdminUpdateUserDto,
} from './dto/admin-user.dto';
import { OrderEventsService } from '../order/order-events.service';
import { ReviewsService } from '../reviews/reviews.service';

type AdminEntity = 'product' | 'category' | 'ingredient' | 'order' | 'user';

type DashboardRevenueRow = {
  date: Date | string;
  revenue: number | bigint;
  orders: number | bigint;
};

type DashboardTopProductRow = {
  productId: string;
  name: string;
  quantity: number | bigint;
  revenue: number | bigint;
};

const adminProductInclude = {
  category: true,
  ingredients: { orderBy: { name: 'asc' } },
  items: { orderBy: [{ size: 'asc' }, { pizzaType: 'asc' }, { price: 'asc' }] },
} satisfies Prisma.ProductInclude;

const adminOrderSelect = {
  id: true,
  orderNumber: true,
  token: true,
  status: true,
  totalPrice: true,
  userId: true,
  name: true,
  phone: true,
  address: true,
  email: true,
  comment: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, name: true, phone: true, email: true } },
  _count: { select: { items: true } },
} satisfies Prisma.OrderSelect;

const adminOrderDetailsSelect = {
  ...adminOrderSelect,
  items: {
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      quantity: true,
      price: true,
      customName: true,
      customDetails: true,
      productItem: {
        select: {
          id: true,
          size: true,
          pizzaType: true,
          imageUrl: true,
          product: { select: { id: true, name: true, imageUrl: true } },
        },
      },
      ingredients: { select: { id: true, name: true, price: true } },
    },
  },
} satisfies Prisma.OrderSelect;

const adminUserSelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  address: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { orders: true } },
} satisfies Prisma.UserSelect;

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly orderEventsService: OrderEventsService,
    private readonly reviewsService: ReviewsService,
  ) {}

  async getDashboard() {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const rangeStart = new Date(today);
    rangeStart.setDate(rangeStart.getDate() - 13);

    const [
      ordersTotal,
      ordersToday,
      productsTotal,
      usersTotal,
      pendingOrders,
      succeededRevenue,
      revenueToday,
      averageOrderValue,
      statusBreakdown,
      revenueRows,
      topProducts,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { createdAt: { gte: today } } }),
      this.prisma.product.count(),
      this.prisma.user.count(),
      this.prisma.order.count({ where: { status: STATUS.PENDING } }),
      this.prisma.order.aggregate({
        where: { status: STATUS.SUCCEEDED },
        _sum: { totalPrice: true },
      }),
      this.prisma.order.aggregate({
        where: { status: STATUS.SUCCEEDED, createdAt: { gte: today } },
        _sum: { totalPrice: true },
      }),
      this.prisma.order.aggregate({
        where: { status: STATUS.SUCCEEDED },
        _avg: { totalPrice: true },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true },
        _sum: { totalPrice: true },
      }),
      this.prisma.$queryRaw<DashboardRevenueRow[]>`
        SELECT
          date_trunc('day', "created_at")::date AS "date",
          COALESCE(SUM(CASE WHEN "status" = 'SUCCEEDED' THEN "total_price" ELSE 0 END), 0)::int AS "revenue",
          COUNT(*)::int AS "orders"
        FROM "orders"
        WHERE "created_at" >= ${rangeStart}
        GROUP BY 1
        ORDER BY 1 ASC
      `,
      this.prisma.$queryRaw<DashboardTopProductRow[]>`
        SELECT
          "products"."id" AS "productId",
          "products"."name" AS "name",
          COALESCE(SUM("order_items"."quantity"), 0)::int AS "quantity",
          COALESCE(SUM("order_items"."quantity" * "order_items"."price"), 0)::int AS "revenue"
        FROM "order_items"
        JOIN "product_items" ON "product_items"."id" = "order_items"."product_item_id"
        JOIN "products" ON "products"."id" = "product_items"."product_id"
        GROUP BY "products"."id", "products"."name"
        ORDER BY "quantity" DESC
        LIMIT 5
      `,
    ]);

    const revenueByDay = this.fillRevenueSeries(rangeStart, revenueRows);

    return {
      metrics: {
        ordersTotal,
        ordersToday,
        productsTotal,
        usersTotal,
        pendingOrders,
        totalRevenue: succeededRevenue._sum.totalPrice ?? 0,
        todayRevenue: revenueToday._sum.totalPrice ?? 0,
        averageOrderValue: Math.round(averageOrderValue._avg.totalPrice ?? 0),
      },
      statusBreakdown: statusBreakdown.map((item) => ({
        status: item.status,
        count: item._count._all,
        totalPrice: item._sum.totalPrice ?? 0,
      })),
      revenueByDay,
      topProducts: topProducts.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: Number(item.quantity),
        revenue: Number(item.revenue),
      })),
    };
  }

  async getProducts(query: AdminProductsQueryDto) {
    const { page, limit, skip } = this.getPagination(query);
    const search = this.getSearch(query.search);
    const sortOrder = this.getSortOrder(query.sortOrder);
    const sortBy = query.sortBy ?? AdminProductsSortBy.CREATED_AT;

    const where: Prisma.ProductWhereInput = {
      categoryId: query.categoryId,
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { category: { name: { contains: search, mode: 'insensitive' } } },
          ]
        : undefined,
    };

    const total = await this.prisma.product.count({ where });

    if (sortBy === AdminProductsSortBy.MIN_PRICE) {
      const products = await this.getProductsSortedByMinPrice({
        where,
        sortOrder,
        skip,
        limit,
      });

      return this.paginated(
        products.map((product) => this.withProductPriceRange(product)),
        total,
        page,
        limit,
      );
    }

    const orderBy = this.getProductOrderBy(sortBy, sortOrder);
    const products = await this.prisma.product.findMany({
      where,
      include: adminProductInclude,
      orderBy,
      skip,
      take: limit,
    });

    return this.paginated(
      products.map((product) => this.withProductPriceRange(product)),
      total,
      page,
      limit,
    );
  }

  async getProduct(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: adminProductInclude,
    });

    if (!product) throw new NotFoundException('Product not found');

    return this.withProductPriceRange(product);
  }

  async createProduct(adminId: string, dto: AdminCreateProductDto) {
    const ingredientIds = this.unique(dto.ingredientIds);
    await this.assertIngredientsExist(ingredientIds);

    const product = await this.prisma.product.create({
      data: {
        name: dto.name.trim(),
        description: dto.description.trim(),
        imageUrl: dto.imageUrl.trim(),
        categoryId: dto.categoryId,
        canBuildHalfAndHalf: dto.canBuildHalfAndHalf ?? false,
        ingredients: { connect: ingredientIds.map((id) => ({ id })) },
        items: { create: dto.items.map((item) => this.toProductItemData(item)) },
      },
      include: adminProductInclude,
    });

    this.logAction(adminId, 'created product', product.id);
    return this.withProductPriceRange(product);
  }

  async updateProduct(
    adminId: string,
    productId: string,
    dto: AdminUpdateProductDto,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, items: { select: { id: true } } },
    });

    if (!product) throw new NotFoundException('Product not found');

    const ingredientIds =
      dto.ingredientIds !== undefined ? this.unique(dto.ingredientIds) : null;
    if (ingredientIds) await this.assertIngredientsExist(ingredientIds);

    await this.prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: {
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.description !== undefined
            ? { description: dto.description.trim() }
            : {}),
          ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl.trim() } : {}),
          ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
          ...(dto.canBuildHalfAndHalf !== undefined
            ? { canBuildHalfAndHalf: dto.canBuildHalfAndHalf }
            : {}),
          ...(ingredientIds
            ? { ingredients: { set: ingredientIds.map((id) => ({ id })) } }
            : {}),
        },
      });

      if (dto.items !== undefined) {
        await this.syncProductItems(tx, productId, product.items, dto.items);
      }
    });

    this.logAction(adminId, 'updated product', productId);
    return this.getProduct(productId);
  }

  async deleteProduct(adminId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, items: { select: { id: true } } },
    });

    if (!product) throw new NotFoundException('Product not found');

    const itemIds = product.items.map((item) => item.id);
    await this.assertProductItemsCanBeRemoved(itemIds);

    await this.prisma.$transaction(async (tx) => {
      await tx.productItem.deleteMany({ where: { productId } });
      await tx.product.delete({ where: { id: productId } });
    });

    this.logAction(adminId, 'deleted product', productId);
    return { id: productId };
  }

  async getOrders(query: AdminOrdersQueryDto) {
    const { page, limit, skip } = this.getPagination(query);
    const search = this.getSearch(query.search);
    const sortOrder = this.getSortOrder(query.sortOrder);
    const sortBy = query.sortBy ?? AdminOrdersSortBy.CREATED_AT;

    const where: Prisma.OrderWhereInput = {
      status: query.status,
      OR: search
        ? [
            { token: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [total, orders] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        select: adminOrderSelect,
        orderBy: this.getOrderOrderBy(sortBy, sortOrder),
        skip,
        take: limit,
      }),
    ]);

    return this.paginated(orders, total, page, limit);
  }

  async getOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: adminOrderDetailsSelect,
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateOrderStatus(
    adminId: string,
    orderId: string,
    dto: AdminUpdateOrderStatusDto,
  ) {
    await this.assertExists('order', orderId);

    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status },
      select: adminOrderSelect,
    });

    this.orderEventsService.emitStatusChanged(order);
    this.logAction(adminId, `updated order status to ${dto.status}`, orderId);
    return order;
  }

  async deleteOrder(adminId: string, orderId: string) {
    await this.assertExists('order', orderId);

    await this.prisma.$transaction(async (tx) => {
      await this.reviewsService.deleteReviewsForOrder(tx, orderId);
      await tx.orderItem.deleteMany({ where: { orderId } });
      await tx.order.delete({ where: { id: orderId } });
    });

    this.logAction(adminId, 'deleted order', orderId);
    return { id: orderId };
  }

  async getUsers(query: AdminUsersQueryDto) {
    const { page, limit, skip } = this.getPagination(query);
    const search = this.getSearch(query.search);
    const sortOrder = this.getSortOrder(query.sortOrder);
    const sortBy = query.sortBy ?? AdminUsersSortBy.CREATED_AT;

    const where: Prisma.UserWhereInput = {
      role: query.role,
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: adminUserSelect,
        orderBy: this.getUserOrderBy(sortBy, sortOrder),
        skip,
        take: limit,
      }),
    ]);

    return this.paginated(users, total, page, limit);
  }

  async createUser(adminId: string, dto: AdminCreateUserDto) {
    try {
      const user = await this.prisma.user.create({
        data: {
          name: dto.name.trim(),
          phone: normalizeKzPhone(dto.phone),
          email: dto.email?.trim() || null,
          address: dto.address?.trim() || null,
          password: await hash(dto.password),
          role: dto.role ?? UserRole.CUSTOMER,
        },
        select: adminUserSelect,
      });

      this.logAction(adminId, 'created user', user.id);
      return user;
    } catch (error) {
      this.handleMutationError(error, 'user');
    }
  }

  async updateUser(
    adminId: string,
    userId: string,
    dto: AdminUpdateUserDto,
  ) {
    if (adminId === userId && dto.role && dto.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You cannot remove your own admin role');
    }

    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.phone !== undefined
            ? { phone: normalizeKzPhone(dto.phone) }
            : {}),
          ...(dto.email !== undefined ? { email: dto.email?.trim() || null } : {}),
          ...(dto.address !== undefined
            ? { address: dto.address?.trim() || null }
            : {}),
          ...(dto.password !== undefined
            ? { password: await hash(dto.password) }
            : {}),
          ...(dto.role !== undefined ? { role: dto.role } : {}),
        },
        select: adminUserSelect,
      });

      this.logAction(adminId, 'updated user', userId);
      return user;
    } catch (error) {
      this.handleMutationError(error, 'user');
    }
  }

  async deleteUser(adminId: string, userId: string) {
    if (adminId === userId) {
      throw new ForbiddenException('You cannot delete your own user');
    }

    try {
      await this.prisma.user.delete({ where: { id: userId } });
      this.logAction(adminId, 'deleted user', userId);
      return { id: userId };
    } catch (error) {
      this.handleMutationError(error, 'user');
    }
  }

  async getCategories(query: AdminCategoriesQueryDto) {
    const { page, limit, skip } = this.getPagination(query);
    const search = this.getSearch(query.search);
    const sortOrder = this.getSortOrder(query.sortOrder);
    const sortBy = query.sortBy ?? AdminCategoriesSortBy.ID;

    const where: Prisma.CategoryWhereInput = search
      ? { name: { contains: search, mode: 'insensitive' } }
      : {};

    const [total, categories] = await Promise.all([
      this.prisma.category.count({ where }),
      this.prisma.category.findMany({
        where,
        include: { _count: { select: { products: true } } },
        orderBy: this.getCategoryOrderBy(sortBy, sortOrder),
        skip,
        take: limit,
      }),
    ]);

    return this.paginated(categories, total, page, limit);
  }

  async createCategory(adminId: string, dto: AdminCreateCategoryDto) {
    try {
      const category = await this.prisma.category.create({
        data: { name: dto.name.trim() },
        include: { _count: { select: { products: true } } },
      });
      this.logAction(adminId, 'created category', String(category.id));
      return category;
    } catch (error) {
      this.handleMutationError(error, 'category');
    }
  }

  async updateCategory(
    adminId: string,
    categoryId: number,
    dto: AdminUpdateCategoryDto,
  ) {
    try {
      const category = await this.prisma.category.update({
        where: { id: categoryId },
        data: { ...(dto.name !== undefined ? { name: dto.name.trim() } : {}) },
        include: { _count: { select: { products: true } } },
      });
      this.logAction(adminId, 'updated category', String(categoryId));
      return category;
    } catch (error) {
      this.handleMutationError(error, 'category');
    }
  }

  async deleteCategory(adminId: string, categoryId: number) {
    const products = await this.prisma.product.count({
      where: { categoryId },
    });
    if (products > 0) {
      throw new BadRequestException('Category contains products');
    }

    try {
      await this.prisma.category.delete({ where: { id: categoryId } });
      this.logAction(adminId, 'deleted category', String(categoryId));
      return { id: categoryId };
    } catch (error) {
      this.handleMutationError(error, 'category');
    }
  }

  async getIngredients(query: AdminIngredientsQueryDto) {
    const { page, limit, skip } = this.getPagination(query);
    const search = this.getSearch(query.search);
    const sortOrder = this.getSortOrder(query.sortOrder);
    const sortBy = query.sortBy ?? AdminIngredientsSortBy.NAME;

    const where: Prisma.IngredientWhereInput = search
      ? { name: { contains: search, mode: 'insensitive' } }
      : {};

    const [total, ingredients] = await Promise.all([
      this.prisma.ingredient.count({ where }),
      this.prisma.ingredient.findMany({
        where,
        include: {
          _count: {
            select: { products: true, cartItems: true, orderItems: true },
          },
        },
        orderBy: this.getIngredientOrderBy(sortBy, sortOrder),
        skip,
        take: limit,
      }),
    ]);

    return this.paginated(ingredients, total, page, limit);
  }

  async createIngredient(adminId: string, dto: AdminCreateIngredientDto) {
    const ingredient = await this.prisma.ingredient.create({
      data: {
        name: dto.name.trim(),
        price: dto.price,
        imageUrl: dto.imageUrl.trim(),
      },
      include: {
        _count: { select: { products: true, cartItems: true, orderItems: true } },
      },
    });

    this.logAction(adminId, 'created ingredient', ingredient.id);
    return ingredient;
  }

  async updateIngredient(
    adminId: string,
    ingredientId: string,
    dto: AdminUpdateIngredientDto,
  ) {
    try {
      const ingredient = await this.prisma.ingredient.update({
        where: { id: ingredientId },
        data: {
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.price !== undefined ? { price: dto.price } : {}),
          ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl.trim() } : {}),
        },
        include: {
          _count: {
            select: { products: true, cartItems: true, orderItems: true },
          },
        },
      });

      this.logAction(adminId, 'updated ingredient', ingredientId);
      return ingredient;
    } catch (error) {
      this.handleMutationError(error, 'ingredient');
    }
  }

  async deleteIngredient(adminId: string, ingredientId: string) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id: ingredientId },
      include: {
        _count: { select: { products: true, cartItems: true, orderItems: true } },
      },
    });

    if (!ingredient) throw new NotFoundException('Ingredient not found');

    const usage =
      ingredient._count.products +
      ingredient._count.cartItems +
      ingredient._count.orderItems;
    if (usage > 0) {
      throw new BadRequestException('Ingredient is used and cannot be deleted');
    }

    await this.prisma.ingredient.delete({ where: { id: ingredientId } });
    this.logAction(adminId, 'deleted ingredient', ingredientId);
    return { id: ingredientId };
  }

  private getPagination(query: AdminPaginationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
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

  private getSearch(search?: string) {
    const value = search?.trim();
    return value ? value : undefined;
  }

  private getSortOrder(sortOrder?: SortOrder) {
    return sortOrder ?? SortOrder.DESC;
  }

  private getProductOrderBy(
    sortBy: AdminProductsSortBy,
    sortOrder: SortOrder,
  ): Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] {
    switch (sortBy) {
      case AdminProductsSortBy.NAME:
        return { name: sortOrder };
      case AdminProductsSortBy.CATEGORY:
        return { category: { name: sortOrder } };
      case AdminProductsSortBy.RATING:
        return [
          { ratingAvg: sortOrder },
          { ratingCount: sortOrder },
          { createdAt: 'desc' },
        ];
      case AdminProductsSortBy.UPDATED_AT:
        return { updatedAt: sortOrder };
      case AdminProductsSortBy.CREATED_AT:
      default:
        return { createdAt: sortOrder };
    }
  }

  private getOrderOrderBy(
    sortBy: AdminOrdersSortBy,
    sortOrder: SortOrder,
  ): Prisma.OrderOrderByWithRelationInput {
    switch (sortBy) {
      case AdminOrdersSortBy.TOTAL_PRICE:
        return { totalPrice: sortOrder };
      case AdminOrdersSortBy.STATUS:
        return { status: sortOrder };
      case AdminOrdersSortBy.NAME:
        return { name: sortOrder };
      case AdminOrdersSortBy.CREATED_AT:
      default:
        return { createdAt: sortOrder };
    }
  }

  private getUserOrderBy(
    sortBy: AdminUsersSortBy,
    sortOrder: SortOrder,
  ): Prisma.UserOrderByWithRelationInput {
    switch (sortBy) {
      case AdminUsersSortBy.NAME:
        return { name: sortOrder };
      case AdminUsersSortBy.PHONE:
        return { phone: sortOrder };
      case AdminUsersSortBy.EMAIL:
        return { email: sortOrder };
      case AdminUsersSortBy.ROLE:
        return { role: sortOrder };
      case AdminUsersSortBy.CREATED_AT:
      default:
        return { createdAt: sortOrder };
    }
  }

  private getCategoryOrderBy(
    sortBy: AdminCategoriesSortBy,
    sortOrder: SortOrder,
  ): Prisma.CategoryOrderByWithRelationInput {
    switch (sortBy) {
      case AdminCategoriesSortBy.NAME:
        return { name: sortOrder };
      case AdminCategoriesSortBy.PRODUCTS:
        return { products: { _count: sortOrder } };
      case AdminCategoriesSortBy.CREATED_AT:
        return { createdAt: sortOrder };
      case AdminCategoriesSortBy.ID:
      default:
        return { id: sortOrder };
    }
  }

  private getIngredientOrderBy(
    sortBy: AdminIngredientsSortBy,
    sortOrder: SortOrder,
  ): Prisma.IngredientOrderByWithRelationInput {
    switch (sortBy) {
      case AdminIngredientsSortBy.PRICE:
        return { price: sortOrder };
      case AdminIngredientsSortBy.PRODUCTS:
        return { products: { _count: sortOrder } };
      case AdminIngredientsSortBy.CREATED_AT:
        return { createdAt: sortOrder };
      case AdminIngredientsSortBy.NAME:
      default:
        return { name: sortOrder };
    }
  }

  private async getProductsSortedByMinPrice({
    where,
    sortOrder,
    skip,
    limit,
  }: {
    where: Prisma.ProductWhereInput;
    sortOrder: SortOrder;
    skip: number;
    limit: number;
  }) {
    const orderDirection = sortOrder === SortOrder.DESC ? 'desc' : 'asc';
    const groupedItems = await this.prisma.productItem.groupBy({
      by: ['productId'],
      where: { product: where },
      _min: { price: true },
      orderBy: { _min: { price: orderDirection } },
      skip,
      take: limit,
    });

    if (groupedItems.length === 0) return [];

    const order = new Map(
      groupedItems.map((item, index) => [item.productId, index]),
    );
    const products = await this.prisma.product.findMany({
      where: { id: { in: groupedItems.map((item) => item.productId) } },
      include: adminProductInclude,
    });

    return products.sort((a, b) => {
      return (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0);
    });
  }

  private withProductPriceRange<
    T extends Prisma.ProductGetPayload<{ include: typeof adminProductInclude }>,
  >(product: T) {
    const prices = product.items.map((item) => item.price);
    return {
      ...product,
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
    };
  }

  private toProductItemData(item: AdminProductItemDto) {
    return {
      price: item.price,
      size: item.size ?? null,
      pizzaType: item.pizzaType ?? null,
      imageUrl: item.imageUrl.trim(),
    };
  }

  private async syncProductItems(
    tx: Prisma.TransactionClient,
    productId: string,
    existingItems: { id: string }[],
    incomingItems: AdminProductItemDto[],
  ) {
    const existingIds = new Set(existingItems.map((item) => item.id));
    const incomingIds = new Set(
      incomingItems
        .map((item) => item.id)
        .filter((id): id is string => Boolean(id)),
    );

    for (const incomingId of incomingIds) {
      if (!existingIds.has(incomingId)) {
        throw new BadRequestException('Product item does not belong to product');
      }
    }

    const itemIdsToDelete = existingItems
      .map((item) => item.id)
      .filter((id) => !incomingIds.has(id));
    await this.assertProductItemsCanBeRemoved(itemIdsToDelete);

    if (itemIdsToDelete.length > 0) {
      await tx.productItem.deleteMany({
        where: { id: { in: itemIdsToDelete }, productId },
      });
    }

    for (const item of incomingItems) {
      const data = this.toProductItemData(item);
      if (item.id) {
        await tx.productItem.update({
          where: { id: item.id },
          data,
        });
      } else {
        await tx.productItem.create({
          data: { ...data, productId },
        });
      }
    }
  }

  private async assertProductItemsCanBeRemoved(itemIds: string[]) {
    if (itemIds.length === 0) return;

    const [cartItems, orderItems] = await Promise.all([
      this.prisma.cartItem.count({ where: { productItemId: { in: itemIds } } }),
      this.prisma.orderItem.count({ where: { productItemId: { in: itemIds } } }),
    ]);

    if (cartItems + orderItems > 0) {
      throw new BadRequestException(
        'Product item is used in carts or orders and cannot be deleted',
      );
    }
  }

  private async assertIngredientsExist(ingredientIds: string[]) {
    if (ingredientIds.length === 0) return;

    const count = await this.prisma.ingredient.count({
      where: { id: { in: ingredientIds } },
    });

    if (count !== ingredientIds.length) {
      throw new BadRequestException('One or more ingredients do not exist');
    }
  }

  private async assertExists(entity: AdminEntity, id: string) {
    const exists =
      entity === 'order'
        ? await this.prisma.order.findUnique({
            where: { id },
            select: { id: true },
          })
        : null;

    if (!exists) {
      throw new NotFoundException(`${this.capitalize(entity)} not found`);
    }
  }

  private fillRevenueSeries(start: Date, rows: DashboardRevenueRow[]) {
    const byDate = new Map(
      rows.map((row) => [
        this.toDateKey(row.date),
        { revenue: Number(row.revenue), orders: Number(row.orders) },
      ]),
    );

    return Array.from({ length: 14 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const key = this.toDateKey(date);
      const value = byDate.get(key);

      return {
        date: key,
        revenue: value?.revenue ?? 0,
        orders: value?.orders ?? 0,
      };
    });
  }

  private toDateKey(date: Date | string) {
    return new Date(date).toISOString().slice(0, 10);
  }

  private unique(values: string[]) {
    return [...new Set(values)];
  }

  private capitalize(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private handleMutationError(error: unknown, entity: AdminEntity): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new BadRequestException(`${this.capitalize(entity)} already exists`);
      }

      if (error.code === 'P2003') {
        throw new BadRequestException(`${this.capitalize(entity)} is in use`);
      }

      if (error.code === 'P2025') {
        throw new NotFoundException(`${this.capitalize(entity)} not found`);
      }
    }

    throw error;
  }

  private logAction(adminId: string, action: string, targetId: string) {
    this.logger.log(`admin=${adminId} action="${action}" target=${targetId}`);
  }
}
