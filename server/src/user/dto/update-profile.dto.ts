import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name is too short' })
  @MaxLength(40, { message: 'Name is too long' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'Address is too long' })
  address?: string;
}
