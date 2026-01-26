import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { CategoriesModule } from './categories/categories.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [PrismaModule,ConfigModule.forRoot(), AuthModule, UserModule, ProductModule, CategoriesModule, IngredientsModule, CartModule],
})
export class AppModule {}
