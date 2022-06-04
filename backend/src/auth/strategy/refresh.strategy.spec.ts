import { RefreshTokenStrategy } from './refresh.strategy';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { fingerPrintCookieName } from '../constants';
import { UserEntity } from '../../core/entity/user.entity';
import { RoleEnum } from '../../core/schema/enum/role.enum';

describe('RefreshTokenStrategy', function () {
  const validRefreshToken = 'validMockRefreshToken';
  const validFingerPrint = 'validMockFingerPrint';
  const validRequest: any = {
    body: {
      refreshToken: validRefreshToken,
    },
    cookies: {
      [fingerPrintCookieName]: validFingerPrint,
    },
  };

  const user: UserEntity = {
    id: '1234567890',
    displayName: 'John Doe',
    email: 'john.doe@example.com',
    emailVerified: true,
    role: RoleEnum.USER,
  };

  let strategy: RefreshTokenStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenStrategy,
        {
          provide: AuthService,
          useValue: {
            checkAndDeleteRefreshToken: jest.fn((token, fingerprint) =>
              Promise.resolve(
                token === validRefreshToken && fingerprint === validFingerPrint
                  ? user
                  : null,
              ),
            ),
          },
        },
      ],
    }).compile();

    strategy = module.get<RefreshTokenStrategy>(RefreshTokenStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should throw error if refresh token is not provided', async () => {
    // Given
    const request = { ...validRequest, body: {} };

    // When
    const promise = strategy.validate(request);

    // Then
    await expect(promise).rejects.toThrowError();
  });

  it('should throw error if fingerprint is not provided', async () => {
    // Given
    const request = { ...validRequest, cookies: {} };

    // When
    const promise = strategy.validate(request);

    // Then
    await expect(promise).rejects.toThrowError();
  });

  it('should throw error if refresh token and fingerprint pair does not exist', async () => {
    // Given
    const request = {
      ...validRequest,
      body: { refreshToken: 'invalidMockRefreshToken' },
    };

    // When
    const promise = strategy.validate(request);

    // Then
    await expect(promise).rejects.toThrowError();
  });

  it('should return correct userEntity if refresh token and fingerprint pair exists', async () => {
    // When
    const promise = strategy.validate(validRequest);

    // Then
    await expect(promise).resolves.toEqual(user);
  });
});
