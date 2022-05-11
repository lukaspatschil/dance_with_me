import { RoleEnum } from '../schema/enum/role.enum';

export class UserEntity {
  id!: string;
  role!: RoleEnum;
  displayName!: string;
  firstName?: string;
  lastName?: string;
  email!: string;
  emailVerified!: boolean;
  pictureUrl?: string;
}
