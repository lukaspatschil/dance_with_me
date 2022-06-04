import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from './interfaces';

export const User = createParamDecorator(
  (
    data: keyof AuthUser | undefined,
    ctx: ExecutionContext,
  ): AuthUser | AuthUser[keyof AuthUser] => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new Error('Endpoint does not provide user');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data ? user[data] : user;
  },
);
