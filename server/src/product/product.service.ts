import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ProductDto, SORT } from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async getProductById(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        items: {
          orderBy: [{ size: 'asc' }, { price: 'asc' }],
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async getAllProducts(dto: ProductDto) {
    const { ingredients, from, to, category, sort, query } = dto;
    const page = dto.page || 1;
    const limit = dto.limit || 6;
    const skip = (page - 1) * limit;
    const shouldSortByPrice = sort === SORT.ASC || sort === SORT.DESC;
    const ingredientNames = ingredients
      ?.split(',')
      .map((name) => name.trim())
      .filter(Boolean);
    const productItemPriceWhere: Prisma.IntFilter | undefined =
      from != null || to != null
        ? {
            gte: from,
            lte: to,
          }
        : undefined;

    const productWhere: Prisma.ProductWhereInput = {
      ingredients: ingredientNames?.length
        ? {
            some: {
              name: {
                in: ingredientNames,
                mode: 'insensitive',
              },
            },
          }
        : undefined,

      categoryId: category,

      name: query
        ? {
            contains: query,
            mode: 'insensitive',
          }
        : undefined,
    };
    const where: Prisma.ProductWhereInput = {
      ...productWhere,
      items: productItemPriceWhere
        ? {
            some: {
              price: productItemPriceWhere,
            },
          }
        : undefined,
    };

    const total = await this.prisma.product.count({ where });

    if (shouldSortByPrice) {
      const products = await this.getProductsSortedByPrice({
        productWhere,
        productItemPriceWhere,
        where,
        sort,
        skip,
        limit,
      });

      return {
        data: products,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

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
      skip,
      take: limit,
    });

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async getProductsSortedByPrice({
    productWhere,
    productItemPriceWhere,
    where,
    sort,
    skip,
    limit,
  }: {
    productWhere: Prisma.ProductWhereInput;
    productItemPriceWhere?: Prisma.IntFilter;
    where: Prisma.ProductWhereInput;
    sort?: SORT;
    skip: number;
    limit: number;
  }) {
    const groupedItems = await this.prisma.productItem.groupBy({
      by: ['productId'],
      where: {
        product: productWhere,
        price: productItemPriceWhere,
      },
      _min: {
        price: true,
      },
      orderBy: {
        _min: {
          price: sort === SORT.DESC ? 'desc' : 'asc',
        },
      },
      skip,
      take: limit,
    });

    if (groupedItems.length === 0) return [];

    const order = new Map(
      groupedItems.map((item, index) => [item.productId, index]),
    );
    const products = await this.prisma.product.findMany({
      where: {
        ...where,
        id: {
          in: groupedItems.map((item) => item.productId),
        },
      },
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

    return products.sort((a, b) => {
      return (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0);
    });
  }
}
