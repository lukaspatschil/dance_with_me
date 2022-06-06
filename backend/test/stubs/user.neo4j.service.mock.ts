export class UserNeo4jServiceMock {
  write = jest.fn(() => {
    return Promise.resolve();
  });
}
