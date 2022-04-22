export class AuthServiceMock {
  isAuthenticated = jest.fn().mockReturnValue(true);

  setTokens = jest.fn();

  getToken = 'token';
}
