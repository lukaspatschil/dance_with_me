import { ExecutionContext } from '@nestjs/common';
import { RoleEnum } from '../../src/core/schema/enum/role.enum';

export class AuthGuardMock {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    req.user = {
      id: '1',
      displayName: 'John Doe',
      pictureUrl: 'https://example.com/picture.jpg',
      role: RoleEnum.USER,
    };
    return true;
  }
}
