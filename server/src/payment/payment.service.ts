import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider, PaymentStatus, Prisma, STATUS } from '@prisma/client';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdminOrderEvent,
  adminOrderEventSelect,
  OrderEventsService,
} from '../order/order-events.service';

const paymentSelect = {
  id: true,
  provider: true,
  status: true,
  amount: true,
  currency: true,
  providerCheckoutId: true,
  providerPaymentIntentId: true,
  checkoutUrl: true,
  paidAt: true,
  canceledAt: true,
  failedAt: true,
  orderId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PaymentSelect;

export const orderPaymentSelect = {
  id: true,
  provider: true,
  status: true,
  amount: true,
  currency: true,
  checkoutUrl: true,
  paidAt: true,
  canceledAt: true,
  failedAt: true,
} satisfies Prisma.PaymentSelect;

type StripeCheckoutPayload = {
  paymentUrl: string;
};

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private stripe: Stripe | null = null;
  private readonly currency: string;
  private readonly currencyExponent: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly orderEventsService: OrderEventsService,
  ) {
    this.currency = this.configService.get('PAYMENT_CURRENCY') ?? 'KZT';
    this.currencyExponent = Number(
      this.configService.get('PAYMENT_CURRENCY_EXPONENT') ?? 2,
    );
  }

  async createCheckoutForOrderToken(
    orderToken: string,
  ): Promise<StripeCheckoutPayload> {
    const order = await this.prisma.order.findFirst({
      where: { token: orderToken },
      select: {
        id: true,
        orderNumber: true,
        token: true,
        totalPrice: true,
        status: true,
        email: true,
        payment: { select: paymentSelect },
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== STATUS.NEW) {
      throw new BadRequestException('Order is not awaiting payment');
    }

    const payment =
      order.payment ??
      (await this.prisma.payment.upsert({
        where: { orderId: order.id },
        update: {},
        create: {
          orderId: order.id,
          amount: order.totalPrice,
          currency: this.currency,
          provider: PaymentProvider.STRIPE,
          status: PaymentStatus.PENDING,
        },
        select: paymentSelect,
      }));

    if (payment.status === PaymentStatus.SUCCEEDED) {
      throw new BadRequestException('Order is already paid');
    }

    if (payment.checkoutUrl && payment.status === PaymentStatus.PENDING) {
      return { paymentUrl: payment.checkoutUrl };
    }

    const session = await this.getStripe().checkout.sessions.create(
      {
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: payment.currency.toLowerCase(),
              product_data: {
                name: `Заказ #${String(order.orderNumber).padStart(6, '0')}`,
              },
              unit_amount: this.toProviderAmount(payment.amount),
            },
            quantity: 1,
          },
        ],
        customer_email: order.email ?? undefined,
        success_url: this.getOrderRedirectUrl(order.token, 'success'),
        cancel_url: this.getOrderRedirectUrl(order.token, 'cancel'),
        metadata: {
          orderId: order.id,
          orderToken: order.token,
          paymentId: payment.id,
        },
        payment_intent_data: {
          metadata: {
            orderId: order.id,
            orderToken: order.token,
            paymentId: payment.id,
          },
        },
      },
      {
        idempotencyKey: `checkout:${payment.id}:${payment.status}:${payment.updatedAt.getTime()}`,
      },
    );

    if (!session.url) {
      throw new InternalServerErrorException('Payment checkout URL is missing');
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PENDING,
        providerCheckoutId: session.id,
        providerPaymentIntentId: this.getStripeId(session.payment_intent),
        checkoutUrl: session.url,
        failedAt: null,
        canceledAt: null,
      },
    });

    return { paymentUrl: session.url };
  }

  async handleStripeWebhook(rawBody: Buffer, signature?: string) {
    if (!signature)
      throw new BadRequestException('Stripe signature is missing');

    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is required for Stripe webhooks');
    }

    let event: Stripe.Event;
    try {
      event = this.getStripe().webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      try {
        await tx.paymentWebhookEvent.create({
          data: {
            provider: PaymentProvider.STRIPE,
            providerEventId: event.id,
            type: event.type,
          },
        });
      } catch (error) {
        if (this.isUniqueConstraintError(error)) return null;
        throw error;
      }

      switch (event.type) {
        case 'checkout.session.completed':
          return this.handleCheckoutCompleted(
            tx,
            event.data.object as Stripe.Checkout.Session,
          );
        case 'checkout.session.expired':
          return this.handleCheckoutExpired(
            tx,
            event.data.object as Stripe.Checkout.Session,
          );
        case 'payment_intent.payment_failed':
          return this.handlePaymentFailed(
            tx,
            event.data.object as Stripe.PaymentIntent,
          );
        default:
          this.logger.debug(`Ignored Stripe event type=${event.type}`);
          return null;
      }
    });

    if (updatedOrder) {
      this.orderEventsService.emitStatusChanged(updatedOrder);
      this.orderEventsService.emitAdminOrderUpdated(updatedOrder);
    }

    return { received: true };
  }

  private async handleCheckoutCompleted(
    tx: Prisma.TransactionClient,
    session: Stripe.Checkout.Session,
  ): Promise<AdminOrderEvent | null> {
    if (session.payment_status !== 'paid') {
      this.logger.warn(
        `Stripe checkout session ${session.id} completed without paid status`,
      );
      return null;
    }

    const payment = await tx.payment.findUnique({
      where: { providerCheckoutId: session.id },
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        order: {
          select: { id: true, status: true },
        },
      },
    });

    if (!payment) {
      this.logger.warn(`Payment not found for Stripe session ${session.id}`);
      return null;
    }

    this.assertStripeAmountMatches(payment, session);

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.SUCCEEDED,
        providerPaymentIntentId: this.getStripeId(session.payment_intent),
        paidAt: new Date(),
        failedAt: null,
        canceledAt: null,
      },
    });

    if (payment.order.status === STATUS.NEW) {
      return tx.order.update({
        where: { id: payment.order.id },
        data: { status: STATUS.PREPARING },
        select: adminOrderEventSelect,
      });
    }

    return tx.order.findUnique({
      where: { id: payment.order.id },
      select: adminOrderEventSelect,
    });
  }

  private async handleCheckoutExpired(
    tx: Prisma.TransactionClient,
    session: Stripe.Checkout.Session,
  ): Promise<AdminOrderEvent | null> {
    const payment = await tx.payment.findUnique({
      where: { providerCheckoutId: session.id },
      select: {
        id: true,
        status: true,
        order: { select: { id: true, status: true } },
      },
    });

    if (!payment || payment.status === PaymentStatus.SUCCEEDED) return null;

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.CANCELED,
        checkoutUrl: null,
        canceledAt: new Date(),
      },
    });

    if (payment.order.status !== STATUS.NEW) return null;

    return tx.order.update({
      where: { id: payment.order.id },
      data: { status: STATUS.CANCELED },
      select: adminOrderEventSelect,
    });
  }

  private async handlePaymentFailed(
    tx: Prisma.TransactionClient,
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<AdminOrderEvent | null> {
    const paymentId = paymentIntent.metadata?.paymentId;
    const where: Prisma.PaymentWhereInput = paymentId
      ? {
          OR: [
            { providerPaymentIntentId: paymentIntent.id },
            { id: paymentId },
          ],
        }
      : { providerPaymentIntentId: paymentIntent.id };

    const payment = await tx.payment.findFirst({
      where,
      select: { id: true, status: true, orderId: true },
    });

    if (!payment || payment.status === PaymentStatus.SUCCEEDED) return null;

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
        providerPaymentIntentId: paymentIntent.id,
        checkoutUrl: null,
        failedAt: new Date(),
      },
    });

    return tx.order.findUnique({
      where: { id: payment.orderId },
      select: adminOrderEventSelect,
    });
  }

  private assertStripeAmountMatches(
    payment: { amount: number; currency: string },
    session: Stripe.Checkout.Session,
  ) {
    const expectedAmount = this.toProviderAmount(payment.amount);
    const actualAmount = session.amount_total;
    const actualCurrency = session.currency?.toUpperCase();

    if (
      actualAmount !== expectedAmount ||
      actualCurrency !== payment.currency.toUpperCase()
    ) {
      throw new BadRequestException(
        'Payment amount does not match order total',
      );
    }
  }

  private toProviderAmount(amount: number) {
    return Math.round(amount * 10 ** this.currencyExponent);
  }

  private getStripe() {
    if (this.stripe) return this.stripe;

    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new InternalServerErrorException(
        'Payment provider is not configured',
      );
    }

    this.stripe = new Stripe(stripeSecretKey);
    return this.stripe;
  }

  private getOrderRedirectUrl(orderToken: string, paymentResult: string) {
    const clientUrl = this.configService.getOrThrow<string>('CLIENT_URL');
    return `${clientUrl.replace(/\/$/, '')}/order/${orderToken}?payment=${paymentResult}`;
  }

  private getStripeId(value: string | Stripe.PaymentIntent | null) {
    if (!value) return undefined;
    return typeof value === 'string' ? value : value.id;
  }

  private isUniqueConstraintError(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }
}
