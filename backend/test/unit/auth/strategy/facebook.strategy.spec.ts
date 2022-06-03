import { Test, TestingModule } from '@nestjs/testing';
import { RoleEnum } from '../../../../src/core/schema/enum/role.enum';
import { AuthService } from '../../../../src/auth/auth.service';
import { FacebookStrategy } from '../../../../src/auth/strategy/facebook.strategy';
import { UserEntity } from '../../../../src/core/entity/user.entity';
import { ConfigService } from '@nestjs/config';
import { Strategy, Profile } from 'passport-facebook';

jest.mock('passport-facebook');

describe('FacebookStrategy', function () {
  const facebookProfile: Profile = {
    id: '1234567890',
    displayName: 'John Doe',
    name: {
      familyName: 'Doe',
      givenName: 'John',
    },
    birthday: '10/10/2010',
    emails: [
      {
        value: 'john.doe@example.com',
      },
    ],
    photos: [
      {
        value: 'https://example.com/profile.jpg',
      },
    ],
    provider: 'facebook',
    _raw: '{}',
    _json: {
      id: '0123456789',
      name: 'John Doe',
      picture: {
        data: {
          height: 50,
          is_silhouette: false,
          url: 'https://example.com/profile.jpg',
          width: 50,
        },
      },
      email: 'john.doe@example.com',
      first_name: 'John',
      last_name: 'Doe',
    },
  };

  const user: UserEntity = {
    id: 'facebook:1234567890',
    displayName: 'John Doe',
    email: 'john.doe@example.com',
    emailVerified: true,
    role: RoleEnum.USER,
  };

  let strategy: FacebookStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacebookStrategy,
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
                FACEBOOK_CLIENT_ID: 'mock-client-id',
                FACEBOOK_CLIENT_SECRET: 'mock-client-secret',
              }[key];
            }),
          },
        },
      ],
    }).compile();

    strategy = module.get<FacebookStrategy>(FacebookStrategy);
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
        authType: 'rerequest',
        state: 'mock-state',
      }),
    );
  });

  it('should call callback with error if email is missing', async () => {
    // Given
    const callback = jest.fn();
    const { emails: _, ...profile } = facebookProfile;

    // When
    await strategy.validate(
      'mock-access-token',
      'mock-refresh-token',
      profile,
      callback,
    );

    // Then
    expect(callback).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should call callback with error if the user could not be validated', async () => {
    // Given
    const callback = jest.fn();

    // When
    await strategy.validate(
      'mock-access-token',
      'mock-refresh-token',
      { ...facebookProfile, id: 'cause-error' },
      callback,
    );

    // Then
    expect(callback).toHaveBeenCalledWith(expect.any(Error), false);
  });

  it('should correctly transform minimal user profile without name property or photos', async () => {
    // Given
    const callback = jest.fn();
    const { name: _, photos: _2, ...profile } = facebookProfile;

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
      facebookProfile,
      callback,
    );

    // Then
    expect(callback).toHaveBeenCalledWith(null, user);
  });
});
