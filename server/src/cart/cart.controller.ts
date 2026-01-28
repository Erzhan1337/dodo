import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @Auth()
  async getCart(@CurrentUser('id') userId: string) {
    return this.cartService.getCart(userId);
  }

  @UsePipes(new ValidationPipe())
  @Post()
  @Auth()
  async addToCart(@CurrentUser('id') userId: string, @Body() dto: any) {
    return this.cartService.addToCart(userId, dto);
  }

  @Patch(':id')
  @Auth()
  async updateItemQuantity(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.cartService.updateItemQuantity(userId, id, dto);
  }

  @Delete(':id')
  @Auth()
  async removeCartItem(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.cartService.removeCartItem(userId, id);
  }
}
