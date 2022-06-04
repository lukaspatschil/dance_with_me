export class EventServiceForUserServiceMock {
  deleteUsersFromFutureEvents = jest.fn(() => {
    return Promise.resolve();
  });
}
