import { AuthController } from './auth.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { UserEntity } from '../core/entity/user.entity';
import { Logger } from '@nestjs/common';
import { RoleEnum } from '../core/schema/enum/role.enum';
import { fingerPrintCookieName } from './constants';

describe('AuthController', () => {
  let sut: AuthController;
  let authService: AuthService;

  const mockResponse = jest.fn((): any => {
    return {
      status: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn(),
      redirect: jest.fn(),
    };
  });

  const tokens = {
    accessToken: expect.any(String),
    refreshToken: expect.any(String),
    expiresAt: expect.any(Number),
  };

  const user: UserEntity = {
    id: 'google:1',
    role: RoleEnum.USER,
    displayName: 'Martha Mock',
    firstName: 'Martha',
    lastName: 'Mock',
    email: 'mock@example.com',
    emailVerified: true,
    pictureUrl: 'https://example.com/mock.jpg',
  };

  const mockRequestWithUser = { user } as Request & { user: UserEntity };

  const mockState = 'mock-state';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            authenticateUser: jest.fn(() => Promise.resolve(tokens)),
            forceLogout: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              return {
                API_BASE: 'mock-api-base',
                FRONTEND_LOGIN_CALLBACK: '/mock-login-callback',
              }[key];
            }),
          },
        },
      ],
      controllers: [AuthController],
    }).compile();

    sut = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('providerRedirect', () => {
    it('should return correct url', () => {
      jest.spyOn(Logger.prototype, 'log');
      sut.providerRedirect('google');
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        expect.stringContaining('google'),
      );
    });
  });

  describe('providerCallback', () => {
    it('should authenticate user through authService', async () => {
      // Given
      const mockRes = mockResponse();

      // When
      await sut.providerCallback(
        'google',
        mockState,
        mockRequestWithUser,
        mockRes,
      );

      // Then
      expect(authService.authenticateUser).toHaveBeenCalledWith(
        mockRequestWithUser.user,
      );
    });

    it('should set cookie', async () => {
      // Given
      const mockRes = mockResponse();

      // When
      await sut.providerCallback(
        'google',
        mockState,
        mockRequestWithUser,
        mockRes,
      );

      // Then
      expect(mockRes.cookie).toHaveBeenCalledTimes(1);
    });

    it('should redirect to url containing state', async () => {
      // Given
      const mockRes = mockResponse();

      // When
      await sut.providerCallback(
        'google',
        mockState,
        mockRequestWithUser,
        mockRes,
      );

      // Then
      expect(mockRes.redirect).toHaveBeenCalledWith(
        expect.stringContaining(`state=${mockState}`),
      );
    });
  });

  describe('refreshToken', () => {
    it('should set cookie', async () => {
      // Given
      const mockRes = mockResponse();

      // When
      await sut.refreshToken(mockRequestWithUser, mockRes);
      expect(authService.authenticateUser).toHaveBeenCalledWith(
        mockRequestWithUser.user,
      );

      // Then
      expect(mockRes.cookie).toHaveBeenCalledTimes(1);
    });
    it('should return tokens', async () => {
      // Given
      const mockRes = mockResponse();

      // When
      await sut.refreshToken(mockRequestWithUser, mockRes);
      expect(authService.authenticateUser).toHaveBeenCalledWith(
        mockRequestWithUser.user,
      );

      // Then
      expect(mockRes.json).toHaveBeenCalledWith(tokens);
    });
    it('should send response', async () => {
      // Given
      const mockRes = mockResponse();

      // When
      await sut.refreshToken(mockRequestWithUser, mockRes);
      expect(authService.authenticateUser).toHaveBeenCalledWith(
        mockRequestWithUser.user,
      );

      // Then
      expect(mockRes.send).toHaveBeenCalledTimes(1);
    });
  });

  describe('logout', () => {
    it('should clear cookie', async () => {
      // Given
      const mockRes = mockResponse();

      // When
      await sut.logout(mockRequestWithUser, mockRes);

      // Then
      expect(mockRes.clearCookie).toHaveBeenCalledWith(fingerPrintCookieName);
    });

    it('should send response', async () => {
      // Given
      const mockRes = mockResponse();

      // When
      await sut.logout(mockRequestWithUser, mockRes);

      // Then
      expect(mockRes.send).toHaveBeenCalledTimes(1);
    });
  });

  describe('forceLogout', () => {
    it('should force logout using authService', async () => {
      // Given
      const mockRes = mockResponse();

      // When
      await sut.forceLogout(user, mockRes);

      // Then
      expect(authService.forceLogout).toHaveBeenCalledWith(user);
    });

    it('should clear cookie', async () => {
      // Given
      const mockRes = mockResponse();

      // When
      await sut.forceLogout(user, mockRes);

      // Then
      expect(mockRes.clearCookie).toHaveBeenCalledWith(fingerPrintCookieName);
    });

    it('should send response', async () => {
      // Given
      const mockRes = mockResponse();

      // When
      await sut.forceLogout(user, mockRes);

      // Then
      expect(mockRes.send).toHaveBeenCalledTimes(1);
    });
  });
});
