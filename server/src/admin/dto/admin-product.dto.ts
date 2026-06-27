import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class AdminProductItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  size?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  pizzaType?: number | null;

  @IsString()
  @MaxLength(500)
  imageUrl: string;
}

export class AdminCreateProductDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsString()
  @MaxLength(1000)
  description: string;

  @IsString()
  @MaxLength(500)
  imageUrl: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId: number;

  @IsOptional()
  @IsBoolean()
  canBuildHalfAndHalf?: boolean;

  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  ingredientIds: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => AdminProductItemDto)
  items: AdminProductItemDto[];
}

export class AdminUpdateProductDto extends PartialType(AdminCreateProductDto) {}
