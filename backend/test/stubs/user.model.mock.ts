import { validObjectId, validUserDocument } from '../test_data/user.testData';

export class UserModelMock {
  findByIdAndDelete = jest.fn((id: string) => {
    if (id === validObjectId.toString()) {
      const user = validUserDocument;
      user._id = id;
      return Promise.resolve(user);
    } else {
      return Promise.resolve(null);
    }
  });

  findByIdAndUpdate = jest.fn((id: string, { $set }) => {
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
