import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import type { Server, Socket } from 'socket.io';
import { OrderService } from './order.service';
import {
  ADMIN_ORDERS_ROOM,
  getOrderRoom,
  OrderEventsService,
} from './order-events.service';
import { UserService } from '../user/user.service';

type OrderSubscriptionPayload = {
  token?: string;
};

type AdminOrdersSubscriptionPayload = {
  accessToken?: string;
};

type AccessTokenPayload = {
  id: string;
  type: string;
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
    private readonly jwt: JwtService,
    private readonly userService: UserService,
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

  @SubscribeMessage('admin:orders:subscribe')
  async subscribeToAdminOrders(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: AdminOrdersSubscriptionPayload,
  ) {
    const accessToken = this.getAdminAccessToken(socket, payload);

    if (!accessToken) {
      socket.emit('admin:orders:error', { message: 'Access token is required' });
      return { ok: false };
    }

    try {
      await this.assertAdminAccess(accessToken);
      await socket.join(ADMIN_ORDERS_ROOM);
      socket.emit('admin:orders:ready', { ok: true });
      return { ok: true };
    } catch {
      await socket.leave(ADMIN_ORDERS_ROOM);
      socket.emit('admin:orders:error', { message: 'Admin access required' });
      return { ok: false };
    }
  }

  @SubscribeMessage('admin:orders:unsubscribe')
  async unsubscribeFromAdminOrders(@ConnectedSocket() socket: Socket) {
    await socket.leave(ADMIN_ORDERS_ROOM);
    return { ok: true };
  }

  private getAdminAccessToken(
    socket: Socket,
    payload?: AdminOrdersSubscriptionPayload,
  ) {
    const payloadToken = payload?.accessToken?.trim();
    if (payloadToken) return payloadToken;

    const handshakeToken = socket.handshake.auth?.accessToken;
    return typeof handshakeToken === 'string' ? handshakeToken.trim() : '';
  }

  private async assertAdminAccess(accessToken: string) {
    const payload = await this.jwt.verifyAsync<AccessTokenPayload>(accessToken);
    if (payload.type !== 'access') {
      throw new Error('Invalid access token');
    }

    const user = await this.userService.getSafeUserById(payload.id);
    if (user?.role !== UserRole.ADMIN) {
      throw new Error('Admin access required');
    }

    return user;
  }
}
