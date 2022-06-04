import { TestBed } from '@angular/core/testing';

import { LoginGuard } from '../../../app/core/auth/login.guard';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../../app/core/auth/auth.service';
import { AuthServiceMock } from '../../mock/auth.service.mock';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

describe('LoginGuard', () => {
  let sut: LoginGuard;

  let authService: AuthService;

  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [LoginGuard, { provide: AuthService, useClass: AuthServiceMock }]
    });

    sut = TestBed.inject(LoginGuard);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true if the access token and refresh token are not received', () => {
      // Given
      const route = {} as unknown as ActivatedRouteSnapshot;

      // When
      const result = sut.canActivate(route);

      // Then
      expect(result).toBeTruthy();
    });

    it('should set the tokens in the AuthService', () => {
      // Given
      const accessToken = 'accessToken';
      const refreshToken = 'refreshToken';
      const route = { fragment: `access_token=${accessToken}&refresh_token=${refreshToken}` } as unknown as ActivatedRouteSnapshot;

      // When
      sut.canActivate(route);

      // Then
      expect(authService.setTokens).toHaveBeenCalledWith(accessToken, refreshToken);
    });

    it('should redirect to / if the access token and refresh token are set', () => {
      // Given
      const route = { fragment: 'access_token=123&refresh_token=456' } as unknown as ActivatedRouteSnapshot;

      // When
      const result = sut.canActivate(route);

      // Then
      const expectedResult = router.parseUrl('/');
      expect(result).toEqual(expectedResult);
    });
  });
});
