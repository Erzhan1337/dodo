import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { createHash, randomUUID } from 'crypto';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { PromoCodesService } from '../promo-codes/promo-codes.service';

export const GUEST_CART_TOKEN_COOKIE = 'guestCartToken';

type CartIdentity = {
  userId?: string | null;
  guestCartToken?: string | null;
};

type ValidatedCartItemInput = {
  ingredientIds: string[];
  ingredientsKey: string;
  customName?: string;
  customDetails?: Prisma.InputJsonValue;
  customUnitPrice?: number;
};

type CustomPizzaProductItem = {
  id: string;
  price: number;
  size: number | null;
  pizzaType: number | null;
  product: {
    id: string;
    name: string;
    imageUrl: string;
    canBuildHalfAndHalf: boolean;
    ingredients: { id: string; name: string }[];
  };
};

const cartResponseSelect = {
  id: true,
  subtotalPrice: true,
  discountAmount: true,
  totalPrice: true,
  userId: true,
  promoCodeId: true,
  promoCode: {
    select: {
      id: true,
      code: true,
      title: true,
      description: true,
      type: true,
      value: true,
      minOrderAmount: true,
      maxDiscountAmount: true,
      firstOrderOnly: true,
    },
  },
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
      customName: true,
      customDetails: true,
      customUnitPrice: true,
      productItem: { include: { product: true } },
      ingredients: true,
    },
  },
} satisfies Prisma.CartSelect;

const cartTotalSelect = {
  id: true,
  userId: true,
  promoCode: true,
  items: {
    select: {
      quantity: true,
      productItem: {
        select: { price: true },
      },
      customUnitPrice: true,
      ingredients: {
        select: { price: true },
      },
    },
  },
} satisfies Prisma.CartSelect;

@Injectable()
export class CartService {
  private readonly EXPIRE_DAY_GUEST_CART_TOKEN = 30;
  private readonly MAX_CUSTOM_INGREDIENTS = 8;
  private readonly MAX_DOUBLE_INGREDIENTS = 4;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private promoCodesService: PromoCodesService,
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

      const cartItemInput = await this.validateCartItemInput(dto, tx);

