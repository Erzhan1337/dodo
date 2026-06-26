import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { SafeUser } from '../../user/user.service';

export const CurrentUser = createParamDecorator(
  (data: keyof SafeUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
