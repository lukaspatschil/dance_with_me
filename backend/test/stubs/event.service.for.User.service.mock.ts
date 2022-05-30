export class EventServiceForUserServiceMock {
  deleteUsersFromFutureEvents = jest.fn((userId: string) => {
    return Promise.resolve();
  });
}
