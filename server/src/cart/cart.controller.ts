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
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CartService, GUEST_CART_TOKEN_COOKIE } from './cart.service';
import { OptionalAuth } from '../auth/decorators/optional-auth.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ApplyPromoCodeDto } from '../promo-codes/dto/apply-promo-code.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @OptionalAuth()
  async getCart(
    @CurrentUser('id') userId: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.cartService.getCart({
      userId,
      guestCartToken: this.getGuestCartToken(req),
    });

    this.syncGuestCartCookie(res, result);
    return result.cart;
  }

  @Post()
  @OptionalAuth()
  async addToCart(
    @CurrentUser('id') userId: string | undefined,
    @Body() dto: AddCartItemDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.cartService.addToCart(
      {
        userId,
        guestCartToken: this.getGuestCartToken(req),
      },
      dto,
    );

    this.syncGuestCartCookie(res, result);
    return result.cart;
  }

  @Patch(':id')
  @OptionalAuth()
  async updateItemQuantity(
    @CurrentUser('id') userId: string | undefined,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.cartService.updateItemQuantity(
      {
        userId,
        guestCartToken: this.getGuestCartToken(req),
      },
      id,
      dto,
    );

    this.syncGuestCartCookie(res, result);
    return result.cart;
  }

  @Delete(':itemId/ingredients/:ingredientId')
  @OptionalAuth()
  async removeItemIngredient(
    @CurrentUser('id') userId: string | undefined,
    @Param('itemId') itemId: string,
    @Param('ingredientId') ingredientId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.cartService.removeItemIngredient(
      {
        userId,
        guestCartToken: this.getGuestCartToken(req),
      },
      itemId,
      ingredientId,
    );

    this.syncGuestCartCookie(res, result);
    return result.cart;
  }

  @Post('promo-code')
  @OptionalAuth()
  async applyPromoCode(
    @CurrentUser('id') userId: string | undefined,
    @Body() dto: ApplyPromoCodeDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.cartService.applyPromoCode(
      {
        userId,
        guestCartToken: this.getGuestCartToken(req),
      },
      dto.code,
    );

    this.syncGuestCartCookie(res, result);
    return result.cart;
  }

  @Delete('promo-code')
  @OptionalAuth()
  async removePromoCode(
    @CurrentUser('id') userId: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.cartService.removePromoCode({
      userId,
      guestCartToken: this.getGuestCartToken(req),
    });

    this.syncGuestCartCookie(res, result);
    return result.cart;
  }

  @Delete(':id')
  @OptionalAuth()
  async removeCartItem(
    @CurrentUser('id') userId: string | undefined,
    @Param('id') id: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.cartService.removeCartItem(
      {
        userId,
        guestCartToken: this.getGuestCartToken(req),
      },
      id,
    );

    this.syncGuestCartCookie(res, result);
    return result.cart;
  }

  private getGuestCartToken(req: Request) {
    return req.cookies?.[GUEST_CART_TOKEN_COOKIE];
  }

  private syncGuestCartCookie(
    res: Response,
    result: { guestCartToken?: string; clearGuestCartToken?: boolean },
  ) {
    if (result.guestCartToken) {
      this.cartService.addGuestCartTokenToResponse(res, result.guestCartToken);
      return;
    }

    if (result.clearGuestCartToken) {
      this.cartService.removeGuestCartTokenFromResponse(res);
    }
  }
}
