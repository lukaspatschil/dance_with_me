import {RoleEnum} from "../enums/role.enum";

export class UserEntity {
  firstName?: string;

  lastName?: string;

  pictureUrl?: string;

  emailVerified = false;

  constructor(public id: string, public displayName: string, public role: RoleEnum, public email: string) {}
}
