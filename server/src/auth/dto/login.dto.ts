import { IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsPhoneNumber('KZ', { message: 'Invalid phone number' })
  phone: string;
  @IsString()
  @MinLength(8, { message: 'Invalid Password' })
  password: string;
}
