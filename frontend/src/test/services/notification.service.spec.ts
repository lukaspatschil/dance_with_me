import { TestBed } from '@angular/core/testing';

import { NotificationService } from '../../app/services/notification.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';

describe('NotificationService', () => {
  let sut: NotificationService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    sut = TestBed.inject(NotificationService);
    httpTestingController = TestBed.inject(HttpTestingController);

  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('addPushSubscriber', () => {
    it('should send a post request to subscribe', () => {
      // When
      sut.addPushSubscriber({}).subscribe(() => {});

      // Then
      const req = httpTestingController.expectOne(`${environment.baseUrl}/notification/subscribe`);
      expect(req.request.method).toBe('POST');
    });

    it('should post the correct body', () => {
      // Given
      const body = {};

      // When
      sut.addPushSubscriber(body).subscribe(() => {});

      // Then
      const req = httpTestingController.expectOne(`${environment.baseUrl}/notification/subscribe`);
      expect(req.request.body).toEqual(body);
    });
  });

  describe('getIndex', () => {
    it('should call the endpoint with get', () => {
      // When
      sut.getIndex().subscribe(() => {});

      // Then
      const req = httpTestingController.expectOne(`${environment.baseUrl}/notification`);
      expect(req.request.method).toBe('GET');
    });
  });

  describe('send', () => {
    it('should send post request', () => {
      // Given
      // When
      sut.send().subscribe(() => {});

      // Then
      const req = httpTestingController.expectOne(`${environment.baseUrl}/notification`);
      expect(req.request.method).toBe('POST');
    });
  });
});
