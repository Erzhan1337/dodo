import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum SORT {
  ASC = 'asc',
  DESC = 'desc',
  RATING = 'rating',
}
export class ProductDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  from?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  to?: number;

  @IsOptional()
  @IsString()
  ingredients?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  category?: number;

  @IsOptional()
  @IsEnum(SORT)
  sort?: SORT;

  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
