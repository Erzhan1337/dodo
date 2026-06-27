import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @MinLength(2, { message: 'Name is required' })
  @MaxLength(40, { message: 'Name is too long' })
  name: string;

  @IsString()
  @MinLength(5, { message: 'Phone is required' })
  @MaxLength(20)
  phone: string;

  @IsString()
  @MinLength(5, { message: 'Address is required' })
  @MaxLength(300, { message: 'Address is too long' })
  address: string;

  @IsOptional()
  @ValidateIf((o: CreateOrderDto) => o.email !== '' && o.email !== undefined)
  @IsEmail({}, { message: 'Invalid email' })
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Comment is too long' })
  comment?: string;
}
