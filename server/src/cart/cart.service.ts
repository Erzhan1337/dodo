import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

export const GUEST_CART_TOKEN_COOKIE = 'guestCartToken';

type CartIdentity = {
  userId?: string | null;
  guestCartToken?: string | null;
};

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
  private readonly EXPIRE_DAY_GUEST_CART_TOKEN = 30;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async getCart(identity: CartIdentity) {
    if (identity.userId) {
      return this.getAuthenticatedCart(
        identity.userId,
        identity.guestCartToken,
      );
    }

    if (!identity.guestCartToken) {
      return { cart: this.createEmptyCartResponse() };
    }

    const cart = await this.prisma.cart.findUnique({
      where: { guestToken: identity.guestCartToken },
      select: cartResponseSelect,
    });

    if (!cart || cart.userId) {
      return {
        cart: this.createEmptyCartResponse(),
        clearGuestCartToken: true,
      };
    }

    return { cart: this.toCartResponse(cart) };
  }

  async addToCart(identity: CartIdentity, dto: AddCartItemDto) {
    const resolvedCart = await this.getOrCreateMutableCart(identity);

    const cart = await this.prisma.$transaction(async (tx) => {
      await this.lockCart(resolvedCart.cart.id, tx);

      const ingredientIds = await this.validateCartItemInput(dto, tx);
      const ingredientsKey = this.createIngredientsKey(ingredientIds);

      await tx.cartItem.upsert({
        where: {
          cartId_productItemId_ingredientsKey: {
            cartId: resolvedCart.cart.id,
            productItemId: dto.productItemId,
            ingredientsKey,
          },
        },
        update: {
          quantity: { increment: 1 },
        },
        create: {
          cartId: resolvedCart.cart.id,
          productItemId: dto.productItemId,
          ingredientsKey,
          quantity: 1,
          ingredients: {
            connect: ingredientIds.map((id) => ({ id })),
          },
        },
      });

      return this.updateCartTotalAmount(resolvedCart.cart.id, tx);
    });

    return { ...resolvedCart, cart };
  }

  async updateItemQuantity(
    identity: CartIdentity,
    itemId: string,
    dto: UpdateCartItemDto,
  ) {
    const resolvedCart = await this.getMutableCart(identity);

    const cart = await this.prisma.$transaction(async (tx) => {
      await this.lockCart(resolvedCart.cart.id, tx);

      const cartItem = await tx.cartItem.findFirst({
        where: { id: itemId, cartId: resolvedCart.cart.id },
        select: { id: true },
      });

      if (!cartItem) {
        throw new NotFoundException('Cart item not found');
      }

      await tx.cartItem.update({
        where: { id: itemId },
        data: { quantity: dto.quantity },
      });

      return this.updateCartTotalAmount(resolvedCart.cart.id, tx);
    });

    return { ...resolvedCart, cart };
  }

  async removeCartItem(identity: CartIdentity, itemId: string) {
    const resolvedCart = await this.getMutableCart(identity);

    const cart = await this.prisma.$transaction(async (tx) => {
      await this.lockCart(resolvedCart.cart.id, tx);

      const result = await tx.cartItem.deleteMany({
        where: { id: itemId, cartId: resolvedCart.cart.id },
      });

      if (result.count === 0) {
        throw new NotFoundException('Cart item not found');
      }

      return this.updateCartTotalAmount(resolvedCart.cart.id, tx);
    });

    return { ...resolvedCart, cart };
  }

  async removeItemIngredient(
    identity: CartIdentity,
    itemId: string,
    ingredientId: string,
  ) {
    const resolvedCart = await this.getMutableCart(identity);

    const cart = await this.prisma.$transaction(async (tx) => {
      await this.lockCart(resolvedCart.cart.id, tx);

      const cartItem = await tx.cartItem.findFirst({
        where: { id: itemId, cartId: resolvedCart.cart.id },
        select: {
          id: true,
          quantity: true,
          productItemId: true,
          ingredients: { select: { id: true } },
        },
      });

      if (!cartItem) {
        throw new NotFoundException('Cart item not found');
      }

      const remainingIngredientIds = cartItem.ingredients
        .map(({ id }) => id)
        .filter((id) => id !== ingredientId)
        .sort();

      if (remainingIngredientIds.length === cartItem.ingredients.length) {
        throw new NotFoundException('Ingredient not found in cart item');
      }

      const ingredientsKey = this.createIngredientsKey(remainingIngredientIds);
      const existingItem = await tx.cartItem.findFirst({
        where: {
          cartId: resolvedCart.cart.id,
          productItemId: cartItem.productItemId,
          ingredientsKey,
          NOT: { id: cartItem.id },
        },
        select: { id: true },
      });

      if (existingItem) {
        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: { increment: cartItem.quantity } },
        });
        await tx.cartItem.delete({ where: { id: cartItem.id } });
      } else {
        await tx.cartItem.update({
          where: { id: cartItem.id },
          data: {
            ingredientsKey,
            ingredients: {
              set: remainingIngredientIds.map((id) => ({ id })),
            },
          },
        });
      }

      return this.updateCartTotalAmount(resolvedCart.cart.id, tx);
    });

    return { ...resolvedCart, cart };
  }

  async mergeGuestCartIntoUser(userId: string, guestCartToken: string) {
    return this.prisma.$transaction(async (tx) => {
      const guestCart = await tx.cart.findUnique({
        where: { guestToken: guestCartToken },
        select: cartResponseSelect,
      });

      if (!guestCart || guestCart.userId === userId) {
        const userCart = await this.getOrCreateUserCart(userId, tx);
        return this.toCartResponse(userCart);
      }

      if (guestCart.userId) {
        const userCart = await this.getOrCreateUserCart(userId, tx);
        return this.toCartResponse(userCart);
      }

      const userCart = await tx.cart.findUnique({
        where: { userId },
        select: cartResponseSelect,
      });

      if (!userCart) {
        const assignedCart = await tx.cart.update({
          where: { id: guestCart.id },
          data: { userId, guestToken: null },
          select: cartResponseSelect,
        });

        return this.toCartResponse(assignedCart);
      }

      await this.lockCarts([userCart.id, guestCart.id], tx);

      const guestItems = await tx.cartItem.findMany({
        where: { cartId: guestCart.id },
        select: {
          quantity: true,
          productItemId: true,
          ingredientsKey: true,
          ingredients: { select: { id: true } },
        },
      });

      for (const item of guestItems) {
        await tx.cartItem.upsert({
          where: {
            cartId_productItemId_ingredientsKey: {
              cartId: userCart.id,
              productItemId: item.productItemId,
              ingredientsKey: item.ingredientsKey,
            },
          },
          update: {
            quantity: { increment: item.quantity },
          },
          create: {
            cartId: userCart.id,
            productItemId: item.productItemId,
            ingredientsKey: item.ingredientsKey,
            quantity: item.quantity,
            ingredients: {
              connect: item.ingredients.map(({ id }) => ({ id })),
            },
          },
        });
      }

      await tx.cart.delete({ where: { id: guestCart.id } });

      const updatedCart = await this.updateCartTotalAmount(userCart.id, tx);
      return updatedCart ?? this.toCartResponse(userCart);
    });
  }

  addGuestCartTokenToResponse(res: Response, guestCartToken: string) {
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_GUEST_CART_TOKEN);

    res.cookie(
      GUEST_CART_TOKEN_COOKIE,
      guestCartToken,
      this.getCookieOptions(expiresIn),
    );
  }

  removeGuestCartTokenFromResponse(res: Response) {
    res.cookie(GUEST_CART_TOKEN_COOKIE, '', this.getCookieOptions(new Date(0)));
  }

  private async getAuthenticatedCart(
    userId: string,
    guestCartToken?: string | null,
  ) {
    if (guestCartToken) {
      const cart = await this.mergeGuestCartIntoUser(userId, guestCartToken);

      return {
        cart,
        clearGuestCartToken: true,
      };
    }

    const cart = await this.getOrCreateUserCart(userId);
    return { cart: this.toCartResponse(cart) };
  }

  private async getOrCreateMutableCart(identity: CartIdentity) {
    if (identity.userId) {
      return this.getAuthenticatedCart(
        identity.userId,
        identity.guestCartToken,
      );
    }

    return this.getOrCreateGuestCart(identity.guestCartToken);
  }

  private async getMutableCart(identity: CartIdentity) {
    if (identity.userId) {
      return this.getAuthenticatedCart(
        identity.userId,
        identity.guestCartToken,
      );
    }

    if (!identity.guestCartToken) {
      throw new NotFoundException('Cart not found');
    }

    const cart = await this.prisma.cart.findUnique({
      where: { guestToken: identity.guestCartToken },
      select: cartResponseSelect,
    });

    if (!cart || cart.userId) {
      throw new NotFoundException('Cart not found');
    }

    return { cart: this.toCartResponse(cart) };
  }

  private async getOrCreateUserCart(
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

  private async getOrCreateGuestCart(guestCartToken?: string | null) {
    if (guestCartToken) {
      const cart = await this.prisma.cart.findUnique({
        where: { guestToken: guestCartToken },
        select: cartResponseSelect,
      });

      if (cart && !cart.userId) {
        return { cart: this.toCartResponse(cart) };
      }
    }

    const { cart, guestCartToken: newGuestCartToken } =
      await this.createGuestCart();

    return {
      cart,
      guestCartToken: newGuestCartToken,
    };
  }

  private async createGuestCart() {
    for (let attempt = 0; attempt < 2; attempt++) {
      const guestCartToken = randomUUID();

      try {
        const cart = await this.prisma.cart.create({
          data: { guestToken: guestCartToken },
          select: cartResponseSelect,
        });

        return {
          cart: this.toCartResponse(cart),
          guestCartToken,
        };
      } catch (error) {
        if (!this.isUniqueConstraintError(error)) throw error;
      }
    }

    throw new BadRequestException('Failed to create guest cart');
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
    await this.lockCarts([cartId], tx);
  }

  private async lockCarts(cartIds: string[], tx: Prisma.TransactionClient) {
    const uniqueCartIds = [...new Set(cartIds)].sort();
    if (!uniqueCartIds.length) return;

    await tx.$queryRaw`
      SELECT "id"
      FROM "carts"
      WHERE "id" IN (${Prisma.join(uniqueCartIds)})
      ORDER BY "id"
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
    if (
      new Set(normalizedIngredientIds).size !== normalizedIngredientIds.length
    ) {
      throw new BadRequestException('Invalid ingredients');
    }

    return normalizedIngredientIds;
  }

  private createIngredientsKey(ingredientIds: string[]) {
    return ingredientIds.join(',');
  }

  private createEmptyCartResponse() {
    return {
      id: '',
      totalPrice: 0,
      totalAmount: 0,
      userId: null,
      items: [],
    };
  }

  private toCartResponse<T extends { totalPrice: number }>(cart: T) {
    return { ...cart, totalAmount: cart.totalPrice };
  }

  private getCookieOptions(expires: Date) {
    const isProduction = this.configService.getOrThrow('PRODUCTION') === 'true';

    return {
      httpOnly: true,
      domain: isProduction
        ? this.configService.getOrThrow('SERVER_DOMAIN')
        : undefined,
      expires,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    } as const;
  }

  private isUniqueConstraintError(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }
}
