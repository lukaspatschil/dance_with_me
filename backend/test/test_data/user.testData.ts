import mongoose from 'mongoose';
import { RoleEnum } from '../../src/core/schema/enum/role.enum';
import { UserEntity } from '../../src/core/entity/user.entity';
import { UserDto } from '../../src/core/dto/user.dto';
import { AuthUser } from '../../src/auth/interfaces';

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
  return {
    id: '',
    role: RoleEnum.USER,
    displayName: 'Testo1',
    firstName: 'Tester',
    lastName: 'Tester',
    email: 'test@test.com',
    emailVerified: false,
    pictureUrl: 'http://test.com/image.png',
  };
}

export function createUserDocument() {
  return {
    _id: '',
    role: RoleEnum.USER,
    displayName: 'Testo1',
    firstName: 'Tester',
    lastName: 'Tester',
    email: 'test@test.com',
    emailVerified: false,
    pictureUrl: 'http://test.com/image.png',
  };
}

export function createUserDto(): UserDto {
  return {
    id: '',
    firstName: 'Tester',
    lastName: 'Tester',
    email: 'test@test.com',
    emailVerified: false,
    displayName: 'Testo1',
    role: RoleEnum.USER,
    pictureUrl: 'http://test.com/image.png',
  };
}

export const adminAuthUser: Readonly<AuthUser> = {
  id: '',
  role: RoleEnum.ADMIN,
  displayName: 'Admin User',
};

export const organizerAuthUser: Readonly<AuthUser> = {
  id: '',
  role: RoleEnum.ORGANISER,
  displayName: 'Organizer User',
};
