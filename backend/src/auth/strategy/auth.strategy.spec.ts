import { AccessTokenStrategy } from './auth.strategy';
import { Test, TestingModule } from '@nestjs/testing';
import { PasetoService } from '../paseto.service';
import { AuthUser, PasetoPayload } from '../interfaces';
import { RoleEnum } from '../../core/schema/enum/role.enum';
import { AuthService } from '../auth.service';
import { fingerPrintCookieName } from '../constants';

describe('AccessTokenStrategy', function () {
  const validToken = 'validMockToken';
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { fingerPrint, hash } = AuthService.generateFingerPrint();
  const validRequest: any = {
    headers: {
      authorization: `Bearer ${validToken}`,
    },
    cookies: {
      [fingerPrintCookieName]: fingerPrint,
    },
  };

  const payload: PasetoPayload = {
    sub: '1234567890',
    aud: 'mockAudience',
    displayName: 'John Doe',
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    exp: Date.now() + 10000,
    fingerPrintHash: hash,
    iat: 0,
    iss: 'mockIssuer',
    kid: '1',
    role: RoleEnum.USER,
  };

  const user: AuthUser = {
    id: payload.sub,
    displayName: payload.displayName,
    role: payload.role,
  };

  let strategy: AccessTokenStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessTokenStrategy,
        {
          provide: PasetoService,
          useValue: {
            verifyToken: jest.fn((token) =>
              token === validToken
                ? Promise.resolve(payload)
                : Promise.reject(new Error('invalid token')),
            ),
          },
        },
      ],
    }).compile();

    strategy = module.get<AccessTokenStrategy>(AccessTokenStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should throw error if authorization header is not provided', async () => {
    // Given
    const request = { ...validRequest, headers: {} };

    // When
    const promise = strategy.validate(request);

    // Then
    await expect(promise).rejects.toThrowError();
  });

  it('should throw error if fingerprint is not provided', async () => {
    // Given
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { cookies: _, ...request } = validRequest;

    // When
    const promise = strategy.validate(request);

    // Then
    await expect(promise).rejects.toThrowError();
  });

  it('should throw error if authorization header is not bearer', async () => {
    // Given
    const request = {
      ...validRequest,
      headers: { authorization: validToken },
    };

    // When
    const promise = strategy.validate(request);

    // Then
    await expect(promise).rejects.toThrowError();
  });

  it('should throw error if access token cannot be verified', async () => {
    // Given
    const request = {
      ...validRequest,
      headers: { authorization: 'Bearer invalidMockToken' },
    };

    // When
    const promise = strategy.validate(request);

    // Then
    await expect(promise).rejects.toThrowError();
  });

  it('should throw error if fingerprint does not match hash', async () => {
    // Given
    const request = {
      ...validRequest,
      cookies: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        [fingerPrintCookieName]: AuthService.generateFingerPrint().fingerPrint,
      },
    };

    // When
    const promise = strategy.validate(request);

    // Then
    await expect(promise).rejects.toThrowError();
  });

  it('should return correct authUser if access token is valid and fingerprint matches', async () => {
    // When
    const promise = strategy.validate(validRequest);

    // Then
    await expect(promise).resolves.toEqual(user);
  });
});
