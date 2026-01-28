import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          orderBy: { createdAt: 'desc' },
          include: {
            productItem: { include: { product: true } },
            ingredients: true,
          },
        },
      },
    });
    if (cart) return { ...cart, totalAmount: cart.totalPrice };

    const newCart = await this.prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            productItem: { include: { product: true } },
            ingredients: true,
          },
        },
      },
    });
    return { ...newCart, totalAmount: newCart.totalPrice };
  }

  async updateCartTotalAmount(cartId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            productItem: true,
            ingredients: true,
          },
        },
      },
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
    const updatedCart = await this.prisma.cart.update({
      where: { id: cartId },
      data: { totalPrice: totalAmount },
      include: {
        items: {
          orderBy: { createdAt: 'desc' },
          include: {
            productItem: { include: { product: true } },
            ingredients: true,
          },
        },
      },
    });
    return { ...updatedCart, totalAmount: updatedCart.totalPrice };
  }

  async addToCart(userId: string, dto: any) {
    const cart = await this.getCart(userId);

    const existingCartItem = cart.items.find((item) => {
      if (item.productItemId !== dto.productItemId) return false;

      const itemIngIds = item.ingredients.map((ing) => ing.id).sort();
      const dtoIngIds = (dto.ingredients || []).sort();
      return (
        itemIngIds.length === dtoIngIds.length &&
        itemIngIds.every((val, index) => val === dtoIngIds[index])
      );
    });

    if (existingCartItem) {
      await this.prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1 },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productItemId: dto.productItemId,
          quantity: 1,
          ingredients: {
            connect: dto.ingredients?.map((id: string) => ({ id })) || [],
          },
        },
      });
    }

    return this.updateCartTotalAmount(cart.id);
  }

  async updateItemQuantity(userId: string, itemId: string, dto: any) {
    const cart = await this.getCart(userId);

    const cartItem = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!cartItem) return cart;

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    return this.updateCartTotalAmount(cart.id);
  }

  async removeCartItem(userId: string, itemId: string) {
    const cart = await this.getCart(userId);

    await this.prisma.cartItem.deleteMany({
      where: { id: itemId, cartId: cart.id },
    });

    return this.updateCartTotalAmount(cart.id);
  }
}
