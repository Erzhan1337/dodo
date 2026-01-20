import { Controller, Get, HttpCode, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductDto } from './dto/product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @HttpCode(200)
  @Get('all')
  async getAllProducts(@Query() query: ProductDto) {
    return this.productService.getAllProducts(query);
  }

  @HttpCode(200)
  @Get(':id')
  async getProductById(@Param('id') id: string) {
    return this.productService.getProductById(id);
  }
}
