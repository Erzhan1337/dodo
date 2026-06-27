import { applyDecorators, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';
import { jwtAuthGuard } from '../guards/jwt-auth.guard';

export const Admin = () => {
  return applyDecorators(UseGuards(jwtAuthGuard, AdminGuard));
};
