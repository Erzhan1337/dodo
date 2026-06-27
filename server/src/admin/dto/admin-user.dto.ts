import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { UserRole } from '@prisma/client';
import { KZ_PHONE_REGEX, normalizeKzPhone } from '../../auth/lib/phone';

export class AdminCreateUserDto {
  @IsString()
  @MaxLength(80)
  name: string;

  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? normalizeKzPhone(value) : value,
  )
  @Matches(KZ_PHONE_REGEX, { message: 'Invalid phone number' })
  phone: string;

  @IsOptional()
  @ValidateIf((o: AdminCreateUserDto) => o.email !== '' && o.email !== undefined)
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(120)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class AdminUpdateUserDto extends PartialType(AdminCreateUserDto) {
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(120)
  password?: string;
}
