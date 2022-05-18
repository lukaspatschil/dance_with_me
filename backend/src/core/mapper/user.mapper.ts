import { UserDocument } from '../schema/user.schema';
import { UserEntity } from '../entity/user.entity';
import { UserDto } from '../dto/user.dto';

export class UserMapper {
  static mapDocumentToEntity(user: UserDocument): Required<UserEntity> {
    const userEntity = new UserEntity();
    userEntity.id = user._id;
    userEntity.role = user.role;
    userEntity.displayName = user.displayName;
    userEntity.firstName = user.firstName;
    userEntity.lastName = user.lastName;
    userEntity.email = user.email;
    userEntity.emailVerified = user.emailVerified;
    userEntity.pictureUrl = user.pictureUrl;

    return userEntity as Required<UserEntity>;
  }

  static mapEntityToDto(user: UserEntity): UserDto {
    const userDto = new UserDto();
    userDto.id = user.id;
    userDto.firstName = user.firstName;
    userDto.lastName = user.lastName;
    userDto.email = user.email;
    userDto.displayName = user.displayName;
    userDto.role = user.role;
    userDto.pictureUrl = user.pictureUrl;

    return userDto;
  }
}
