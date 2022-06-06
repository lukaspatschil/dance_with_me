export class EventNeo4jServiceMock {
  write = jest.fn(() => {
    return Promise.resolve();
  });
}
