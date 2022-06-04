import { TestBed } from '@angular/core/testing';
import { TokenStorageService } from '../../../app/core/auth/token.service';

const REFRESH_TOKEN_KEY = 'refreshToken';

describe('TokenStorageService', () => {
  let sut: TokenStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TokenStorageService]
    });

    sut = TestBed.inject(TokenStorageService);

    setUpLocalStorageMock();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('saveRefreshToken', () => {
    it('should delete the old token', () => {
      // When
      sut.saveRefreshToken('token');

      // Then
      expect(localStorage.removeItem).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);
    });

    it('should set the new token', () => {
      // Given
      const token = 'token';

      // When
      sut.saveRefreshToken(token);

      // Then
      expect(localStorage.setItem).toHaveBeenCalledWith(REFRESH_TOKEN_KEY, token);
    });
  });

  describe('getRefreshToken', () => {
    it('should the item with the refresh token', () => {
      // When
      const result = sut.getRefreshToken();

      // Then
      expect(result).toEqual('token');
    });
  });

  describe('clearRefreshToken', () => {
    it('should remove the refresh token', () => {
      // When
      sut.clearRefreshToken();

      // Then
      expect(localStorage.removeItem).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);
    });
  });

  function setUpLocalStorageMock(): void {
    jest.spyOn(window.localStorage['__proto__'], 'removeItem');
    jest.spyOn(window.localStorage['__proto__'], 'setItem');
    jest.spyOn(window.localStorage['__proto__'], 'getItem');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    window.localStorage['__proto__'].getItem = jest.fn().mockReturnValue('token');
  }
});
