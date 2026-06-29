import { IsString, MaxLength, MinLength } from 'class-validator';

export class ApplyPromoCodeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  code: string;
}
