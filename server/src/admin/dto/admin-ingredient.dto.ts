import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsString, MaxLength, Min } from 'class-validator';

export class AdminCreateIngredientDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  price: number;

  @IsString()
  @MaxLength(500)
  imageUrl: string;
}

export class AdminUpdateIngredientDto extends PartialType(
  AdminCreateIngredientDto,
) {}
