import { Test, TestingModule } from '@nestjs/testing';
import { ValidationService } from './validation.service';
import { ConfigService } from '@nestjs/config';
import { ConfigMock } from '../../test/stubs/config.mock';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { UserDocument } from '../core/schema/user.schema';
import { UserModelMock } from '../../test/stubs/user.model.mock';
import { ValidationDocument } from '../core/schema/validation.schema';
import { getS3ConnectionToken, S3 } from 'nestjs-s3';
import { MockS3Instance } from '../../test/stubs/s3.mock';
import { Connection, Model } from 'mongoose';
import { ConnectionMock } from '../../test/stubs/connection.mock';
import { ValidationModelMock } from '../../test/stubs/validation.model.mock';
import {
  invalidUserId1,
  invalidValidationId,
  notFoundValidationId,
  userId1,
  userId2,
  validationId1,
  validationId2,
  validValidationDocument1,
} from '../../test/test_data/validation.testData';
import { InternalServerErrorException } from '@nestjs/common';
import {
  bucketName,
  bucketStage,
  validFileEntity,
  validFileKey,
} from '../../test/test_data/image.testData';
import { ImageService } from '../image/image.service';
import { ImageServiceMock } from '../../test/stubs/image.service.mock';
import { ValidationRequestAlreadyExistsError } from '../core/error/validationRequestAlreadyExists.error';
import { ValidationStatusEnum } from '../core/schema/enum/validationStatus.enum';
import { ValidationRequestAlreadyResponded } from '../core/error/validationRequestAlreadyResponded';
import { NotFoundError } from '../core/error/notFound.error';
import { RoleEnum } from '../core/schema/enum/role.enum';

