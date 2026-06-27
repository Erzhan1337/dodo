import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CartModule } from '../cart/cart.module';
import { OrderEventsGateway } from './order-events.gateway';
import { OrderEventsService } from './order-events.service';

@Module({
  imports: [CartModule],
  controllers: [OrderController],
  providers: [OrderService, OrderEventsGateway, OrderEventsService],
  exports: [OrderEventsService],
})
export class OrderModule {}
