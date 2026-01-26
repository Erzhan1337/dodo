import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCartItemDto {
  @IsString()
  productItemId: string;

  @IsArray()
  @IsOptional()
  ingredients?: string[]; // Массив ID ингредиентов
}

export class UpdateCartItemDto {
  @IsNumber()
  @Min(1)
  quantity: number;
}
