import { DecodedPasetoToken, PasetoService } from '../../app/core/auth/paseto.service';

export class PasetoMockService implements PasetoService{
  decodeToken = jest.fn((): DecodedPasetoToken => {
    return {
      payload: {
        sub: '1234567890',
        name: 'John Doe',
        admin: true,
        iat: '2022-04-21T07:54:26.988Z',
        exp: '2022-04-21T08:54:26.988Z'
      },
      version: 'v2',
      purpose: 'authentication'
    };
  });
}
