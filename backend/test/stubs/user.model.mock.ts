import {
  nonExistingObjectId,
  throwADataBaseException,
  validObjectId,
  validUserDocument,
} from '../test_data/user.testData';

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
    if (
      id === nonExistingObjectId.toString() &&
      (options === {} || options.upsert !== true || options.new !== true)
    ) {
      throw new Error('Invalid options');
    }

    if (id === validObjectId.toString()) {
      const user = {
        ...validUserDocument,
        ...$set,
        _id: id,
      };
      return Promise.resolve(user);
    } else {
      return Promise.resolve(null);
    }
  });

  create = jest.fn((user: any) => {
    return Promise.resolve(user);
  });
}
