import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { FavoritesService } from './favorites.service';

@Auth()
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  getFavoriteProducts(@CurrentUser('id') userId: string) {
    return this.favoritesService.getFavoriteProducts(userId);
  }

  @Get('ids')
  getFavoriteProductIds(@CurrentUser('id') userId: string) {
    return this.favoritesService.getFavoriteProductIds(userId);
  }

  @Post(':productId')
  addFavoriteProduct(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.favoritesService.addFavoriteProduct(userId, productId);
  }

  @Delete(':productId')
  removeFavoriteProduct(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.favoritesService.removeFavoriteProduct(userId, productId);
  }
}
