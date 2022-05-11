import { ExecutionContext } from '@nestjs/common';

export class AuthGuardMock {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    req.user = {};
    return true;
  }
}
