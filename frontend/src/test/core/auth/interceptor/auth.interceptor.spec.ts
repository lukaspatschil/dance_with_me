import { TestBed } from '@angular/core/testing';

import { AuthInterceptor } from '../../../../app/core/auth/interceptor/auth.interceptor';
import { AuthService } from '../../../../app/core/auth/auth.service';
import { AuthServiceMock } from '../../../mock/auth.service.mock';
import { HttpHandler, HttpRequest } from '@angular/common/http';

describe('AuthInterceptor', () => {

  let sut: AuthInterceptor;

  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthInterceptor,
        { provide: AuthService, useClass: AuthServiceMock }
      ]
    });

    sut = TestBed.inject(AuthInterceptor);
    authService = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('intercept', () => {
    it('should add authorization header', () => {
      // Given
      const request = new HttpRequest('GET', 'http://localhost:8080/api/v1/users');
      request.headers.set = jest.fn();
      const next = { handle: jest.fn() } as unknown as HttpHandler;

      // When
      sut.intercept(request, next);

      // Then
      expect(request.headers.set).toHaveBeenCalledWith('Authorization', 'Bearer token');
    });

    it('should return the request with the authorization header set', () => {
      // Given
      const request = new HttpRequest('GET', 'http://localhost:8080/api/v1/users');
      const next = { handle: jest.fn() } as unknown as HttpHandler;

      // When
      sut.intercept(request, next);

      // Then
      const expectedRequest = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${authService.getToken}`),
        withCredentials: true
      });
      expect(next.handle).toHaveBeenCalledWith(expectedRequest);
    });

    it('should not set the header on open api endpoints', () => {
      // Given
      const request = new HttpRequest('GET', 'http://localhost:3000/auth/login_redirect/google');
      const next = { handle: jest.fn() } as unknown as HttpHandler;

      // When
      sut.intercept(request, next);

      // Then
      expect(next.handle).toHaveBeenCalledWith(request);
    });
  });
});
