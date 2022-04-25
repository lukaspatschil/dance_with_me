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
});
