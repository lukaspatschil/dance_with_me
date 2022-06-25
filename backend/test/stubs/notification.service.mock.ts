export class NotificationServiceMock {
  getIndex = jest.fn().mockReturnValue('test');

  sendNotification = jest.fn();

  addSubscription = jest.fn();
}
