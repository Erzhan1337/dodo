import { UseGuards } from '@nestjs/common';
import { jwtAuthGuard } from '../guards/jwt-auth.guard';

export const Auth = () => {
  UseGuards(jwtAuthGuard);
};
