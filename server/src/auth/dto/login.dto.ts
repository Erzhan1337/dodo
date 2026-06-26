import { Transform } from 'class-transformer';
import { IsString, Matches, MinLength } from 'class-validator';
import { KZ_PHONE_REGEX, normalizeKzPhone } from '../lib/phone';

export class LoginDto {
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? normalizeKzPhone(value) : value,
  )
  @Matches(KZ_PHONE_REGEX, { message: 'Invalid phone number' })
  phone: string;

  @IsString()
  @MinLength(8, { message: 'Invalid Password' })
  password: string;
}
