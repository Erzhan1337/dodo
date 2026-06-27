import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { CategoriesModule } from './categories/categories.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { HealthModule } from './health/health.module';
import { AdminModule } from './admin/admin.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot(),
    AuthModule,
    UserModule,
    ProductModule,
    CategoriesModule,
    IngredientsModule,
    CartModule,
    OrderModule,
    HealthModule,
    ReviewsModule,
    AdminModule,
  ],
})
export class AppModule {}
