import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const favoriteProductInclude = {
  product: {
    include: {
      ingredients: true,
      category: true,
      items: {
        orderBy: {
          price: 'asc',
        },
      },
    },
  },
} satisfies Prisma.ProductFavoriteInclude;

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async getFavoriteProducts(userId: string) {
    const favorites = await this.prisma.productFavorite.findMany({
      where: { userId },
      include: favoriteProductInclude,
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((favorite) => favorite.product);
  }

  async getFavoriteProductIds(userId: string) {
    const favorites = await this.prisma.productFavorite.findMany({
      where: { userId },
      select: { productId: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      ids: favorites.map((favorite) => favorite.productId),
    };
  }

  async addFavoriteProduct(userId: string, productId: string) {
    await this.assertProductExists(productId);

    const favorite = await this.prisma.productFavorite.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      update: {},
      create: {
        userId,
        productId,
      },
      include: favoriteProductInclude,
    });

    return favorite.product;
  }

  async removeFavoriteProduct(userId: string, productId: string) {
    await this.prisma.productFavorite.deleteMany({
      where: {
        userId,
        productId,
      },
    });

    return { productId };
  }

  private async assertProductExists(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }
  }
}
