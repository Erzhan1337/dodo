import { LoginDto } from './login.dto';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class RegisterDto extends LoginDto {
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email' })
  email: string;
  @IsString({ message: 'Name is required' })
  name: string;
}
