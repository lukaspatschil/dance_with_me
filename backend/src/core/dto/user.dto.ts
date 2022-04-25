import { IsEmail, IsEnum, IsNotEmpty, IsUrl } from 'class-validator';
import { RoleEnum } from '../schema/enum/role.enum';

export class UserDto {
  @IsNotEmpty()
  id!: string;

  @IsNotEmpty()
  firstName!: string;

  @IsNotEmpty()
  lastName!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  displayName!: string;

  @IsNotEmpty()
  @IsEnum(RoleEnum)
  role!: RoleEnum;

  @IsNotEmpty()
  @IsUrl()
  pictureUrl!: string;
}
