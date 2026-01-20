import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum SORT {
  ASC = 'asc',
  DESC = 'desc',
  RATING = 'rating',
}
export class ProductDto {
  @IsOptional()
  from?: string;
  @IsOptional()
  to?: string;
  @IsOptional()
  ingredients?: string;
  @IsOptional()
  category?: string;
  @IsOptional()
  @IsEnum(SORT)
  sort?: SORT;
  @IsOptional()
  @IsString()
  query?: string;
}
