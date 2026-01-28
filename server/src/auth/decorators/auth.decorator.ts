import { applyDecorators, UseGuards } from '@nestjs/common';
import { jwtAuthGuard } from '../guards/jwt-auth.guard';

export const Auth = () => {
  return applyDecorators(UseGuards(jwtAuthGuard));
};
