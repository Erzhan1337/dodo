import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CartService } from './cart.service';
import { CreateCartItemDto, UpdateCartItemDto } from './dto/cart.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly jwtService: JwtService, // Для ручного парсинга токена
  ) {}

  @Get()
  async getCart(@Req() req: Request) {
    const userId = this.getUserIdFromRequest(req);
    const token = req.cookies['cartToken'];

    return this.cartService.getUserCart(token, userId);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async addToCart(
    @Body() dto: CreateCartItemDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = this.getUserIdFromRequest(req);
    const token = req.cookies['cartToken'];

    const { cart, token: finalToken } = await this.cartService.addToCart(
      dto,
      token,
      userId,
    );

    // Если создался новый токен (для гостя), пишем его в куки
    if (!userId && finalToken && finalToken !== token) {
      res.cookie('cartToken', finalToken, {
        httpOnly: true,
        secure: false,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
        sameSite: 'lax',
      });
    }

    return cart;
  }

  @Patch(':id')
  async updateQuantity(
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItemQuantity(id, dto.quantity);
  }

  @Delete(':id')
  async removeCartItem(@Param('id') id: string) {
    return this.cartService.removeCartItem(id);
  }

  /**
   * Приватный метод для "мягкого" получения ID юзера.
   * Не кидает ошибку, если токена нет.
   */
  private getUserIdFromRequest(req: Request): string | undefined {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return undefined;

    try {
      const token = authHeader.split(' ')[1];
      const decoded: any = this.jwtService.decode(token);
      return decoded?.id;
    } catch (e) {
      return undefined;
    }
  }
}
