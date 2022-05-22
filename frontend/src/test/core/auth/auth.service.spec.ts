import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../../app/core/auth/auth.service';
import {TokenStorageService} from "../../../app/core/auth/token.service";
import {TokenStorageServiceMock} from "../../mock/token.service.mock";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import {PasetoService} from "../../../app/core/auth/paseto.service";
import { PasetoMockService } from '../../mock/paseto.service.mock';
import {UserService} from "../../../app/services/user.service";
import {UserServiceMock} from "../../mock/user.service.mock";

describe('AuthService', () => {
  let sut: AuthService;

  let httpMock: HttpTestingController;

  let tokenService: TokenStorageService;

  let router: Router;

  let pasetoService: PasetoService;
  let userService: UserService;

  const accessToken = 'v1.local.cCvLxEWrOPnZ5WfnYVNKh61Peo_k-IuvF7oqFFqn1knwg4Sh8ry5dhpsB5k_qQ3ercZAHA1zowyt10SdPCa3OMF2RxD3zzMeedpVi8RQKSyKyghhTrC1HhFn1Z5p3WytaAK4HP81SuDK7LfianTv0do4J0in4fc2HWFTdIGxjE3Xx9N0wAhrQ_aM-ZF3_hI70nr-75xaku2cNxB9tmib8yp9OdjRXI_1oADHlj_Q9wuYkUGMzXew3RQPYJY6TzC1Idlfn4w.eyJraWQiOiJ0b2tlbi1kZXYtMTIzIn0';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        AuthService,
        { provide: TokenStorageService, useClass: TokenStorageServiceMock},
        { provide: PasetoService, useClass: PasetoMockService },
        { provide: UserService, useClass: UserServiceMock }
      ]
    });

    sut = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenService = TestBed.inject(TokenStorageService);
    router = TestBed.inject(Router);
    pasetoService = TestBed.inject(PasetoService);
    userService = TestBed.inject(UserService);

    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
    jest.spyOn(global, 'clearTimeout');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('getToken', () => {
    it('should initially return null', () => {
      // When
      const result = sut.getToken;

      // Then
      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when the user is not authenticated', () => {
      // When
      const result = sut.isAuthenticated();

      // Then
      expect(result).toBeFalsy();
    });
  });

  describe('setTokens', () => {
    it('should set the _accessToken', async () => {
      // Given
      const refreshToken = 'refreshToken';

      // When
      await sut.setTokens(accessToken, refreshToken);

      // Then
      expect(sut.getToken).toBe(accessToken);
      expect(userService.updateUser).toHaveBeenCalledTimes(1)

    });

    it('should set the refreshToken in the storage', async () => {
      // Given
      const refreshToken = 'refreshToken';

      // When
      await sut.setTokens(accessToken, refreshToken);

      // Then
      expect(tokenService.saveRefreshToken).toHaveBeenCalledWith(refreshToken);
    });

    it('should start the refresh loop after 14 minutes', async () => {
      // Given
      pasetoService.decodeToken = jest.fn().mockReturnValue({payload: {}});
      const refreshToken = 'refreshToken';

      // When
      await sut.setTokens(accessToken, refreshToken);

      // Then
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 15 * 60 * 1000);
    });

    it('should refresh tokens after 15 minutes', async () => {
      jest.useFakeTimers('legacy');
      // Given
      const refreshSpy = jest.spyOn(sut, 'refreshAccessToken').mockImplementationOnce(() => {});
      pasetoService.decodeToken = jest.fn().mockReturnValue({payload: {}});
      const refreshToken = 'refreshToken';

      // When
      await sut.setTokens(accessToken, refreshToken);
      jest.advanceTimersByTime(15 * 60 * 1000);

      // Then
      expect(refreshSpy).toHaveBeenCalledTimes(1);
      jest.useRealTimers();
    });

    it('should decode the token with the PasetoService', async () => {
      const refreshToken = 'refreshToken';

      // When
      await sut.setTokens(accessToken, refreshToken);

      // Then
      expect(pasetoService.decodeToken).toHaveBeenCalledWith(accessToken);
    });

    it('should clear the timeout when called again', async () => {
      // Given
      const refreshToken = 'refreshToken';

      // When
      await sut.setTokens(accessToken, refreshToken);
      await sut.setTokens(accessToken, refreshToken);

      // Then
      expect(clearTimeout).toHaveBeenCalledTimes(1);
    });
  });

  describe('logout', () => {
    it('should post a logout request', () => {
      // When
      sut.logout();

      // Then
      const req = httpMock.expectOne(`${environment.baseUrl}/auth/revoke`);
      expect(req.request.method).toBe('POST');
      req.flush({});
    });

    it('should clear the refresh token', () => {
      // When
      sut.logout();

      // Then
      const req = httpMock.expectOne(`${environment.baseUrl}/auth/revoke`);
      req.flush({});
      expect(tokenService.clearRefreshToken).toHaveBeenCalled();
    });

    it('should clear the access token', () => {
      // Given
      const refreshToken = 'refreshToken';
      sut.setTokens(accessToken, refreshToken);
      expect(sut.getToken).toBe(accessToken);

      // When
      sut.logout();

      // Then
      const req = httpMock.expectOne(`${environment.baseUrl}/auth/revoke`);
      req.flush({});
      expect(sut.getToken).toBeNull();
    });

    it('should redirect to the login screen', () => {
      // Given
      jest.spyOn(router, 'parseUrl');

      // When
      sut.logout();

      // Then
      const req = httpMock.expectOne(`${environment.baseUrl}/auth/revoke`);
      req.flush({});
      expect(router.parseUrl).toHaveBeenCalledWith(environment.loginUrl);
    });
  });

  describe('refreshAccessToken', () => {
    it('should request a new refresh token and access token', () => {
      // Given
      const refreshToken = 'refreshToken';
      sut.setTokens(accessToken, refreshToken);

      // When
      sut.refreshAccessToken();

      // Then
      const req = httpMock.expectOne(`${environment.baseUrl}/auth/refresh_token`);
      expect(req.request.method).toBe('POST');
      req.flush({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken'
      });
    });

    it('should request update with new tokens', () => {
      // Given
      const newAccessToken = 'v2.local.kGYy2o6_e0jo4wnxHHGBrIBPAgKP8pInGLmn0A-bgLfSdBvr2LILo9AuNMfArUeqO4fPdTjxyaVlk85GVT6gIUyXXOsd_8ysI0-Z1eU66UUZuguS5m2bxMNgFOZEHKTEYH4G8JDF6m7tDnLxFrvxVX2ts7rRdH0cxxxNyQQzmxB5aJqnJiU94ll34RzxOkod0gsnWVfnP24-awvk8A.eyJraWQiOiJ0b2tlbi1kZXYtMTIzIn0';
      jest.spyOn(sut, 'setTokens');
      const refreshToken = 'refreshToken';
      sut.setTokens(accessToken, refreshToken);

      // When
      sut.refreshAccessToken();
      const req = httpMock.expectOne(`${environment.baseUrl}/auth/refresh_token`);
      req.flush({
        accessToken: newAccessToken,
        refreshToken: 'newRefreshToken'
      });

      // Then
      expect(sut.setTokens).toHaveBeenCalledWith(newAccessToken, 'newRefreshToken');
    });
  });
});
