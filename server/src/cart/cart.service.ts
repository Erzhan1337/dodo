import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCartItemDto } from './dto/cart.dto';
import { Cart, CartItem, Ingredient } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  /**
   * Универсальный метод получения корзины.
   * Приоритет: UserId (если залогинен) -> Token (если гость).
   */
  async getUserCart(token: string, userId?: string) {
    let cart: Cart | null = null;

    if (userId) {
      cart = await this.prisma.cart.findFirst({
        where: { userId },
        include: this.getCartInclude(),
      });
    }

    if (!cart && token) {
      cart = await this.prisma.cart.findFirst({
        where: { token },
        include: this.getCartInclude(),
      });
    }

    // Если корзины нет вообще — возвращаем структуру с нулями,
    // но НЕ создаем её в БД (экономим место)
    if (!cart) {
      return { totalAmount: 0, items: [] };
    }

    return this.mapCartResponse(cart);
  }

  /**
   * Добавление товара (Lazy Creation).
   * Создает корзину только при реальной попытке добавления.
   */
  async addToCart(dto: CreateCartItemDto, token?: string, userId?: string) {
    let cart = await this.resolveCart(token, userId);

    // 1. Ищем, есть ли уже такой товар (учитывая ингредиенты!)
    const existingItem = await this.findCartItem(cart.id, dto);

    if (existingItem) {
      // Если есть — просто увеличиваем кол-во
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + 1 },
      });
    } else {
      // Если нет — создаем новый
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productItemId: dto.productItemId,
          quantity: 1,
          ingredients: {
            connect: dto.ingredients?.map((id) => ({ id })) || [],
          },
        },
      });
    }

    // 2. Возвращаем обновленную корзину
    // Важно: всегда возвращаем и токен, чтобы контроллер мог обновить куку, если она новая
    const updatedCart = await this.getUserCart(cart.token, userId);
    return {
      cart: updatedCart,
      token: cart.token, // Возвращаем токен для установки в куки
    };
  }

  /**
   * Обновление количества товара
   */
  async updateItemQuantity(itemId: string, quantity: number) {
    // 1. Обновляем кол-во и сразу получаем cartId, к которому привязан товар
    const { cartId } = await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      select: { cartId: true }, // Нам нужен только ID корзины
    });

    // 2. Достаем обновленную корзину целиком (как в getUserCart)
    const cart = await this.prisma.cart.findFirst({
      where: { id: cartId },
      include: this.getCartInclude(), // Используем твой существующий хелпер
    });

    // 3. Возвращаем корзину с пересчитанным тоталом
    return this.mapCartResponse(cart);
  }

  async removeCartItem(itemId: string) {
    // 1. Сначала узнаем ID корзины перед удалением (или используем delete, который вернет удаленную запись)
    const { cartId } = await this.prisma.cartItem.delete({
      where: { id: itemId },
      select: { cartId: true },
    });

    // 2. Достаем обновленную корзину
    const cart = await this.prisma.cart.findFirst({
      where: { id: cartId },
      include: this.getCartInclude(),
    });

    // 3. Возвращаем
    return this.mapCartResponse(cart);
  }

  /**
   * СЛИЯНИЕ КОРЗИН (Merge) при авторизации.
   * Самая сложная часть: перенести товары из гостевой корзины в корзину юзера.
   */
  async mergeCarts(userId: string, guestToken: string) {
    // Находим гостевую корзину
    const guestCart = await this.prisma.cart.findFirst({
      where: { token: guestToken },
      include: { items: { include: { ingredients: true } } },
    });

    if (!guestCart) return; // Нечего мержить

    // Находим (или создаем) корзину юзера
    let userCart = await this.prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { ingredients: true } } },
    });

    // Транзакция для надежности
    await this.prisma.$transaction(async (tx) => {
      if (!userCart) {
        // Если у юзера нет корзины, просто "дарим" ему гостевую
        userCart = await tx.cart.update({
          where: { id: guestCart.id },
          data: { userId, token: '' }, // Обнуляем токен, привязываем юзера
          include: { items: { include: { ingredients: true } } },
        });
      } else {
        // Если у юзера есть корзина, нужно переносить товары
        for (const guestItem of guestCart.items) {
          const matchingUserItem = this.findMatchingItemInList(
            userCart.items,
            guestItem,
          );

          if (matchingUserItem) {
            // КОНФЛИКТ: Такой товар уже есть -> плюсуем количество
            await tx.cartItem.update({
              where: { id: matchingUserItem.id },
              data: {
                quantity: matchingUserItem.quantity + guestItem.quantity,
              },
            });
            // Удаляем старый (перенесенный) айтем
            await tx.cartItem.delete({ where: { id: guestItem.id } });
          } else {
            // УНИКАЛЬНЫЙ: Переносим item в корзину юзера
            await tx.cartItem.update({
              where: { id: guestItem.id },
              data: { cartId: userCart.id },
            });
          }
        }
        // Удаляем пустую гостевую корзину
        await tx.cart.delete({ where: { id: guestCart.id } });
      }
    });
  }

  // --- PRIVATE HELPERS ---

  // Ищет или создает корзину
  private async resolveCart(token?: string, userId?: string): Promise<Cart> {
    // 1. Пытаемся найти по userId
    if (userId) {
      const userCart = await this.prisma.cart.findFirst({ where: { userId } });
      if (userCart) return userCart;
    }

    // 2. Пытаемся найти по токену
    if (token) {
      const guestCart = await this.prisma.cart.findFirst({ where: { token } });
      if (guestCart) return guestCart;
    }

    // 3. Если ничего нет — создаем
    return this.prisma.cart.create({
      data: {
        userId: userId || null,
        token: userId ? '' : token || crypto.randomUUID(), // Генерируем токен только для гостей
      },
    });
  }

  // Поиск конкретного Item в БД с учетом ингредиентов
  private async findCartItem(cartId: string, dto: CreateCartItemDto) {
    const candidates = await this.prisma.cartItem.findMany({
      where: { cartId, productItemId: dto.productItemId },
      include: { ingredients: true },
    });

    return candidates.find((item) =>
      this.areIngredientsEqual(item.ingredients, dto.ingredients),
    );
  }

  // Сравнение ингредиентов (массива объектов и массива ID)
  private areIngredientsEqual(
    itemIngredients: Ingredient[],
    dtoIngredientsIds: string[] = [],
  ) {
    if (itemIngredients.length !== dtoIngredientsIds.length) return false;

    const sortedItemIds = itemIngredients.map((i) => i.id).sort();
    const sortedDtoIds = dtoIngredientsIds.sort();

    return sortedItemIds.every((id, idx) => id === sortedDtoIds[idx]);
  }

  // Хелпер для поиска дубликатов при мерже (сравнивает два CartItem объекта)
  private findMatchingItemInList(userItems: any[], guestItem: any) {
    return userItems.find(
      (uItem) =>
        uItem.productItemId === guestItem.productItemId &&
        this.areIngredientsEqual(
          uItem.ingredients,
          guestItem.ingredients.map((i) => i.id),
        ),
    );
  }

  // Стандартный include для Prisma, чтобы не дублировать код
  private getCartInclude() {
    return {
      items: {
        orderBy: { createdAt: 'desc' as const },
        include: {
          productItem: { include: { product: true } },
          ingredients: true,
        },
      },
    };
  }

  // Маппер для фронтенда (считает TotalPrice на лету)
  private mapCartResponse(cart: any) {
    const totalAmount = cart.items.reduce((acc, item) => {
      const itemPrice =
        item.productItem.price +
        item.ingredients.reduce((sum, i) => sum + i.price, 0);
      return acc + itemPrice * item.quantity;
    }, 0);

    return { ...cart, totalAmount };
  }
}
