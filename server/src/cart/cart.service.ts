import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

const cartResponseSelect = {
  id: true,
  totalPrice: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  items: {
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      quantity: true,
      productItemId: true,
      cartId: true,
      createdAt: true,
      updatedAt: true,
      productItem: { include: { product: true } },
      ingredients: true,
    },
  },
} satisfies Prisma.CartSelect;

const cartTotalSelect = {
  items: {
    select: {
      quantity: true,
      productItem: {
        select: { price: true },
      },
      ingredients: {
        select: { price: true },
      },
    },
  },
} satisfies Prisma.CartSelect;

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    return this.toCartResponse(cart);
  }

  async addToCart(userId: string, dto: AddCartItemDto) {
    const cart = await this.getOrCreateCart(userId);

    return this.prisma.$transaction(async (tx) => {
      await this.lockCart(cart.id, tx);

      const ingredientIds = await this.validateCartItemInput(dto, tx);
      const ingredientsKey = this.createIngredientsKey(ingredientIds);

      await tx.cartItem.upsert({
        where: {
          cartId_productItemId_ingredientsKey: {
            cartId: cart.id,
            productItemId: dto.productItemId,
            ingredientsKey,
          },
        },
        update: {
          quantity: { increment: 1 },
        },
        create: {
          cartId: cart.id,
          productItemId: dto.productItemId,
          ingredientsKey,
          quantity: 1,
          ingredients: {
            connect: ingredientIds.map((id) => ({ id })),
          },
        },
      });

      return this.updateCartTotalAmount(cart.id, tx);
    });
  }

  async updateItemQuantity(
    userId: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ) {
    const cart = await this.getOrCreateCart(userId);

    return this.prisma.$transaction(async (tx) => {
      await this.lockCart(cart.id, tx);

      const cartItem = await tx.cartItem.findFirst({
        where: { id: itemId, cartId: cart.id },
        select: { id: true },
      });

      if (!cartItem) {
        throw new NotFoundException('Cart item not found');
      }

      await tx.cartItem.update({
        where: { id: itemId },
        data: { quantity: dto.quantity },
      });

      return this.updateCartTotalAmount(cart.id, tx);
    });
  }

  async removeCartItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);

    return this.prisma.$transaction(async (tx) => {
      await this.lockCart(cart.id, tx);

      const result = await tx.cartItem.deleteMany({
        where: { id: itemId, cartId: cart.id },
      });

      if (result.count === 0) {
        throw new NotFoundException('Cart item not found');
      }

      return this.updateCartTotalAmount(cart.id, tx);
    });
  }

  private async getOrCreateCart(
    userId: string,
    client: Prisma.TransactionClient = this.prisma,
  ) {
    try {
      return await client.cart.upsert({
        where: { userId },
        update: {},
        create: { userId },
        select: cartResponseSelect,
      });
    } catch (error) {
      if (!this.isUniqueConstraintError(error)) throw error;

      const cart = await client.cart.findUnique({
        where: { userId },
        select: cartResponseSelect,
      });

      if (!cart) throw error;

      return cart;
    }
  }

  private async updateCartTotalAmount(
    cartId: string,
    client: Prisma.TransactionClient = this.prisma,
  ) {
    const cart = await client.cart.findUnique({
      where: { id: cartId },
      select: cartTotalSelect,
    });
    if (!cart) return;

    const totalAmount = cart.items.reduce((acc, item) => {
      const productPrice = item.productItem.price;
      const ingredientsPrice = item.ingredients.reduce(
        (sum, ing) => sum + ing.price,
        0,
      );
      return acc + (productPrice + ingredientsPrice) * item.quantity;
    }, 0);

    const updatedCart = await client.cart.update({
      where: { id: cartId },
      data: { totalPrice: totalAmount },
      select: cartResponseSelect,
    });

    return this.toCartResponse(updatedCart);
  }

  private async lockCart(cartId: string, tx: Prisma.TransactionClient) {
    await tx.$queryRaw`
      SELECT "id"
      FROM "carts"
      WHERE "id" = ${cartId}
      FOR UPDATE
    `;
  }

  private async validateCartItemInput(
    dto: AddCartItemDto,
    client: Prisma.TransactionClient = this.prisma,
  ) {
    const productItem = await client.productItem.findUnique({
      where: { id: dto.productItemId },
      select: { id: true },
    });

    if (!productItem) {
      throw new NotFoundException('Product item not found');
    }

    const ingredientIds = this.normalizeIngredientIds(dto.ingredients);

    if (!ingredientIds.length) return ingredientIds;

    const ingredients = await client.ingredient.findMany({
      where: {
        id: {
          in: ingredientIds,
        },
      },
      select: { id: true },
    });

    if (ingredients.length !== ingredientIds.length) {
      throw new BadRequestException('Invalid ingredients');
    }

    return ingredientIds;
  }

  private normalizeIngredientIds(ingredientIds?: string[]) {
    if (!ingredientIds?.length) return [];

    const normalizedIngredientIds = [...ingredientIds].sort();
    if (new Set(normalizedIngredientIds).size !== normalizedIngredientIds.length) {
      throw new BadRequestException('Invalid ingredients');
    }

    return normalizedIngredientIds;
  }

  private createIngredientsKey(ingredientIds: string[]) {
    return ingredientIds.join(',');
  }

  private toCartResponse<T extends { totalPrice: number }>(cart: T) {
    return { ...cart, totalAmount: cart.totalPrice };
  }

  private isUniqueConstraintError(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }
}
