import { TestBed } from '@angular/core/testing';

import { AuthGuard } from '../../../../app/core/auth/guards/auth.guard';
import {RouterTestingModule} from "@angular/router/testing";
import {AuthService} from "../../../../app/core/auth/auth.service";
import {AuthServiceMock} from "../../../mock/auth.service.mock";
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {RefreshGuard} from "../../../../app/core/auth/guards/refresh.guard";

describe('RefreshGuard', () => {

  let sut: RefreshGuard;

  let authService: AuthService;

  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [RefreshGuard, { provide: AuthService, useClass: AuthServiceMock }]
    });

    sut = TestBed.inject(RefreshGuard);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true', async () => {
      // Given
      const route = {} as unknown as ActivatedRouteSnapshot;
      const state = {} as RouterStateSnapshot;

      // When
      const result = await sut.canActivate(route, state);

      // Then
      expect(result).toBeTruthy();
    });

    it('should try to refresh the access token if not authenticated', async () => {
      // Given
      authService.isAuthenticated = jest.fn().mockReturnValue(false);
      const route = {} as unknown as ActivatedRouteSnapshot;
      const state = {} as RouterStateSnapshot;

      // When
      await sut.canActivate(route, state);

      // Then
      expect(authService.refreshAccessToken).toHaveBeenCalled();
    });
  });
});
