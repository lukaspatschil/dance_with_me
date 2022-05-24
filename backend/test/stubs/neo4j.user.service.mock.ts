export class Neo4jUserServiceMock {
  write = jest.fn(() => {
    return Promise.resolve();
  });
}
