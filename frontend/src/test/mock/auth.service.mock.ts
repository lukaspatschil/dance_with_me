export class AuthServiceMock {
  isAuthenticated = jest.fn().mockReturnValue(true);

  setTokens = jest.fn();

  getToken = 'token';

  refreshAccessToken = jest.fn(() => Promise.resolve());

  logout = jest.fn();
}
