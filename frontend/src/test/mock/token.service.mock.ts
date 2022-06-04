import { TokenStorageService } from '../../app/core/auth/token.service';
const REFRESH_TOKEN_KEY = 'refreshToken';

export class TokenStorageServiceMock implements TokenStorageService{
  storage = new Map<string, string>();

  saveRefreshToken = jest.fn((token: string) => {
    this.storage.delete(REFRESH_TOKEN_KEY);
    this.storage.set(REFRESH_TOKEN_KEY, token);
  });

  getRefreshToken = jest.fn(() => {
    return this.storage.get(REFRESH_TOKEN_KEY) ?? null;
  });

  clearRefreshToken = jest.fn(() => {
    this.storage.delete(REFRESH_TOKEN_KEY);
  });
}
