import { Injectable } from '@nestjs/common';
import { Prisma, STATUS } from '@prisma/client';
import type { Server } from 'socket.io';

export type OrderStatusEvent = {
  id: string;
  token: string;
  status: STATUS;
  updatedAt: Date | string;
};

export const adminOrderEventSelect = {
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
}
