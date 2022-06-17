import { FileEntity } from '../../src/core/entity/file.entity';
import { validObjectId } from '../test_data/user.testData';
import {
  getDefaultUserValidationTest1,
  validationId1,
  validationId2,
  validValidationDocument1,
  validValidationEntity1,
  validValidationEntityList,
} from '../test_data/validation.testData';
import { Readable } from 'stream';

export class ValidationServiceMock {
  createValidation = jest.fn((file: FileEntity, userId: string) => {
    if (userId === getDefaultUserValidationTest1().id) {
      return Promise.resolve(validObjectId.toString());
    }
    throw new Error();
  });

  getValidationList = jest.fn(() => {
    return Promise.resolve(validValidationEntityList());
  });

  getValidationForUser = jest.fn(() => {
    return Promise.resolve([validValidationEntity1()]);
  });

  updateValidation = jest.fn(() => {
    return Promise.resolve(validValidationEntity1());
  });

  deleteValidationsByUser = jest.fn();

  deleteValidation = jest.fn((id: string) => {
    if (validationId1 === id || validationId2 === id) {
      return Promise.resolve(validValidationDocument1());
    }
    return Promise.resolve(null);
  });

  getValidationImage = jest.fn(() => {
    return {
      body: Readable.from([1, 2]),
      contentType: 'application/octet-stream',
    };
  });
}
