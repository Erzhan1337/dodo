import { Controller, Get, HttpCode } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @HttpCode(200)
  @Get()
  getIngredients() {
    return this.ingredientsService.getIngredients();
  }
}
