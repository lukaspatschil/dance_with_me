import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { NotFoundException } from '@nestjs/common';
import {
  nonExistingObjectId,
  validObjectId,
} from '../../test/test_data/user.testData';
import { UserServiceMock } from '../../test/stubs/user.service.mock';

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

    it('should call the service and throw a NotFoundException', async () => {
      // When
      const result = async () =>
        await sut.deleteUser(nonExistingObjectId.toString());

      // Then
      await expect(result).rejects.toThrow(new NotFoundException());
    });
  });
});
