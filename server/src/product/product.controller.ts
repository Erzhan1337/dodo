import { Controller, Get, HttpCode } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @HttpCode(200)
  @Get('all ')
  async getAllProducts() {
    return this.productService.getAllProducts();
  }
}
