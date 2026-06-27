import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { STATUS, UserRole } from '@prisma/client';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class AdminPaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}

export enum AdminProductsSortBy {
  NAME = 'name',
  CATEGORY = 'category',
  MIN_PRICE = 'minPrice',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export class AdminProductsQueryDto extends AdminPaginationDto {
  @IsOptional()
  @IsEnum(AdminProductsSortBy)
  sortBy?: AdminProductsSortBy;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;
}

export enum AdminOrdersSortBy {
  CREATED_AT = 'createdAt',
  TOTAL_PRICE = 'totalPrice',
  STATUS = 'status',
  NAME = 'name',
}

export class AdminOrdersQueryDto extends AdminPaginationDto {
  @IsOptional()
  @IsEnum(AdminOrdersSortBy)
  sortBy?: AdminOrdersSortBy;

  @IsOptional()
  @IsEnum(STATUS)
  status?: STATUS;
}

export enum AdminUsersSortBy {
  CREATED_AT = 'createdAt',
  NAME = 'name',
  PHONE = 'phone',
  EMAIL = 'email',
  ROLE = 'role',
}

export class AdminUsersQueryDto extends AdminPaginationDto {
  @IsOptional()
  @IsEnum(AdminUsersSortBy)
  sortBy?: AdminUsersSortBy;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export enum AdminCategoriesSortBy {
  ID = 'id',
  NAME = 'name',
  PRODUCTS = 'products',
  CREATED_AT = 'createdAt',
}

export class AdminCategoriesQueryDto extends AdminPaginationDto {
  @IsOptional()
  @IsEnum(AdminCategoriesSortBy)
  sortBy?: AdminCategoriesSortBy;
}

export enum AdminIngredientsSortBy {
  NAME = 'name',
  PRICE = 'price',
  PRODUCTS = 'products',
  CREATED_AT = 'createdAt',
}

export class AdminIngredientsQueryDto extends AdminPaginationDto {
  @IsOptional()
  @IsEnum(AdminIngredientsSortBy)
  sortBy?: AdminIngredientsSortBy;
}
