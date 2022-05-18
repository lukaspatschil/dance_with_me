import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import {
  createUserDto,
  nonExistingObjectId,
  validObjectId,
} from '../../test/test_data/user.testData';
import { UserServiceMock } from '../../test/stubs/user.service.mock';
import { UserEntity } from '../core/entity/user.entity';
import { RoleEnum } from '../core/schema/enum/role.enum';
import { NotFoundError } from '../core/error/notFound.error';
import { MissingPermissionError } from '../core/error/missingPermission.error';

describe('UserController', () => {
  let sut: UserController;
  let userServiceMock: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserService,
          useClass: UserServiceMock,
        },
      ],
      controllers: [UserController],
    }).compile();

    sut = module.get<UserController>(UserController);
    userServiceMock = module.get<UserService>(UserService);
  });

  const userUser: UserEntity = {
    id: 'userId',
    role: RoleEnum.USER,
    displayName: 'Martha Mock',
    firstName: 'Martha',
    lastName: 'Mock',
    email: 'mock@example.com',
    emailVerified: true,
    pictureUrl: 'https://example.com/mock.jpg',
  };

  const userAdmin: UserEntity = {
    id: 'adminId',
    role: RoleEnum.ADMIN,
    displayName: 'Stuby Stub',
    firstName: 'Stuby',
    lastName: 'Stub',
    email: 'stuby@example.com',
    emailVerified: true,
    pictureUrl: 'https://example.com/stuby.jpg',
  };

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('deleteUser', () => {
    it('should call the service with correct userId', async () => {
      // When
      sut.deleteUser(validObjectId.toString());

      // Then
      expect(userServiceMock.deleteUser).toHaveBeenCalledWith(
        validObjectId.toString(),
      );
    });

    it('should call the service with a non existing Id and throw a NotFoundException', async () => {
      // When
      const result = async () =>
        await sut.deleteUser(nonExistingObjectId.toString());

      // Then
      await expect(result).rejects.toThrow(NotFoundError);
    });
  });

  describe('getUser', () => {
    it('should call the service with correct userId', async () => {
      // When
      sut.getUser(userAdmin.id, userAdmin);

      // Then
      expect(userServiceMock.getUser).toHaveBeenCalledWith(userAdmin.id);
    });

    describe('using role User', () => {
      it('should call the service with correct userId and return the user', async () => {
        // Given
        const expectedValue = createUserDto();
        expectedValue.id = userUser.id;

        // When
        const result = await sut.getUser(userUser.id, userUser);

        // Then
        await expect(result).toEqual(expectedValue);
      });

      it('should call the service with different userId than the own user id and throw an exception', async () => {
        // Given

        const result = async () => await sut.getUser('testId', userUser);

        // Then
        await expect(result).rejects.toThrow(MissingPermissionError);
      });
    });

    describe('using role Admin', () => {
      it('should call the service with userId and return the user', async () => {
        // Given
        const expectedValue = createUserDto();
        expectedValue.id = userAdmin.id;

        // When
        const result = await sut.getUser(userAdmin.id, userAdmin);

        // Then
        await expect(result).toEqual(expectedValue);
      });

      it('should call the service with different userId than the own user id and should return an user', async () => {
        // Given
        const expectedValue = createUserDto();
        expectedValue.id = userUser.id;

        // When
        const result = await sut.getUser(userUser.id, userAdmin);

        // Then
        await expect(result).toEqual(expectedValue);
      });
    });
  });
});
