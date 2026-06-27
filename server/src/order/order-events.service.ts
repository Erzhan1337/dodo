import { Injectable } from '@nestjs/common';
import { STATUS } from '@prisma/client';
import type { Server } from 'socket.io';

export type OrderStatusEvent = {
  id: string;
  token: string;
  status: STATUS;
  updatedAt: Date | string;
};

export const getOrderRoom = (token: string) => `order:${token}`;

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
}
