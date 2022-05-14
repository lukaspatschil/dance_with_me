import {RoleEnum} from "../enums/role.enum";

export class UserDto {
  id?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  pictureUrl?: string;
  role?: RoleEnum;
}
