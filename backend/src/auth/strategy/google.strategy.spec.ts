import { Test, TestingModule } from '@nestjs/testing';
import { RoleEnum } from '../../core/schema/enum/role.enum';
import { AuthService } from '../auth.service';
import { GoogleStrategy } from './google.strategy';
import { UserEntity } from '../../core/entity/user.entity';
import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-google-oauth20';

jest.mock('passport-google-oauth20');

describe('GoogleStrategy', function () {
  const googleProfile: any = {
    id: '1234567890',
    displayName: 'John Doe',
    name: {
      familyName: 'Doe',
      givenName: 'John',
    },
    emails: [
      {
        value: 'john.doe@example.com',
        verified: true,
      },
    ],
    photos: [
      {
        value: 'https://example.com/photo.jpg',
      },
    ],
    provider: 'google',
    _raw: '{}',
    _json: {
      sub: '1234567890',
      name: 'John Doe',
      given_name: 'John',
      family_name: 'Doe',
      picture: 'https://example.com/photo.jpg',
      email: 'john.doe@example.com',
      email_verified: true,
      locale: 'en-GB',
    },
  };

  const user: UserEntity = {
    id: 'google:1234567890',
    displayName: 'John Doe',
    email: 'john.doe@example.com',
    emailVerified: true,
    role: RoleEnum.USER,
  };

  let strategy: GoogleStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        {
          provide: AuthService,
          useValue: {
            validateProviderUser: jest.fn((providerUser) =>
              providerUser.id === user.id
                ? Promise.resolve(user)
                : Promise.reject(new Error('Test Error')),
            ),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              return {
                GOOGLE_CLIENT_ID: 'mock-client-id',
                GOOGLE_CLIENT_SECRET: 'mock-client-secret',
              }[key];
            }),
          },
        },
      ],
    }).compile();

    strategy = module.get<GoogleStrategy>(GoogleStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should call authenticate with correct options', () => {
    // Given
    jest
      .spyOn(Strategy.prototype, 'authenticate')
      .mockImplementation(jest.fn());
    const mockState = 'mock-state';
    const req: any = {
      query: {
        state: mockState,
      },
    };

    // When
    strategy.authenticate(req, {});

    // Then
    expect(Strategy.prototype.authenticate).toHaveBeenCalledWith(
      req,
      expect.objectContaining({
        state: 'mock-state',
      }),
    );
  });

  it('should call callback with error if the user could not be validated', async () => {
    // Given
    const callback = jest.fn();

    // When
    await strategy.validate(
      'mock-access-token',
      'mock-refresh-token',
      { ...googleProfile, id: 'cause-error' },
      callback,
    );

    // Then
    expect(callback).toHaveBeenCalledWith(expect.any(Error), false);
  });

  it('should correctly transform minimal user profile without name property or photos', async () => {
    // Given
    const callback = jest.fn();
    const { name: _, photos: _2, ...profile } = googleProfile;

    // When
    await strategy.validate(
      'mock-access-token',
      'mock-refresh-token',
      profile,
      callback,
    );

    // Then
    expect(callback).toHaveBeenCalledWith(null, user);
  });

  it('should correctly transform provided user profile', async () => {
    // Given
    const callback = jest.fn();

    // When
    await strategy.validate(
      'mock-access-token',
      'mock-refresh-token',
      googleProfile,
      callback,
    );

    // Then
    expect(callback).toHaveBeenCalledWith(null, user);
  });
});
