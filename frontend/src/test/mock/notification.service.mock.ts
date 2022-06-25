import { of } from 'rxjs';

export class NotificationServiceMock {
  send = jest.fn().mockReturnValue(of({}));
}
