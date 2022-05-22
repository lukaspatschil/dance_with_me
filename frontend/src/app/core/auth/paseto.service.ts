import { Injectable } from '@angular/core';

export type PasetoToken = `v${1 | 2 | 3 | 4}.${'local' | 'public'}.${string}`;

export type DecodedPasetoToken = {
  footer?: string,
  payload: {
    name?: string,
    exp?: string,
    iat?: string,
    admin?: boolean,
    sub?: string,
    [key: string]: any
  },
  version: string,
  purpose: string
};

@Injectable({
  providedIn: 'root'
})
export class PasetoService {

  constructor() {}

  public decodeToken(token: PasetoToken): DecodedPasetoToken {
    const {
      0: version,
      1: purpose,
      2: payload,
      3: footer,
      length,
    } = token.split('.');

    if (length !== 3 && length !== 4) {
      throw new Error('token is not a PASETO formatted value');
    }

    if (
      version !== 'v1' &&
      version !== 'v2' &&
      version !== 'v3' &&
      version !== 'v4'
    ) {
      throw new Error('unsupported PASETO version');
    }

    if (purpose !== 'local' && purpose !== 'public') {
      throw new Error('unsupported PASETO purpose');
    }

    const result = {
      footer: footer ? PasetoService.urlSafeBase64Decode(footer) : undefined,
      payload: {},
      version,
      purpose,
    };

    if (purpose !== 'local') {
      const sigLength = version === 'v1' ? 256 : version === 'v3' ? 96 : 64;

      let raw;
      if (payload) {
        raw = PasetoService.urlSafeBase64Decode(payload).slice(0, -sigLength);
        result.payload = PasetoService.rawPayloadToJson(raw);
      }
    }

    return result;
  }

  private static urlSafeBase64Decode(url: string): string {
    return atob(url.replace(/-/g, '+').replace(/_/g, '/'));
  }

  private static rawPayloadToJson(raw: string): { [key: string]: any } {
    return JSON.parse(
      decodeURIComponent(
        raw
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      ),
    );
  }
}
