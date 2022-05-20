import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from '../core/schema/enum/role.enum';
import { MissingPermissionError } from '../core/error/missingPermission.error';

export const ALLOWED_ROLES_KEY = 'allowedRoles';

export const Admin = () =>
  applyDecorators(SetMetadata(ALLOWED_ROLES_KEY, []), UseGuards(RoleGuard));

export const Organizer = () =>
  applyDecorators(
    SetMetadata(ALLOWED_ROLES_KEY, [RoleEnum.ORGANISER]),
    UseGuards(RoleGuard),
  );

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ALLOWED_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new Error('Endpoint does not provide user');
    }

    if ([RoleEnum.ADMIN, ...allowedRoles].includes(user.role)) {
      return true;
    }
    throw MissingPermissionError;
  }
}
