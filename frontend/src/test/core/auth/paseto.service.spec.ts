import { TestBed } from '@angular/core/testing';

import { PasetoService } from '../../../app/core/auth/paseto.service';
import {
  tokenDevelop,
  tokenV1Public,
  tokenV2,
  tokenV2NoFooter,
  tokenV2Public,
  tokenV3Public,
  tokenV5
} from "./paseto.token";

describe('PasetoService', () => {
  let sut: PasetoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PasetoService]
    });

    sut = TestBed.inject(PasetoService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('decodeToken', () => {
    it('should throw an error if the token is not in PASETO format', () => {
      // When
      // @ts-ignore - we are testing the error
      const result = () => sut.decodeToken('not-a-token');

      // Then
      expect(result).toThrowError('token is not a PASETO formatted value');
    });

    it('should throw an error when the version is not supported', () => {
      // When
      // @ts-ignore - we are testing the error
      const result = () => sut.decodeToken(tokenV5);

      // Then
      expect(result).toThrowError('unsupported PASETO version');
    });

    it('should throw an error when the purpose is not supported', () => {
      // When
      // @ts-ignore - we are testing the error
      const result = () => sut.decodeToken(tokenDevelop);

      // Then
      expect(result).toThrowError('unsupported PASETO purpose');
    });

    it('should return the local token', () => {
      // When
      const result = sut.decodeToken(tokenV2);

      // Then
      const expectedResult = {
        footer: '{"kid":"token-dev-123"}',
        version: 'v2',
        purpose: 'local',
        payload: {}
      }
      expect(result).toEqual(expectedResult);
    });

    it('should return a valid public v1 token', () => {
      // When
      const result = sut.decodeToken(tokenV2Public);

      // Then
      const expectedResult = {
        footer: '{"kid":"token-dev-123"}',
        payload: {
          admin: true,
          exp: '2022-04-21T09:18:34.660Z',
          iat: '2022-04-21T08:18:34.660Z',
          name: 'John Doe',
          sub: '1234567890'
        },
        purpose: 'public',
        version: 'v2'
      }
      expect(result).toEqual(expectedResult);
    });

    it('should return a valid public v2 token', () => {
      // When
      const result = sut.decodeToken(tokenV1Public);

      // Then
      const expectedResult = {
        footer: '{"kid":"token-dev-123"}',
        payload: {
          admin: true,
          exp: '2022-04-21T10:21:07.683Z',
          iat: '2022-04-21T09:21:07.683Z',
          name: 'John Doe',
          sub: '1234567890'
        },
        purpose: 'public',
        version: 'v1'
      }
      expect(result).toEqual(expectedResult);
    });

    it('should return no footer if it is not set', () => {
      // When
      const result = sut.decodeToken(tokenV2NoFooter);

      // Then
      const expectedResult = {
        footer: undefined,
        payload: {},
        purpose: 'local',
        version: 'v2'
      }
      expect(result).toEqual(expectedResult);
    });

    it('should return a valid public v3 token ', () => {
      // When
      const result = sut.decodeToken(tokenV3Public);

      // Then
      const expectedResult = {
        footer: undefined,
        payload: {
          admin: true,
          exp: '2022-04-21T10:21:07.683Z',
          iat: '2022-04-21T09:36:53.407Z',
          name: 'John Doe',
          sub: '1234567890'
        },
        purpose: 'public',
        version: 'v3'
      }
      expect(result).toEqual(expectedResult);
    });
  });
});