describe('ValidationService', () => {
  let sut: ValidationService;
  let connectionMock: Connection;
  let s3: S3;
  let userDocumentMock: Model<UserDocument>;
  let validationDocumentMock: Model<ValidationDocument>;
  let imageServiceMock: ImageService;
  let validationDocumentMockClass: ValidationModelMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getConnectionToken('Database'),
          useClass: ConnectionMock,
        },
        {
          provide: getS3ConnectionToken('default'),
          useClass: MockS3Instance,
        },
        {
          provide: getModelToken(UserDocument.name),
          useClass: UserModelMock,
        },
        {
          provide: getModelToken(ValidationDocument.name),
          useClass: ValidationModelMock,
        },
        {
          provide: ConfigService,
          useClass: ConfigMock,
        },
        {
          provide: ImageService,
          useClass: ImageServiceMock,
        },
        ValidationService,
      ],
    }).compile();

    sut = module.get<ValidationService>(ValidationService);
    connectionMock = module.get<Connection>(getConnectionToken('Database'));
    s3 = module.get<S3>(getS3ConnectionToken('default'));
    userDocumentMock = module.get<Model<UserDocument>>(
      getModelToken(UserDocument.name),
    );
    validationDocumentMock = module.get<Model<ValidationDocument>>(
      getModelToken(ValidationDocument.name),
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    validationDocumentMockClass = validationDocumentMock;
    imageServiceMock = module.get<ImageService>(ImageService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('createValidation', () => {
    it('should call the service and throw a InternalServerErrorException due to an already existing validation ', async () => {
      //WHEN
      const result = async () => {
        await sut.createValidation(validFileEntity(), invalidUserId1);
      };

      //THEN
      await expect(result).rejects.toThrow(ValidationRequestAlreadyExistsError);
    });

    it('should call the service and return correct id', async () => {
      //WHEN
      const result = await sut.createValidation(validFileEntity(), userId1);

      //THEN
      expect(result).toEqual(validFileKey);
    });

    it('should call the service and open, commit and close the session', async () => {
      //Given
      const session = await validationDocumentMock.startSession();

      //WHEN
      await sut.createValidation(validFileEntity(), userId1);

      //THEN
      expect(session.startTransaction).toHaveBeenCalled();
      expect(session.commitTransaction).toHaveBeenCalled();
      expect(session.endSession).toHaveBeenCalled();
    });

    it('should call the service, s3 create throws error and transaction is aborted and session is closed', async () => {
      //Given
      const session = await validationDocumentMock.startSession();

      //WHEN
      const result = sut.createValidation(validFileEntity(), userId2);

      //THEN
      await expect(result).rejects.toThrow(InternalServerErrorException);
      expect(session.startTransaction).toHaveBeenCalled();
      expect(session.abortTransaction).toHaveBeenCalled();
      expect(session.endSession).toHaveBeenCalled();
    });
  });

  describe('getValidationList', () => {
    it('should call the service and get a list containing two entries', async () => {
      //WHEN
      const result = await sut.getValidationList(ValidationStatusEnum.PENDING);

      //THEN
      expect(result.length).toEqual(2);
    });

    it('should call the service and throw a InternalServerError on database error', async () => {
      //WHEN
      const result = async () => {
        await sut.getValidationList(ValidationStatusEnum.REJECTED);
      };

      //THEN
      await expect(result).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('updateValidation', () => {
    beforeEach(() => {
      validationDocumentMock.findById = jest.fn().mockReturnThis();
    });
    it('should call the service and get a ValidationRequestAlreadyRespondedError when user already responded', async () => {
      //GIVEN
      validationDocumentMockClass._findAndUpdateInvalid = true;

      //WHEN
      const result = async () => {
        await sut.updateValidation(
          invalidValidationId,
          ValidationStatusEnum.APPROVED,
        );
      };

      //THEN
      await expect(result).rejects.toThrow(ValidationRequestAlreadyResponded);
    });

    it('should call the service and get a NotFoundError when validation does not exist', async () => {
      //GIVEN
      validationDocumentMockClass._findAndUpdateNotFound = true;

      //WHEN
      const result = async () => {
        await sut.updateValidation(
          notFoundValidationId,
          ValidationStatusEnum.APPROVED,
        );
      };

      //THEN
      await expect(result).rejects.toThrow(NotFoundError);
    });

    it('should call the service and update validation', async () => {
      //GIVEN
      validationDocumentMockClass._findUserValid = true;
      //WHEN
      const result = await sut.updateValidation(
        validationId1,
        ValidationStatusEnum.APPROVED,
      );

      //THEN
      expect(result.status).toEqual(ValidationStatusEnum.APPROVED);
    });

    it('should call the service and call the findByIdAndUpdate on the userdocument', async () => {
      //GIVEN
      validationDocumentMockClass._findUserValid = true;
      //WHEN
      await sut.updateValidation(validationId1, ValidationStatusEnum.APPROVED);

      //THEN
      expect(userDocumentMock.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should call the service and call the findByIdAndUpdate with the correct user id and role enum', async () => {
      //GIVEN
      validationDocumentMockClass._findUserValid = true;
      //WHEN
      await sut.updateValidation(validationId1, ValidationStatusEnum.APPROVED);

      //THEN
      expect(userDocumentMock.findByIdAndUpdate).toBeCalledWith(userId1, {
        role: RoleEnum.ORGANISER,
      });
    });

    it('should call the service and call the findByIdAndUpdate with the correct validation id and validation status enum', async () => {
      //GIVEN
      validationDocumentMockClass._findUserValid = true;
      //WHEN
      await sut.updateValidation(validationId1, ValidationStatusEnum.APPROVED);

      //THEN
      expect(validationDocumentMock.findByIdAndUpdate).toBeCalledWith(
        validationId1,
        { $set: { status: ValidationStatusEnum.APPROVED } },
        { new: true },
      );
    });

    it('should call the service and call the findByIdAndUpdate with the correct validation id, validation status enum and comment', async () => {
      //GIVEN
      validationDocumentMockClass._findUserValid = true;
      //GIVEN
      const comment = 'Yep';

      //WHEN
      await sut.updateValidation(
        validationId1,
        ValidationStatusEnum.APPROVED,
        comment,
      );

      //THEN
      expect(validationDocumentMock.findByIdAndUpdate).toBeCalledWith(
        validationId1,
        { $set: { status: ValidationStatusEnum.APPROVED, comment: comment } },
        { new: true },
      );
    });

    it('should call the service and open, commit and close the session', async () => {
      //GIVEN
      validationDocumentMockClass._findUserValid = true;
      //GIVEN
      const comment = 'Yep';
      const session = await connectionMock.startSession();

      //WHEN
      await sut.updateValidation(
        validationId1,
        ValidationStatusEnum.APPROVED,
        comment,
      );

      //THEN
      expect(session.startTransaction).toHaveBeenCalled();
      expect(session.commitTransaction).toHaveBeenCalled();
      expect(session.endSession).toHaveBeenCalled();
    });

    it('should call the service userdocument throws error and transaction is aborted and session is closed', async () => {
      //GIVEN
      validationDocumentMockClass._findUserValid = true;
      //GIVEN
      const session = await connectionMock.startSession();

      //WHEN
      const result = async () => {
        await sut.updateValidation(
          validationId2,
          ValidationStatusEnum.APPROVED,
        );
      };

      //THEN
      await expect(result).rejects.toThrow(InternalServerErrorException);
      expect(session.startTransaction).toHaveBeenCalled();
      expect(session.abortTransaction).toHaveBeenCalled();
      expect(session.endSession).toHaveBeenCalled();
    });
  });

  describe('getValidationImage', () => {
    it('should call the service and call the image service with correct key', async () => {
      //GIVEN
      const key = `validation/${validationId1}`;

      //WHEN
      await sut.getValidationImage(validationId1);

      //THEN
      expect(imageServiceMock.getImage).toBeCalledWith(key);
    });
  });

  describe('deleteValidation', () => {
    it('should call the service and call deleteObject on S3 with the correct key', async () => {
      //GIVEN
      const config = {
        Bucket: bucketName + bucketStage,
        Key: `validation/${validationId1}`,
      };

      //WHEN
      await sut.deleteValidation(validationId1);

      //THEN
      expect(s3.deleteObject).toBeCalledWith(config);
    });

    it('should call the service and return the correct document', async () => {
      //WHEN
      const result = await sut.deleteValidation(validationId1);

      //THEN
      expect(result).toEqual(validValidationDocument1());
    });

    it('should call the service with invalid id and throw an InternalServerErrorException', async () => {
      //WHEN
      const result = async () => {
        await sut.deleteValidation(invalidValidationId);
      };

      //THEN
      await expect(result).rejects.toThrow(InternalServerErrorException);
    });

    it('should call the service s3 delete throws error and transaction is aborted and session is closed', async () => {
      //GIVEN
      const session = await validationDocumentMock.startSession();

      //WHEN
      const result = async () => {
        await sut.deleteValidation(invalidValidationId);
      };

      //THEN
      await expect(result).rejects.toThrow(InternalServerErrorException);
      expect(session.startTransaction).toHaveBeenCalled();
      expect(session.abortTransaction).toHaveBeenCalled();
      expect(session.endSession).toHaveBeenCalled();
    });
  });
});
