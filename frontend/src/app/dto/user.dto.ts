import { RoleEnum } from '../enums/role.enum';

export class UserDto {
  id?: string;

  displayName?: string;

  firstName?: string;

  lastName?: string;

  email?: string;

  emailVerified?: boolean;

  pictureUrl?: string;

  role?: RoleEnum;
}
