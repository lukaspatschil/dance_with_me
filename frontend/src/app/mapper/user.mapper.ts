import {UserDto} from "../dto/user.dto";
import {UserEntity} from "../entities/user.entity";

export class UserMapper {
  public static dtoToEntity(userDto: UserDto): UserEntity | null {
    let userEntity: UserEntity | null = null;
    if (userDto.id && userDto.displayName && userDto.firstName && userDto.lastName && userDto.role) {
      userEntity = new UserEntity(userDto.id, userDto.displayName, userDto.firstName, userDto.lastName, userDto.role);
      userEntity.pictureUrl = userDto.pictureUrl;
    }

    return userEntity;
  }
}
