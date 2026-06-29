import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, PromoCode, PromoCodeType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type PromoCodeCalculation = {
  promoCode: PromoCode;
  discountAmount: number;
};

export type PromoCodeSnapshot = {
  id: string;
  code: string;
  title: string;
  description: string;
  type: PromoCodeType;
  value: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  discountAmount: number;
};

const publicPromoCodeSelect = {
  id: true,
  code: true,
  title: true,
  description: true,
  type: true,
  value: true,
  minOrderAmount: true,
  maxDiscountAmount: true,
  firstOrderOnly: true,
  endsAt: true,
} satisfies Prisma.PromoCodeSelect;

@Injectable()
export class PromoCodesService {
  constructor(private readonly prisma: PrismaService) {}

  async listAvailablePromoCodes() {
    const now = new Date();

    return this.prisma.promoCode.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
        ],
      },
      orderBy: [{ minOrderAmount: 'asc' }, { code: 'asc' }],
      select: publicPromoCodeSelect,
    });
  }

  async validatePromoCode(
    code: string,
    subtotalPrice: number,
    userId?: string | null,
    client: Prisma.TransactionClient = this.prisma,
  ): Promise<PromoCodeCalculation> {
    const normalizedCode = this.normalizeCode(code);
    if (!normalizedCode) {
      throw new BadRequestException('Введите промокод');
    }

    const promoCode = await client.promoCode.findUnique({
      where: { code: normalizedCode },
    });

    if (!promoCode) {
      throw new BadRequestException('Промокод не найден');
    }

    return this.validatePromoCodeRecord(
      promoCode,
      subtotalPrice,
      userId,
      client,
    );
  }

  async validatePromoCodeRecord(
    promoCode: PromoCode,
    subtotalPrice: number,
    userId?: string | null,
    client: Prisma.TransactionClient = this.prisma,
  ): Promise<PromoCodeCalculation> {
    await this.assertPromoCodeAvailable(promoCode, subtotalPrice, userId, client);

    return {
      promoCode,
      discountAmount: this.calculateDiscount(promoCode, subtotalPrice),
    };
  }

  async tryValidatePromoCodeRecord(
    promoCode: PromoCode,
    subtotalPrice: number,
    userId?: string | null,
    client: Prisma.TransactionClient = this.prisma,
  ) {
    try {
      return await this.validatePromoCodeRecord(
        promoCode,
        subtotalPrice,
        userId,
        client,
      );
    } catch (error) {
      if (error instanceof BadRequestException) return null;
      throw error;
    }
  }

  createSnapshot(
    promoCode: PromoCode,
    discountAmount: number,
  ): PromoCodeSnapshot {
    return {
      id: promoCode.id,
      code: promoCode.code,
      title: promoCode.title,
      description: promoCode.description,
      type: promoCode.type,
      value: promoCode.value,
      minOrderAmount: promoCode.minOrderAmount,
      maxDiscountAmount: promoCode.maxDiscountAmount,
      discountAmount,
    };
  }

  normalizeCode(code: string) {
    return code.trim().toUpperCase();
  }

  private async assertPromoCodeAvailable(
    promoCode: PromoCode,
    subtotalPrice: number,
    userId: string | null | undefined,
    client: Prisma.TransactionClient,
  ) {
    const now = new Date();

    if (!promoCode.isActive) {
      throw new BadRequestException('Промокод больше не действует');
    }

    if (promoCode.startsAt && promoCode.startsAt > now) {
      throw new BadRequestException('Промокод начнет действовать позже');
    }

    if (promoCode.endsAt && promoCode.endsAt <= now) {
      throw new BadRequestException('Срок действия промокода закончился');
    }

    if (subtotalPrice <= 0) {
      throw new BadRequestException('Корзина пуста');
    }

    if (subtotalPrice < promoCode.minOrderAmount) {
      throw new BadRequestException(
        `Минимальная сумма заказа для промокода — ${promoCode.minOrderAmount} ₸`,
      );
    }

    if (promoCode.usageLimit != null) {
      const usageCount = await client.promoCodeRedemption.count({
        where: { promoCodeId: promoCode.id },
      });

      if (usageCount >= promoCode.usageLimit) {
        throw new BadRequestException('Лимит использований промокода исчерпан');
      }
    }

    if (promoCode.firstOrderOnly || promoCode.perUserLimit != null) {
      if (!userId) {
        throw new BadRequestException(
          'Войдите в аккаунт, чтобы использовать этот промокод',
        );
      }
    }

    if (promoCode.firstOrderOnly && userId) {
      const previousOrdersCount = await client.order.count({
        where: { userId },
      });

      if (previousOrdersCount > 0) {
        throw new BadRequestException(
          'Промокод доступен только для первого заказа',
        );
      }
    }

    if (promoCode.perUserLimit != null && userId) {
      const userUsageCount = await client.promoCodeRedemption.count({
        where: { promoCodeId: promoCode.id, userId },
      });

      if (userUsageCount >= promoCode.perUserLimit) {
        throw new BadRequestException(
          'Вы уже использовали этот промокод максимальное число раз',
        );
      }
    }
  }

  private calculateDiscount(promoCode: PromoCode, subtotalPrice: number) {
    const rawDiscount =
      promoCode.type === PromoCodeType.PERCENT
        ? Math.floor((subtotalPrice * promoCode.value) / 100)
        : promoCode.value;
    const cappedDiscount =
      promoCode.maxDiscountAmount == null
        ? rawDiscount
        : Math.min(rawDiscount, promoCode.maxDiscountAmount);

    return Math.max(0, Math.min(cappedDiscount, subtotalPrice));
  }
}
