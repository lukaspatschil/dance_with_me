import { ExecutionContext } from '@nestjs/common';
import { RoleEnum } from '../../src/core/schema/enum/role.enum';
import { AuthUser } from '../../src/auth/interfaces';

export class AuthGuardMock {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const userString = Buffer.from(
        authHeader.split(' ')[1],
        'base64',
      ).toString();
      req.user = JSON.parse(userString);
    } else
      req.user = {
        id: '1',
        displayName: 'John Doe',
        pictureUrl: 'https://example.com/picture.jpg',
        role: RoleEnum.USER,
      };
    return true;
  }
}

export const mockedAuthHeader = (user: AuthUser) => {
  return `Bearer ${Buffer.from(JSON.stringify(user)).toString('base64')}`;
};
