import {
  createUserEntity,
  validObjectId,
  validUserDocument,
} from '../test_data/user.testData';

export class UserServiceMock {
  deleteUser = jest.fn((id: string) => {
    if (id === validObjectId.toString()) {
      const user = validUserDocument;
      user._id = id;
      return Promise.resolve(user);
    } else {
      return Promise.resolve(null);
    }
  });

  getUser = jest.fn((id: string) => {
    if (id === 'adminId' || id === 'userId') {
      const user = createUserEntity();
      user.id = id;
      return Promise.resolve(user);
    } else {
      return Promise.resolve(null);
    }
  });
}
