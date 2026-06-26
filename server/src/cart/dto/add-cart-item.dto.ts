import {
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class AddCartItemDto {
  @IsString()
  @MinLength(1)
  productItemId: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  ingredients?: string[];
}
