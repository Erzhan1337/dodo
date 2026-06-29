import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('orders/:token/checkout')
  createCheckout(@Param('token') token: string) {
    return this.paymentService.createCheckoutForOrderToken(token);
  }

  @Post('webhooks/stripe')
  @HttpCode(200)
  handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature?: string,
  ) {
    if (!req.rawBody) {
      throw new BadRequestException('Raw request body is required');
    }

    return this.paymentService.handleStripeWebhook(req.rawBody, signature);
  }
}
