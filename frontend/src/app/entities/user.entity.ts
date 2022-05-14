import {RoleEnum} from "../enums/role.enum";

export class UserEntity {
  pictureUrl?: string;

  constructor(public id: string, public firstName: string, public lastName: string, public displayName: string, public role: RoleEnum) {}
}
