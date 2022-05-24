export class Neo4jEventServiceMock {
  write = jest.fn(() => {
    return Promise.resolve();
  });
}
