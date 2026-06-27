import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { OrderService } from './order.service';
import { getOrderRoom, OrderEventsService } from './order-events.service';

type OrderSubscriptionPayload = {
  token?: string;
};

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  transports: ['websocket'],
})
export class OrderEventsGateway implements OnGatewayInit {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderEventsService: OrderEventsService,
  ) {}

  afterInit(server: Server) {
    this.orderEventsService.bindServer(server);
  }

  @SubscribeMessage('order:subscribe')
  async subscribeToOrder(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: OrderSubscriptionPayload,
  ) {
    const token = payload?.token?.trim();

    if (!token) {
      socket.emit('order:error', { message: 'Order token is required' });
      return { ok: false };
    }

    try {
      const order = await this.orderService.getOrderByToken(token);
      await socket.join(getOrderRoom(token));
      socket.emit('order:status', {
        id: order.id,
        token: order.token,
        status: order.status,
        updatedAt:
          order.updatedAt instanceof Date
            ? order.updatedAt.toISOString()
            : order.updatedAt,
      });
      return { ok: true };
    } catch {
      socket.emit('order:error', { message: 'Order not found' });
      return { ok: false };
    }
  }

  @SubscribeMessage('order:unsubscribe')
  async unsubscribeFromOrder(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: OrderSubscriptionPayload,
  ) {
    const token = payload?.token?.trim();

    if (token) {
      await socket.leave(getOrderRoom(token));
    }

    return { ok: true };
  }
}
