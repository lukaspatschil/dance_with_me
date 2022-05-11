import { UserEntity } from '../core/entity/user.entity';

export interface PasetoPayloadInput {
  displayName: string;
  role: UserEntity['role'];
  pictureUrl?: string;
  fingerPrintHash: string;
  [key: string]: any;
}

export interface PasetoPayload extends PasetoPayloadInput {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  kid: string;
}

export type AuthUser = Required<Pick<UserEntity, 'id' | 'role'>> &
  Pick<UserEntity, 'displayName' | 'pictureUrl'>;

export interface AuthProviderUser {
  id: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  emailVerified: boolean;
  pictureUrl?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  fingerPrint: string;
}
