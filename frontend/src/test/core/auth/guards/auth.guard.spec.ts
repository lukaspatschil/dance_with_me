import { TestBed } from '@angular/core/testing';

import { AuthGuard } from '../../../../app/core/auth/guards/auth.guard';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../../../app/core/auth/auth.service';
import { AuthServiceMock } from '../../../mock/auth.service.mock';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

describe('AuthGuard', () => {

  let sut: AuthGuard;

  let authService: AuthService;

  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [AuthGuard, { provide: AuthService, useClass: AuthServiceMock }]
    });

    sut = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true if the user is authenticated', () => {
      // When
      const result = sut.canActivate();

      // Then
      expect(result).toBeTruthy();
    });

    it('should redirect if the user is not authenticated', () => {
      // Given
      jest.spyOn(router, 'parseUrl');
      authService.isAuthenticated = jest.fn().mockReturnValue(false);

      // When
      sut.canActivate();

      // Then
      expect(router.parseUrl).toHaveBeenCalledWith(environment.loginUrl);
    });

    it('should return the UrlTree to redirect', () => {
      // Given
      jest.spyOn(router, 'parseUrl');
      authService.isAuthenticated = jest.fn().mockReturnValue(false);

      // When
      const result = sut.canActivate();

      // Then
      const expectedUrl = router.parseUrl(environment.loginUrl);
      expect(result).toEqual(expectedUrl);
    });
  });
});
