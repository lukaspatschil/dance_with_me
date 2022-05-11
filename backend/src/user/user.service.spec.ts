import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { UserDocument } from '../core/schema/user.schema';
import { UserModelMock } from '../../test/stubs/user.model.mock';
import { Model } from 'mongoose';
import {
  nonExistingObjectId,
  validObjectId,
  validUserDocument,
  validUserEntity,
} from '../../test/test_data/user.testData';

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
      const validUser = validUserDocument;
      validUser._id = validObjectId.toString();

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
  });

  describe('findAndUpdateOrCreate', () => {
    it('returns user with updated attributes if it exists', async () => {
      // Given
      validUserEntity.id = validObjectId.toString();
      validUserEntity.pictureUrl = 'https://example.com/newPictureUrl';
      const { id: _, ...userEntity } = validUserEntity;

      // When
      const response = await sut.findAndUpdateOrCreate(validUserEntity);

      // Then
      expect(response).toEqual(validUserEntity);
      expect(userDocumentMock.findByIdAndUpdate).toHaveBeenCalledWith(
        validObjectId.toString(),
        {
          $set: expect.objectContaining(userEntity),
        },
        expect.any(Object),
      );
    });

    it('returns new user if it did not exist', async () => {
      // Given
      validUserEntity.id = nonExistingObjectId.toString();
      validUserEntity.pictureUrl = 'https://example.com/newPictureUrl';
      const { id: _, ...userEntity } = validUserEntity;

      // When
      const response = await sut.findAndUpdateOrCreate(validUserEntity);

      // Then
      expect(response).toEqual(validUserEntity);
      expect(userDocumentMock.findByIdAndUpdate).toHaveBeenCalledWith(
        nonExistingObjectId.toString(),
        { $set: expect.objectContaining(userEntity) },
        expect.any(Object),
      );
      expect(userDocumentMock.create).toHaveBeenCalledWith(
        expect.objectContaining(userEntity),
      );
    });
  });
});
