import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ProductDto, SORT } from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async getProductById(productId: string) {
    return this.prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        items: true,
      },
    });
  }

  async getAllProducts(dto: ProductDto) {
    const { ingredients, from, to, category, sort, query } = dto;
    const page = Number(dto.page) || 1;
    const limit = Number(dto.limit) || 6;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      ingredients: ingredients
        ? {
            some: {
              name: {
                in: ingredients.split(','),
                mode: 'insensitive',
              },
            },
          }
        : undefined,

      categoryId: category ? Number(category) : undefined,

      items:
        from || to
          ? {
              some: {
                price: {
                  gte: from ? Number(from) : undefined,
                  lte: to ? Number(to) : undefined,
                },
              },
            }
          : undefined,

      name: query
        ? {
            contains: query,
            mode: 'insensitive',
          }
        : undefined,
    };

    const products = await this.prisma.product.findMany({
      where,
      include: {
        ingredients: true,
        category: true,
        items: {
          orderBy: {
            price: 'asc',
          },
        },
      },
    });

    if (sort === SORT.ASC) {
      products.sort((a, b) => {
        const priceA = a.items[0]?.price || 0;
        const priceB = b.items[0]?.price || 0;
        return priceA - priceB;
      });
    } else if (sort === SORT.DESC) {
      products.sort((a, b) => {
        const priceA = a.items[0]?.price || 0;
        const priceB = b.items[0]?.price || 0;
        return priceB - priceA;
      });
    }

    const paginatedProducts = products.slice(skip, skip + limit);

    return {
      data: paginatedProducts,
      meta: {
        total: products.length,
        page,
        limit,
        totalPages: Math.ceil(products.length / limit),
      },
    };
  }
}
