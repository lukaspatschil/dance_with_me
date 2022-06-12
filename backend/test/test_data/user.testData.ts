import mongoose from 'mongoose';
import { RoleEnum } from '../../src/core/schema/enum/role.enum';
import { UserEntity } from '../../src/core/entity/user.entity';
import { UserDto } from '../../src/core/dto/user.dto';

/* eslint @typescript-eslint/naming-convention: 0 */

export const validObjectId = new mongoose.Types.ObjectId();
export const nonExistingObjectId = new mongoose.Types.ObjectId();
export const throwADataBaseException = new mongoose.Types.ObjectId();
export const invalidObjectId = 'xxxxxxxxxxxxxxxxxxx';

export const validUserDocument = {
  _id: '',
  role: RoleEnum.USER,
  displayName: 'Testo1',
  firstName: 'Tester',
  lastName: 'Tester',
  email: 'test@test.com',
  emailVerified: false,
  pictureUrl: 'http://test.com/image.png',
};

export const validUserEntity: UserEntity = {
  id: '',
  role: RoleEnum.USER,
  displayName: 'Testo1',
  firstName: 'Tester',
  lastName: 'Tester',
  email: 'test@test.com',
  emailVerified: false,
  pictureUrl: 'http://test.com/image.png',
};

export const validUserDto: UserDto = {
  id: '',
  firstName: 'Tester',
  lastName: 'Tester',
  email: 'test@test.com',
  emailVerified: false,
  displayName: 'Testo1',
  role: RoleEnum.USER,
  pictureUrl: 'http://test.com/image.png',
};

export function createUserEntity(): UserEntity {
  const validUserEntity2: UserEntity = {
    id: '',
    role: RoleEnum.USER,
    displayName: 'Testo1',
    firstName: 'Tester',
    lastName: 'Tester',
    email: 'test@test.com',
    emailVerified: false,
    pictureUrl: 'http://test.com/image.png',
  };

  return validUserEntity2;
}

export function createUserDocument() {
  const validUserDocument2 = {
    _id: '',
    role: RoleEnum.USER,
    displayName: 'Testo1',
    firstName: 'Tester',
    lastName: 'Tester',
    email: 'test@test.com',
    emailVerified: false,
    pictureUrl: 'http://test.com/image.png',
  };

  return validUserDocument2;
}

export function createUserDto(): UserDto {
  const validUserDto2: UserDto = {
    id: '',
    firstName: 'Tester',
    lastName: 'Tester',
    email: 'test@test.com',
    emailVerified: false,
    displayName: 'Testo1',
    role: RoleEnum.USER,
    pictureUrl: 'http://test.com/image.png',
  };
  return validUserDto2;
}
