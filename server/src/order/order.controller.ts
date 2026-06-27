import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OptionalAuth } from '../auth/decorators/optional-auth.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { CartService, GUEST_CART_TOKEN_COOKIE } from '../cart/cart.service';
import { Auth } from '../auth/decorators/auth.decorator';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly cartService: CartService,
  ) {}

  @Post()
  @OptionalAuth()
  async createOrder(
    @CurrentUser('id') userId: string | undefined,
    @Body() dto: CreateOrderDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.orderService.createOrder(
      {
        userId,
        guestCartToken: req.cookies?.[GUEST_CART_TOKEN_COOKIE],
      },
      dto,
    );

    if (result.clearGuestCartToken) {
      this.cartService.removeGuestCartTokenFromResponse(res);
    }

    return { token: result.token };
  }

  @Get('my')
  @Auth()
  getCurrentUserOrders(@CurrentUser('id') userId: string) {
    return this.orderService.getOrdersByUserId(userId);
  }

  @Get(':token')
  getOrderByToken(@Param('token') token: string) {
    return this.orderService.getOrderByToken(token);
  }
}
