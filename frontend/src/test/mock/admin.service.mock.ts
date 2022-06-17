import { of } from 'rxjs';

export class AdminServiceMock {
  getAllRequests = jest.fn().mockReturnValue(of([]));

  updateRequest = jest.fn().mockReturnValue(of({}));
}
