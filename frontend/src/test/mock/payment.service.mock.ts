import { of } from 'rxjs';

export class PaymentServiceMock {
  finalizePayment = jest.fn().mockReturnValue(of({}));
}
