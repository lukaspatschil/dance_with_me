import {
  createUserDocument,
  throwADataBaseException,
  validObjectId,
  validUserDocument,
} from '../test_data/user.testData';

/* eslint @typescript-eslint/naming-convention: 0 */

export class UserModelMock {
  findByIdAndDelete = jest.fn((id: string) => {
    if (id === validObjectId.toString()) {
      const user = validUserDocument;
      user._id = id;
      return Promise.resolve(user);
    } else if (id === throwADataBaseException.toString()) {
      throw new Error('Random Database Error');
    } else {
      return Promise.resolve(null);
    }
  });

  findByIdAndUpdate = jest.fn((id: string, { $set }, options) => {
    if (id === validObjectId.toString() || options?.upsert === true) {
      const user = {
        ...validUserDocument,
        ...$set,
        _id: id,
      };
      return Promise.resolve(options?.new ? user : validUserDocument);
    } else {
      return Promise.resolve(null);
    }
  });

  create = jest.fn((user: any) => {
    return Promise.resolve(user);
  });

  findById = jest.fn((id: string) => {
    if (id === validObjectId.toString()) {
      const user = createUserDocument();
      user._id = id;
      return Promise.resolve(user);
    } else if (id === throwADataBaseException.toString()) {
      throw new Error('Database error');
    } else {
      return Promise.resolve(null);
    }
  });
}
