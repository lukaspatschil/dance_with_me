import { TestBed } from '@angular/core/testing';

import { LoginGuard } from '../../../app/core/auth/login.guard';
import {RouterTestingModule} from "@angular/router/testing";
import {AuthService} from "../../../app/core/auth/auth.service";
import { AuthServiceMock } from '../../mock/auth.service.mock';
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from "@angular/router";

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
    it('should return true if the access token and refresh token are not received', async () => {
      // Given
      const route = {} as unknown as ActivatedRouteSnapshot;
      const state = {} as RouterStateSnapshot;

      // When
      const result = await sut.canActivate(route, state);

      // Then
      expect(result).toBeTruthy();
    });

    it('should set the tokens in the AuthService', async () => {
      // Given
      const accessToken = 'accessToken';
      const refreshToken = 'refreshToken';
      const route = { fragment: `access_token=${accessToken}&refresh_token=${refreshToken}`} as unknown as ActivatedRouteSnapshot;
      const state = {} as RouterStateSnapshot;

      // When
      await sut.canActivate(route, state);

      // Then
      expect(authService.setTokens).toHaveBeenCalledWith(accessToken, refreshToken);
    });

    it('should redirect to / if the access token and refresh token are set', async () => {
      // Given
      const route = { fragment: 'access_token=123&refresh_token=456'} as unknown as ActivatedRouteSnapshot;
      const state = {} as RouterStateSnapshot;

      // When
      const result = await sut.canActivate(route, state);

      // Then
      const expectedResult = router.parseUrl('/');
      expect(result).toEqual(expectedResult);
    });
  });
});
