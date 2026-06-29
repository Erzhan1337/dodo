import { Injectable } from '@nestjs/common';
import { PaymentProvider, PaymentStatus, Prisma, STATUS } from '@prisma/client';
import type { Server } from 'socket.io';

type OrderPaymentEvent = {
  id: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  currency: string;
  checkoutUrl: string | null;
  paidAt: Date | string | null;
  canceledAt: Date | string | null;
  failedAt: Date | string | null;
};

export type OrderStatusEvent = {
  id: string;
  token: string;
  status: STATUS;
  updatedAt: Date | string;
  payment?: OrderPaymentEvent | null;
};

const eventPaymentSelect = {
  id: true,
  provider: true,
  status: true,
  amount: true,
  currency: true,
  checkoutUrl: true,
  paidAt: true,
  canceledAt: true,
  failedAt: true,
} satisfies Prisma.PaymentSelect;

export const adminOrderEventSelect = {
  id: true,
  orderNumber: true,
  token: true,
  status: true,
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
  userId: true,
  name: true,
  phone: true,
  address: true,
  email: true,
  comment: true,
  createdAt: true,
  updatedAt: true,
  payment: { select: eventPaymentSelect },
  user: { select: { id: true, name: true, phone: true, email: true } },
  _count: { select: { items: true } },
} satisfies Prisma.OrderSelect;

export type AdminOrderEvent = Prisma.OrderGetPayload<{
  select: typeof adminOrderEventSelect;
}>;

export const getOrderRoom = (token: string) => `order:${token}`;
export const ADMIN_ORDERS_ROOM = 'admin:orders';

@Injectable()
export class OrderEventsService {
  private server: Server | null = null;

  bindServer(server: Server) {
    this.server = server;
  }

  emitStatusChanged(order: OrderStatusEvent) {
    this.server?.to(getOrderRoom(order.token)).emit('order:status', {
      id: order.id,
      token: order.token,
      status: order.status,
      payment:
        order.payment === undefined
          ? undefined
          : this.toPaymentPayload(order.payment),
      updatedAt:
        order.updatedAt instanceof Date
          ? order.updatedAt.toISOString()
          : order.updatedAt,
    });
  }

  emitAdminOrderCreated(order: AdminOrderEvent) {
    this.server
      ?.to(ADMIN_ORDERS_ROOM)
      .emit('admin:orders:created', this.toAdminOrderPayload(order));
  }

  emitAdminOrderUpdated(order: AdminOrderEvent) {
    this.server
      ?.to(ADMIN_ORDERS_ROOM)
      .emit('admin:orders:updated', this.toAdminOrderPayload(order));
  }

  emitAdminOrderDeleted(orderId: string) {
    this.server?.to(ADMIN_ORDERS_ROOM).emit('admin:orders:deleted', {
      id: orderId,
    });
  }

  private toAdminOrderPayload(order: AdminOrderEvent) {
    return {
      ...order,
      payment: this.toPaymentPayload(order.payment),
      createdAt:
        order.createdAt instanceof Date
          ? order.createdAt.toISOString()
          : order.createdAt,
      updatedAt:
        order.updatedAt instanceof Date
          ? order.updatedAt.toISOString()
      : order.updatedAt,
    };
  }

  private toPaymentPayload(payment: OrderPaymentEvent | null) {
    if (!payment) return payment;

    return {
      ...payment,
      paidAt:
        payment.paidAt instanceof Date
          ? payment.paidAt.toISOString()
          : payment.paidAt,
      canceledAt:
        payment.canceledAt instanceof Date
          ? payment.canceledAt.toISOString()
          : payment.canceledAt,
      failedAt:
        payment.failedAt instanceof Date
          ? payment.failedAt.toISOString()
          : payment.failedAt,
    };
  }
}
