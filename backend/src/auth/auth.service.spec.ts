import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { PasetoService } from './paseto.service';
import { RefreshTokenDocument } from '../core/schema/refreshtoken.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserEntity } from '../core/entity/user.entity';
import { RoleEnum } from '../core/schema/enum/role.enum';
import { createHash } from 'crypto';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let refreshTokenModel: Model<RefreshTokenDocument>;

  const tokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    fingerPrint: 'mock-fingerprint',
  };

  const user: UserEntity = {
    id: 'google:1',
    role: RoleEnum.USER,
    displayName: 'Martha Mock',
    firstName: 'Martha',
    lastName: 'Mock',
    email: 'mock@example.com',
    emailVerified: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findAndUpdateOrCreate: jest.fn(),
          },
        },
        {
          provide: PasetoService,
          useValue: {
            createToken: jest.fn(() => tokens.accessToken),
          },
        },
        {
          provide: getModelToken(RefreshTokenDocument.name),
          useValue: {
            create: jest.fn(),
            deleteMany: jest.fn(),
            findByIdAndDelete: jest.fn((id) => {
              if (id === tokens.refreshToken) {
                const doc = {
                  _id: id,
                  user: {
                    _id: user.id,
                    ...user,
                  },
                  fingerprint: tokens.fingerPrint,
                };
                return {
                  ...doc,
                  user: doc.user._id,
                  populate: jest.fn(() => Promise.resolve(doc)),
                };
              }
              return {
                populate: jest.fn(() => Promise.resolve(null)),
              };
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    refreshTokenModel = module.get<Model<RefreshTokenDocument>>(
      getModelToken(RefreshTokenDocument.name),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkFingerPrint', () => {
    it('should return false if the fingerPrintHash is falsy', async () => {
      // When
      const result = AuthService.checkFingerPrint(
        tokens.fingerPrint,
        undefined as unknown as string,
      );

      // Then
      expect(result).toBeFalsy();
    });

    it('should return false if the fingerPrintHash does not match', async () => {
      //Given
      const hash = createHash('sha256')
        .update(tokens.fingerPrint)
        .digest('base64url');

      // When
      const result = AuthService.checkFingerPrint(
        tokens.fingerPrint,
        hash + '=',
      );

      // Then
      expect(result).toBeFalsy();
    });

    it('should return true if the fingerPrintHash matches', async () => {
      //Given
      const hash = createHash('sha256')
        .update(tokens.fingerPrint)
        .digest('base64url');

      // When
      const result = AuthService.checkFingerPrint(tokens.fingerPrint, hash);

      // Then
      expect(result).toBeTruthy();
    });
  });

  describe('authenticateUser', () => {
    it('should save new refresh token', async () => {
      // When
      await service.authenticateUser(user);

      // Then
      expect(refreshTokenModel.create).toHaveBeenCalled();
    });

    it('should save fingerprint and user with new refresh token', async () => {
      // Given
      const { refreshToken, fingerPrint } = await service.authenticateUser(
        user,
      );

      // When
      await service.authenticateUser(user);

      // Then
      expect(refreshTokenModel.create).toHaveBeenCalledWith({
        _id: refreshToken,
        fingerprint: fingerPrint,
        user: user.id,
      });
    });

    it('should use pasetoService to create token', async () => {
      jest.spyOn(service['pasetoService'], 'createToken');

      // When
      await service.authenticateUser(user);

      // Then
      expect(service['pasetoService'].createToken).toHaveBeenCalled();
    });

    it('should return tokens and fingerprint', async () => {
      // When
      const returnedTokens = await service.authenticateUser(user);

      // Then
      expect(returnedTokens).toEqual({
        accessToken: tokens.accessToken,
        refreshToken: expect.any(String),
        fingerPrint: expect.any(String),
      });
    });

    it('should create unique fingerprints on consecutive calls', async () => {
      // When
      const { fingerPrint: first } = await service.authenticateUser(user);
      const { fingerPrint: second } = await service.authenticateUser(user);

      // Then
      expect(first).not.toEqual(second);
    });

    it('should create unique refresh tokens on consecutive calls', async () => {
      // When
      const { refreshToken: first } = await service.authenticateUser(user);
      const { refreshToken: second } = await service.authenticateUser(user);

      // Then
      expect(first).not.toEqual(second);
    });

    it('should pass fingerprint hash when creating access token', async () => {
      jest.spyOn(service['pasetoService'], 'createToken');

      // When
      const { fingerPrint } = await service.authenticateUser(user);

      // Then
      const hash = createHash('sha256').update(fingerPrint).digest('base64url');
      expect(service['pasetoService'].createToken).toHaveBeenCalledWith(
        expect.objectContaining({ fingerPrintHash: hash }),
      );
    });

    it('should pass appropriate claims for access token', async () => {
      jest.spyOn(service['pasetoService'], 'createToken');

      // When
      await service.authenticateUser({
        ...user,
        pictureUrl: 'https://example.com/mock.jpg',
      });

      // Then
      expect(service['pasetoService'].createToken).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: user.id,
          role: user.role,
          displayName: user.displayName,
          pictureUrl: 'https://example.com/mock.jpg',
        }),
      );
    });
  });

  describe('forceLogout', () => {
    it('should delete all refresh tokens for user', async () => {
      // When
      await service.forceLogout(user);

      // Then
      expect(refreshTokenModel.deleteMany).toHaveBeenCalledWith({
        user: user.id,
      });
    });
  });

  describe('validateProviderUser', () => {
    it('should find and update or create user if necessary using user service', async () => {
      // When
      await service.validateProviderUser(user);

      // Then
      expect(userService.findAndUpdateOrCreate).toHaveBeenCalledWith(user);
    });
  });

  describe('checkAndDeleteRefreshToken', () => {
    it('should fetch and delete refresh token from DB', async () => {
      // When
      await service.checkAndDeleteRefreshToken(
        tokens.refreshToken,
        tokens.fingerPrint,
      );

      // Then
      expect(refreshTokenModel.findByIdAndDelete).toHaveBeenCalledWith(
        tokens.refreshToken,
      );
    });

    it('fetches refresh token from DB', async () => {
      // When
      await service.checkAndDeleteRefreshToken(
        tokens.refreshToken,
        tokens.fingerPrint,
      );

      // Then
      expect(refreshTokenModel.findByIdAndDelete).toHaveBeenCalledWith(
        tokens.refreshToken,
      );
    });

    it('should return null if refresh token is not found', async () => {
      // When
      const userResult = await service.checkAndDeleteRefreshToken(
        '??',
        tokens.fingerPrint,
      );

      // Then
      expect(userResult).toBeNull();
    });

    it('should return null if fingerprint does not match refresh token', async () => {
      // When
      const userResult = await service.checkAndDeleteRefreshToken(
        tokens.refreshToken,
        '??',
      );

      // Then
      expect(userResult).toBeNull();
    });

    it('should return user if refresh token exists and fingerprint matches', async () => {
      // When
      const userResult = await service.checkAndDeleteRefreshToken(
        tokens.refreshToken,
        tokens.fingerPrint,
      );

      // Then
      expect(userResult).toEqual(expect.objectContaining(user));
    });
  });
});
