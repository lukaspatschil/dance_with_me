import {
  invalidUserId1,
  invalidValidationDocument,
  invalidValidationId,
  notFoundValidationId,
  userId1,
  userId2,
  validationId1,
  validationId2,
  validValidationDocument1,
  validValidationDocumentList,
} from '../test_data/validation.testData';
import { ValidationStatusEnum } from '../../src/core/schema/enum/validationStatus.enum';
import { invalidFilenameJPG, validFileKey } from '../test_data/image.testData';

/* eslint @typescript-eslint/naming-convention: 0 */
function execWrap<T>(val: T) {
  return {
    exec: jest.fn(() => {
      if (val instanceof Error) {
        throw val;
      }
      return val;
    }),
  };
}

export class ValidationModelMock {
  public _findStatusValid = false;

  public _findUserValid = false;

  public _findAndUpdateUserValid = false;

  public _findAndUpdateInvalid = false;

  public _findAndUpdateNotFound = false;

  session = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  };

  exists = jest.fn(
    (
      filter:
        | {
            $or: [
              { status: ValidationStatusEnum },
              { status: ValidationStatusEnum },
            ];
            id: string;
          }
        | { user: string },
    ) => {
      if ('user' in filter) {
        if (filter.user === userId1 || filter.user === userId2) {
          return execWrap(Promise.resolve(false));
        } else if (filter.user === invalidUserId1) {
          return execWrap(Promise.resolve(true));
        } else {
          throw new Error();
        }
      }
      if ('id' in filter) {
        if (filter.id === validationId1 || filter.id === validationId1) {
          return execWrap(Promise.resolve(true));
        } else {
          return execWrap(Promise.resolve(false));
        }
      }
      throw new Error();
    },
  );

  create = jest.fn((entity: { status: ValidationStatusEnum; user: string }) => {
    if (entity.user === userId1) {
      return { _id: validFileKey };
    } else {
      return { _id: invalidFilenameJPG };
    }
  });

  startSession = jest.fn().mockReturnValue(this.session);

  find = jest.fn(
    (filter: { status: ValidationStatusEnum } | { user: string }) => {
      if ('status' in filter) {
        if (filter.status === ValidationStatusEnum.PENDING) {
          this._findStatusValid = true;
          return this;
        } else {
          throw new Error();
        }
      }
      if ('user' in filter) {
        if (filter.user === userId1) {
          this._findUserValid = true;
          return this;
        } else {
          throw new Error();
        }
      }
      throw new Error();
    },
  );

  populate = jest.fn(() => {
    if (this._findStatusValid) {
      this._findStatusValid = false;
      return execWrap(Promise.resolve(validValidationDocumentList()));
    }
    if (this._findUserValid) {
      this._findUserValid = false;
      return execWrap(Promise.resolve(validValidationDocument1()));
    }
    if (this._findAndUpdateUserValid) {
      const validation = validValidationDocument1();
      validation.status = ValidationStatusEnum.APPROVED;
      return execWrap(Promise.resolve(validation));
    }
    if (this._findAndUpdateInvalid) {
      return execWrap(Promise.resolve(invalidValidationDocument()));
    }
    if (this._findAndUpdateNotFound) {
      return execWrap(Promise.resolve(null));
    }
    throw new Error();
  });

  findById = jest.fn((id: string) => {
    if (id === validationId1 || id === validationId2) {
      return execWrap(Promise.resolve(validValidationDocument1()));
    } else if (id === invalidValidationId) {
      return execWrap(Promise.resolve(invalidValidationDocument()));
    } else if (id === notFoundValidationId) {
      return execWrap(Promise.resolve(null));
    } else {
      throw new Error();
    }
  });

  findByIdAndUpdate = jest.fn((id: string, {}, {}) => {
    if (id === validationId1) {
      this._findAndUpdateUserValid = true;
      return this;
    } else {
      throw new Error();
    }
  });

  findByIdAndDelete = jest.fn((id: string) => {
    if (id === validationId1) {
      return execWrap(Promise.resolve(validValidationDocument1()));
    } else {
      throw new Error();
    }
  });
}
