import { PartialType } from '@nestjs/mapped-types';
import { IsString, MaxLength } from 'class-validator';

export class AdminCreateCategoryDto {
  @IsString()
  @MaxLength(80)
  name: string;
}

export class AdminUpdateCategoryDto extends PartialType(
  AdminCreateCategoryDto,
) {}
