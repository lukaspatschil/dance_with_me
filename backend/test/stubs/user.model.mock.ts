import {
  createUserDocument,
  throwADataBaseException,
  validObjectId,
  validUserDocument,
} from '../test_data/user.testData';

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

export class UserModelMock {
  findByIdAndDelete = jest.fn((id: string) => {
    if (id === validObjectId.toString()) {
      const user = validUserDocument;
      user._id = id;
      return execWrap(Promise.resolve(user));
    } else if (id === throwADataBaseException.toString()) {
      return execWrap(new Error('Random Database Error'));
    } else {
      return execWrap(Promise.resolve(null));
    }
  });

  findByIdAndUpdate = jest.fn((id: string, { $set }, options) => {
    if (id === validObjectId.toString() || options?.upsert === true) {
      const user = {
        ...validUserDocument,
        ...$set,
        _id: id,
      };
      return execWrap(Promise.resolve(options?.new ? user : validUserDocument));
    } else {
      return execWrap(Promise.resolve(null));
    }
  });

  create = jest.fn((user: any) => {
    return Promise.resolve(user);
  });

  findById = jest.fn((id: string) => {
    if (id === validObjectId.toString()) {
      const user = createUserDocument();
      user._id = id;
      return execWrap(Promise.resolve(user));
    } else if (id === throwADataBaseException.toString()) {
      return execWrap(new Error('Database error'));
    } else {
      return execWrap(Promise.resolve(null));
    }
  });
}