      await tx.cartItem.upsert({
        where: {
          cartId_productItemId_ingredientsKey: {
            cartId: resolvedCart.cart.id,
            productItemId: dto.productItemId,
            ingredientsKey: cartItemInput.ingredientsKey,
          },
        },
        update: {
          quantity: { increment: 1 },
        },
        create: {
          cartId: resolvedCart.cart.id,
          productItemId: dto.productItemId,
          ingredientsKey: cartItemInput.ingredientsKey,
          customName: cartItemInput.customName,
          customDetails: cartItemInput.customDetails,
          customUnitPrice: cartItemInput.customUnitPrice,
          quantity: 1,
          ingredients: {
            connect: cartItemInput.ingredientIds.map((id) => ({ id })),
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

  async applyPromoCode(identity: CartIdentity, code: string) {
    const resolvedCart = await this.getMutableCart(identity);

    const cart = await this.prisma.$transaction(async (tx) => {
      await this.lockCart(resolvedCart.cart.id, tx);

      const cartPricing = await tx.cart.findUnique({
        where: { id: resolvedCart.cart.id },
        select: cartTotalSelect,
      });

      if (!cartPricing || cartPricing.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      const subtotalPrice = this.calculateItemsSubtotal(cartPricing.items);
      const { promoCode } = await this.promoCodesService.validatePromoCode(
        code,
        subtotalPrice,
        cartPricing.userId,
        tx,
      );

      await tx.cart.update({
        where: { id: resolvedCart.cart.id },
        data: { promoCodeId: promoCode.id },
      });

      return this.updateCartTotalAmount(resolvedCart.cart.id, tx, {
        throwOnInvalidPromoCode: true,
      });
    });

    return { ...resolvedCart, cart };
  }

  async removePromoCode(identity: CartIdentity) {
    const resolvedCart = await this.getMutableCart(identity);

    const cart = await this.prisma.$transaction(async (tx) => {
      await this.lockCart(resolvedCart.cart.id, tx);

      await tx.cart.update({
        where: { id: resolvedCart.cart.id },
        data: {
          promoCodeId: null,
          discountAmount: 0,
        },
      });

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
          customUnitPrice: true,
          ingredients: { select: { id: true } },
        },
      });

      if (!cartItem) {
        throw new NotFoundException('Cart item not found');
      }

      if (cartItem.customUnitPrice != null) {
        throw new BadRequestException(
          'Custom pizza ingredients should be changed in pizza builder',
        );
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

        const updatedCart = await this.updateCartTotalAmount(assignedCart.id, tx);
        return updatedCart ?? this.toCartResponse(assignedCart);
      }

      await this.lockCarts([userCart.id, guestCart.id], tx);

      const guestItems = await tx.cartItem.findMany({
        where: { cartId: guestCart.id },
        select: {
          quantity: true,
          productItemId: true,
          ingredientsKey: true,
          customName: true,
          customDetails: true,
          customUnitPrice: true,
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
            customName: item.customName,
            customDetails: item.customDetails ?? undefined,
            customUnitPrice: item.customUnitPrice,
            quantity: item.quantity,
            ingredients: {
              connect: item.ingredients.map(({ id }) => ({ id })),
            },
          },
        });
      }

      if (!userCart.promoCodeId && guestCart.promoCodeId) {
        await tx.cart.update({
          where: { id: userCart.id },
          data: { promoCodeId: guestCart.promoCodeId },
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
    options?: { throwOnInvalidPromoCode?: boolean },
  ) {
    const cart = await client.cart.findUnique({
      where: { id: cartId },
      select: cartTotalSelect,
    });
    if (!cart) return;

    const subtotalPrice = this.calculateItemsSubtotal(cart.items);
    let discountAmount = 0;
    let promoCodeId = cart.promoCode?.id ?? null;

    if (cart.promoCode) {
      const calculation = options?.throwOnInvalidPromoCode
        ? await this.promoCodesService.validatePromoCodeRecord(
            cart.promoCode,
            subtotalPrice,
            cart.userId,
            client,
          )
        : await this.promoCodesService.tryValidatePromoCodeRecord(
            cart.promoCode,
            subtotalPrice,
            cart.userId,
            client,
          );

      if (calculation) {
        discountAmount = calculation.discountAmount;
      } else {
        promoCodeId = null;
      }
    }

    const updatedCart = await client.cart.update({
      where: { id: cartId },
      data: {
        subtotalPrice,
        discountAmount,
        totalPrice: Math.max(subtotalPrice - discountAmount, 0),
        promoCodeId,
      },
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
  ): Promise<ValidatedCartItemInput> {
    const productItem = await client.productItem.findUnique({
      where: { id: dto.productItemId },
      select: {
        id: true,
        price: true,
        size: true,
        pizzaType: true,
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            canBuildHalfAndHalf: true,
            ingredients: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!productItem) {
      throw new NotFoundException('Product item not found');
    }

    if (dto.customPizza) {
      return this.validateCustomPizzaInput(dto, productItem, client);
    }

    const ingredientIds = this.normalizeIngredientIds(dto.ingredients);

    if (!ingredientIds.length) {
      return {
        ingredientIds,
        ingredientsKey: this.createIngredientsKey(ingredientIds),
      };
    }

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

    return {
      ingredientIds,
      ingredientsKey: this.createIngredientsKey(ingredientIds),
    };
  }

  private async validateCustomPizzaInput(
    dto: AddCartItemDto,
    productItem: CustomPizzaProductItem,
    client: Prisma.TransactionClient = this.prisma,
  ): Promise<ValidatedCartItemInput> {
    const customPizza = dto.customPizza;
    if (!customPizza) {
      throw new BadRequestException('Custom pizza is required');
    }

    const normalizedLines = customPizza.ingredients
      .map((ingredient) => ({
        id: ingredient.id,
        quantity: ingredient.quantity,
        placement:
          customPizza.format === 'whole' ? 'whole' : ingredient.placement,
      }))
      .sort((a, b) =>
        `${a.id}:${a.placement}`.localeCompare(`${b.id}:${b.placement}`),
      );

    const lineKeys = normalizedLines.map(
      (ingredient) => `${ingredient.id}:${ingredient.placement}`,
    );

    if (new Set(lineKeys).size !== lineKeys.length) {
      throw new BadRequestException('Duplicate custom ingredients');
    }

    const uniqueIngredientIds = [...new Set(normalizedLines.map(({ id }) => id))];
    if (uniqueIngredientIds.length > this.MAX_CUSTOM_INGREDIENTS) {
      throw new BadRequestException('Too many custom ingredients');
    }

    const doubleIngredientsCount = normalizedLines.filter(
      ({ quantity }) => quantity === 2,
    ).length;
    if (doubleIngredientsCount > this.MAX_DOUBLE_INGREDIENTS) {
      throw new BadRequestException('Too many double ingredients');
    }

    const ingredientRecords = uniqueIngredientIds.length
      ? await client.ingredient.findMany({
          where: { id: { in: uniqueIngredientIds } },
          select: { id: true, name: true, price: true },
        })
      : [];

    if (ingredientRecords.length !== uniqueIngredientIds.length) {
      throw new BadRequestException('Invalid ingredients');
    }

    const ingredientById = new Map(
      ingredientRecords.map((ingredient) => [ingredient.id, ingredient]),
    );
    const halfAndHalf = customPizza.halfAndHalf
      ? await this.validateHalfAndHalfInput(customPizza, productItem, client)
      : null;
    const baseIngredientById = new Map(
      [
        ...productItem.product.ingredients,
        ...(halfAndHalf?.rightProductItem.product.ingredients ?? []),
      ].map((ingredient) => [ingredient.id, ingredient]),
    );
    const removedIngredientIds = [
      ...new Set(customPizza.removedIngredientIds ?? []),
    ].sort();

    const invalidRemovedIngredient = removedIngredientIds.find(
      (id) => !baseIngredientById.has(id),
    );
    if (invalidRemovedIngredient) {
      throw new BadRequestException('Invalid removed ingredient');
    }

    let customUnitPrice =
      halfAndHalf?.baseUnitPrice ?? productItem.price;
    const detailedIngredients = normalizedLines.map((line) => {
      const ingredient = ingredientById.get(line.id);
      if (!ingredient) {
        throw new BadRequestException('Invalid ingredients');
      }

      const placementRatio = line.placement === 'whole' ? 1 : 0.5;
      const linePrice = Math.round(
        ingredient.price * line.quantity * placementRatio,
      );
      customUnitPrice += linePrice;

      return {
        id: ingredient.id,
        name: ingredient.name,
        price: ingredient.price,
        quantity: line.quantity,
        placement: line.placement,
        linePrice,
      };
    });

    const customName = this.normalizeCustomName(customPizza.name);
    const customDetails = {
      type: 'pizza-builder',
      version: 1,
      name: customName,
      format: customPizza.format,
      halfAndHalf: halfAndHalf
        ? {
            leftProduct: this.toHalfAndHalfProductDetails(
              halfAndHalf.leftProductItem,
            ),
            rightProduct: this.toHalfAndHalfProductDetails(
              halfAndHalf.rightProductItem,
            ),
            baseUnitPrice: halfAndHalf.baseUnitPrice,
          }
        : null,
      sauce: customPizza.sauce.trim(),
      cheeseMode: customPizza.cheeseMode,
      bakeMode: customPizza.bakeMode?.trim() || 'standard',
      sliceMode: customPizza.sliceMode?.trim() || 'standard',
      ingredients: detailedIngredients,
      removedIngredients: removedIngredientIds.map((id) => {
        const ingredient = baseIngredientById.get(id);
        return {
          id,
          name: ingredient?.name ?? id,
        };
      }),
      unitPrice: customUnitPrice,
    };

    return {
      ingredientIds: uniqueIngredientIds.sort(),
      ingredientsKey: this.createCustomIngredientsKey(customDetails),
      customName,
      customDetails: customDetails as Prisma.InputJsonValue,
      customUnitPrice,
    };
  }

  private async validateHalfAndHalfInput(
    customPizza: NonNullable<AddCartItemDto['customPizza']>,
    leftProductItem: CustomPizzaProductItem,
    client: Prisma.TransactionClient,
  ) {
    const halfAndHalf = customPizza.halfAndHalf;

    if (!halfAndHalf) return null;

    if (customPizza.format !== 'halves') {
      throw new BadRequestException('Half and half pizza should use halves');
    }

    if (halfAndHalf.leftProductItemId !== leftProductItem.id) {
      throw new BadRequestException('Invalid left half product item');
    }

    const rightProductItem = await client.productItem.findUnique({
      where: { id: halfAndHalf.rightProductItemId },
      select: {
        id: true,
        price: true,
        size: true,
        pizzaType: true,
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            canBuildHalfAndHalf: true,
            ingredients: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!rightProductItem) {
      throw new BadRequestException('Invalid right half product item');
    }

    if (
      !leftProductItem.product.canBuildHalfAndHalf ||
      !rightProductItem.product.canBuildHalfAndHalf
    ) {
      throw new BadRequestException('Product does not support half and half');
    }

    if (
      !leftProductItem.size ||
      leftProductItem.size < 30 ||
      leftProductItem.size !== rightProductItem.size ||
      leftProductItem.pizzaType !== rightProductItem.pizzaType
    ) {
      throw new BadRequestException('Half and half products are incompatible');
    }

    return {
      leftProductItem,
      rightProductItem,
      baseUnitPrice: Math.round(
        leftProductItem.price / 2 + rightProductItem.price / 2,
      ),
    };
  }

  private toHalfAndHalfProductDetails(item: CustomPizzaProductItem) {
    return {
      productId: item.product.id,
      productItemId: item.id,
      name: item.product.name,
      imageUrl: item.product.imageUrl,
      price: item.price,
      size: item.size,
      pizzaType: item.pizzaType,
    };
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

  private createCustomIngredientsKey(value: Prisma.InputJsonValue) {
    return `custom:${createHash('sha256')
      .update(JSON.stringify(value))
      .digest('hex')
      .slice(0, 40)}`;
  }

  private normalizeCustomName(name?: string) {
    const normalizedName = name?.trim();
    return normalizedName || 'Моя пицца';
  }

  private createEmptyCartResponse() {
    return {
      id: '',
      subtotalPrice: 0,
      discountAmount: 0,
      totalPrice: 0,
      totalAmount: 0,
      userId: null,
      promoCodeId: null,
      promoCode: null,
      items: [],
    };
  }

  private calculateItemsSubtotal(
    items: Array<{
      quantity: number;
      productItem: { price: number };
      customUnitPrice: number | null;
      ingredients: Array<{ price: number }>;
    }>,
  ) {
    return items.reduce((acc, item) => {
      const ingredientsPrice = item.ingredients.reduce(
        (sum, ing) => sum + ing.price,
        0,
      );
      const unitPrice =
        item.customUnitPrice ?? item.productItem.price + ingredientsPrice;

      return acc + unitPrice * item.quantity;
    }, 0);
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
