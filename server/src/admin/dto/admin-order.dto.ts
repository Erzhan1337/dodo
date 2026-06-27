import { IsEnum } from 'class-validator';
import { STATUS } from '@prisma/client';

export class AdminUpdateOrderStatusDto {
  @IsEnum(STATUS)
  status: STATUS;
}
