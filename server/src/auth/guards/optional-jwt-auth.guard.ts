import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import type { SafeUser } from '../../user/user.service';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = SafeUser | null>(
    err: Error | null,
    user: TUser,
    info: Error | undefined,
    context: ExecutionContext,
  ) {
    const request = context.switchToHttp().getRequest<Request>();

    if (!request.headers.authorization) {
      return null;
    }

    if (err || !user) {
      throw err || new UnauthorizedException(info?.message || 'Unauthorized');
    }

    return user;
  }
}
