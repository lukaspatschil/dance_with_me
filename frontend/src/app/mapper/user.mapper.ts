import {UserDto} from "../dto/user.dto";
import {UserEntity} from "../entities/user.entity";

export class UserMapper {
  public static dtoToEntity(userDto: UserDto): UserEntity | null {
    let userEntity: UserEntity | null = null;
    if (userDto.id && userDto.displayName && userDto.role && userDto.email && typeof userDto.emailVerified === "boolean") {
      userEntity = new UserEntity(userDto.id, userDto.displayName, userDto.role, userDto.email, userDto.emailVerified);
      userEntity.firstName = userDto.firstName;
      userEntity.lastName = userDto.lastName;
      userEntity.pictureUrl = userDto.pictureUrl;
    }

    return userEntity;
  }
}
