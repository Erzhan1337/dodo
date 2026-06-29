import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CartModule } from '../cart/cart.module';
import { OrderEventsGateway } from './order-events.gateway';
import { OrderEventsService } from './order-events.service';
import { UserModule } from '../user/user.module';
import { getJwtConfig } from '../../config/jwt.config';
import { PaymentController } from '../payment/payment.controller';
import { PaymentService } from '../payment/payment.service';
import { PromoCodesModule } from '../promo-codes/promo-codes.module';

@Module({
  imports: [
    CartModule,
    PromoCodesModule,
    UserModule,
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: getJwtConfig,
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
  ],
  controllers: [OrderController, PaymentController],
  providers: [
    OrderService,
    OrderEventsGateway,
    OrderEventsService,
    PaymentService,
  ],
  exports: [OrderEventsService],
})
export class OrderModule {}
