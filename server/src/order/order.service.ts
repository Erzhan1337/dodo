import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, STATUS } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeKzPhone } from '../auth/lib/phone';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  adminOrderEventSelect,
  OrderEventsService,
} from './order-events.service';
import { orderPaymentSelect } from '../payment/payment.service';
import { PromoCodesService } from '../promo-codes/promo-codes.service';

type OrderIdentity = {
  userId?: string | null;
  guestCartToken?: string | null;
};

const orderResponseSelect = {
  id: true,
  orderNumber: true,
  token: true,
  status: true,
  updatedAt: true,
  subtotalPrice: true,
  discountAmount: true,
  totalPrice: true,
  promoCode: {
    select: {
      id: true,
      code: true,
      title: true,
      description: true,
    },
  },
  promoCodeSnapshot: true,
  name: true,
  phone: true,
  address: true,
  email: true,
  comment: true,
  createdAt: true,
  payment: { select: orderPaymentSelect },
  items: {
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
          product: { select: { id: true, name: true, imageUrl: true } },
        },
      },
      ingredients: { select: { id: true, name: true } },
      review: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  },
} satisfies Prisma.OrderSelect;

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orderEventsService: OrderEventsService,
    private readonly promoCodesService: PromoCodesService,
  ) {}

  async createOrder(identity: OrderIdentity, dto: CreateOrderDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findFirst({
        where: identity.userId
          ? { userId: identity.userId }
          : { guestToken: identity.guestCartToken ?? undefined, userId: null },
        select: {
          id: true,
          promoCode: true,
          items: {
            select: {
              quantity: true,
              productItemId: true,
              customName: true,
              customDetails: true,
              customUnitPrice: true,
              productItem: { select: { price: true } },
              ingredients: { select: { id: true, price: true } },
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      let subtotalPrice = 0;
      const orderItems = cart.items.map((item) => {
        const ingredientsPrice = item.ingredients.reduce(
          (sum, ing) => sum + ing.price,
          0,
        );
        const unitPrice =
          item.customUnitPrice ?? item.productItem.price + ingredientsPrice;
        subtotalPrice += unitPrice * item.quantity;

        return {
          productItemId: item.productItemId,
          quantity: item.quantity,
          price: unitPrice,
          customName: item.customName,
          customDetails: item.customDetails ?? undefined,
          ingredients: {
            connect: item.ingredients.map((ing) => ({ id: ing.id })),
          },
        };
      });
      let discountAmount = 0;
      let promoCodeId: string | null = null;
      let promoCodeSnapshot: Prisma.InputJsonValue | undefined;

      if (cart.promoCode) {
        const calculation =
          await this.promoCodesService.validatePromoCodeRecord(
            cart.promoCode,
            subtotalPrice,
            identity.userId,
            tx,
          );

        discountAmount = calculation.discountAmount;
        promoCodeId = calculation.promoCode.id;
        promoCodeSnapshot = this.promoCodesService.createSnapshot(
          calculation.promoCode,
          calculation.discountAmount,
        ) as Prisma.InputJsonValue;
      }

      const totalPrice = Math.max(subtotalPrice - discountAmount, 0);

      const order = await tx.order.create({
        data: {
          token: randomUUID(),
          status: STATUS.NEW,
          subtotalPrice,
          discountAmount,
          totalPrice,
          promoCodeId,
          promoCodeSnapshot,
          userId: identity.userId ?? null,
          name: dto.name.trim(),
          phone: normalizeKzPhone(dto.phone),
          address: dto.address.trim(),
          email: dto.email?.trim() || null,
          comment: dto.comment?.trim() || null,
          items: { create: orderItems },
        },
        select: adminOrderEventSelect,
      });

      if (promoCodeId) {
        await tx.promoCodeRedemption.create({
          data: {
            promoCodeId,
            orderId: order.id,
            userId: identity.userId ?? null,
            discountAmount,
          },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      if (identity.userId) {
        await tx.cart.update({
          where: { id: cart.id },
          data: {
            subtotalPrice: 0,
            discountAmount: 0,
            totalPrice: 0,
            promoCodeId: null,
          },
        });
      } else {
        await tx.cart.delete({ where: { id: cart.id } });
      }

      return {
        order,
        clearGuestCartToken: !identity.userId,
      };
    });

    this.orderEventsService.emitAdminOrderCreated(result.order);

    return {
      token: result.order.token,
      clearGuestCartToken: result.clearGuestCartToken,
    };
  }

  async getOrderByToken(token: string) {
    const order = await this.prisma.order.findFirst({
      where: { token },
      select: orderResponseSelect,
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getOrdersByUserId(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: orderResponseSelect,
    });
  }
}
