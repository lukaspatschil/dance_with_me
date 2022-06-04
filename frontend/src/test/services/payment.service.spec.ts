import { TestBed } from '@angular/core/testing';

import { PaymentService } from '../../app/services/payment.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';

describe('PaymentService', () => {
  let sut: PaymentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    sut = TestBed.inject(PaymentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('finalizePayment', () => {
    it('should send a request to the server for a new payment', () => {
      // Given
      const paymentMethodId = 'StripeId';
      const eventId = 'eventId';

      // When
      sut.finalizePayment(paymentMethodId, eventId).subscribe(() => {});

      // Then
      const req = httpMock.expectOne(`${environment.baseUrl}/payment`);
      expect(req.request.method).toBe('POST');
    });

    it('should send a request to the server with the body', () => {
      // Given
      const paymentMethodId = 'StripeId';
      const eventId = 'eventId';

      // When
      sut.finalizePayment(paymentMethodId, eventId).subscribe(() => {});

      // Then
      const req = httpMock.expectOne(`${environment.baseUrl}/payment`);
      expect(req.request.body).toEqual({ paymentMethodId, eventId });
    });
  });
});
