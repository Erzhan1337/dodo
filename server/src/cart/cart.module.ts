import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { PromoCodesModule } from '../promo-codes/promo-codes.module';

@Module({
  imports: [ConfigModule, PromoCodesModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
