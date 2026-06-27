import {
  ArrayUnique,
  IsIn,
  IsInt,
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CustomPizzaIngredientDto {
  @IsString()
  @MinLength(1)
  id: string;

  @IsInt()
  @Min(1)
  @Max(2)
  quantity: number;

  @IsIn(['whole', 'left', 'right'])
  placement: 'whole' | 'left' | 'right';
}

export class CustomPizzaHalfAndHalfDto {
  @IsString()
  @MinLength(1)
  leftProductItemId: string;

  @IsString()
  @MinLength(1)
  rightProductItemId: string;
}

export class CustomPizzaDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  name?: string;

  @IsIn(['whole', 'halves'])
  format: 'whole' | 'halves';

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CustomPizzaHalfAndHalfDto)
  halfAndHalf?: CustomPizzaHalfAndHalfDto;

  @IsString()
  @MinLength(1)
  sauce: string;

  @IsIn(['standard', 'double', 'none'])
  cheeseMode: 'standard' | 'double' | 'none';

  @IsOptional()
  @IsString()
  @MaxLength(80)
  bakeMode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  sliceMode?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomPizzaIngredientDto)
  ingredients: CustomPizzaIngredientDto[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  removedIngredientIds?: string[];
}

export class AddCartItemDto {
  @IsString()
  @MinLength(1)
  productItemId: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  ingredients?: string[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CustomPizzaDto)
  customPizza?: CustomPizzaDto;
}
