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

@Module({
  imports: [
    CartModule,
    UserModule,
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: getJwtConfig,
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderEventsGateway, OrderEventsService],
  exports: [OrderEventsService],
})
export class OrderModule {}
