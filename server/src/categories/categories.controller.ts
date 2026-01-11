import { Controller, Get, HttpCode } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @HttpCode(200)
  @Get('')
  async getAllCategories() {
    return this.categoriesService.getAllCategories();
  }
}
