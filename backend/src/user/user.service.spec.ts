import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { UserDocument } from '../core/schema/user.schema';
import { UserModelMock } from '../../test/stubs/user.model.mock';
import { Model } from 'mongoose';
import {
  createUserEntity,
  invalidObjectId,
  nonExistingObjectId,
  throwADataBaseException,
  validObjectId,
  validUserDocument,
  validUserEntity,
} from '../../test/test_data/user.testData';
import { InternalServerErrorException } from '@nestjs/common';
import { NotFoundError } from '../core/error/notFound.error';
import { EventService } from '../event/event.service';
import { EventServiceForUserServiceMock } from '../../test/stubs/event.service.for.User.service.mock';

/* eslint @typescript-eslint/naming-convention: 0 */

describe('UserService', () => {
  let sut: UserService;
  let userDocumentMock: Model<UserDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(UserDocument.name),
          useClass: UserModelMock,
        },
        {
          provide: EventService,
          useClass: EventServiceForUserServiceMock,
        },
      ],
    }).compile();

    sut = module.get<UserService>(UserService);
    userDocumentMock = module.get<Model<UserDocument>>(
      getModelToken(UserDocument.name),
    );
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('deleteUser', () => {
    it('should call the database', async () => {
      // When
      await sut.deleteUser(validObjectId.toString());

      // Then
      expect(userDocumentMock.findByIdAndDelete).toHaveBeenCalledWith(
        validObjectId.toString(),
      );
    });

    it('should call the service and delete a user', async () => {
      // Given
      const validUser = { ...validUserDocument, _id: validObjectId.toString() };

      // When
      const response = await sut.deleteUser(validObjectId.toString());

      // Then
      expect(response).toEqual(validUser as UserDocument);
    });

    it('should return null when deleting a non existing user', async () => {
      //Given
      const userId = nonExistingObjectId.toString();

      // When
      const response = await sut.deleteUser(userId);

      // Then
      expect(response).toBeNull();
    });

    it('should call the delete service, the database throws a database exception and the service should return an Internal Error', async () => {
      // Given
      const userId = throwADataBaseException.toString();

      // When
      const response = sut.deleteUser(userId);

      // Then
      await expect(response).rejects.toThrow(
        new InternalServerErrorException(),
      );
    });
  });

  describe('findAndUpdateOrCreate', () => {
    it('returns user with updated attributes if it exists', async () => {
      // Given
      const userEntity = {
        ...validUserEntity,
        id: validObjectId.toString(),
        pictureUrl: 'https://example.com/newPictureUrl',
      };
      const { id: _, ...expectedUserEntity } = userEntity;

      // When
      const response = await sut.findAndUpdateOrCreate(userEntity);

      // Then
      expect(response).toEqual(userEntity);
      expect(userDocumentMock.findByIdAndUpdate).toHaveBeenCalledWith(
        validObjectId.toString(),
        {
          $set: expect.objectContaining(expectedUserEntity),
        },
        expect.any(Object),
      );
    });

    it('returns new user if it did not exist', async () => {
      // Given
      const userEntity = {
        ...validUserEntity,
        id: nonExistingObjectId.toString(),
        pictureUrl: 'https://example.com/newPictureUrl',
      };
      const { id: _, ...expectedUserEntity } = userEntity;

      // When
      const response = await sut.findAndUpdateOrCreate(userEntity);

      // Then
      expect(response).toEqual(userEntity);
      expect(userDocumentMock.findByIdAndUpdate).toHaveBeenCalledWith(
        nonExistingObjectId.toString(),
        { $set: expect.objectContaining(expectedUserEntity) },
        expect.any(Object),
      );
      expect(userDocumentMock.create).toHaveBeenCalledWith(
        expect.objectContaining(expectedUserEntity),
      );
    });
  });

  describe('getUser', () => {
    it('should call the database', async () => {
      // When
      await sut.getUser(validObjectId.toString());

      // Then
      expect(userDocumentMock.findById).toHaveBeenCalledWith(
        validObjectId.toString(),
      );
    });

    it('should call the service and return a user', async () => {
      // Given
      const expectedValue = createUserEntity();
      expectedValue.id = validObjectId.toString();

      // When
      const response = await sut.getUser(validObjectId.toString());

      // Then
      expect(response).toEqual(expectedValue);
    });

    it('should call the service and the database throws an exception', async () => {
      // When
      const result = async () =>
        await sut.getUser(throwADataBaseException.toString());

      // Then
      await expect(result).rejects.toThrow(InternalServerErrorException);
    });

    it('should call the service and the database does not find a user', async () => {
      // When
      const result = async () => await sut.getUser(invalidObjectId.toString());

      // Then
      await expect(result).rejects.toThrow(NotFoundError);
    });
  });
});
