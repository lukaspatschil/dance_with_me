import { Injectable } from '@angular/core';

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
export type PasetoToken = `v${1 | 2 | 3 | 4}.${'local' | 'public'}.${string}`;

export interface DecodedPasetoToken {
  footer?: string;
  payload: {
    name?: string;
    exp?: string;
    iat?: string;
    admin?: boolean;
    sub?: string;
    [key: string]: unknown;
  };
  version: string;
  purpose: string;
}

@Injectable({
  providedIn: 'root'
})
export class PasetoService {
  public decodeToken(token: PasetoToken): DecodedPasetoToken {
    const {
      0: version,
      1: purpose,
      2: payload,
      3: footer,
      length
    } = token.split('.');

    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
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
      purpose
    };

    if (purpose !== 'local') {
      const sigLength = { v1: 256, v2: 64, v3: 96, v4: 64 }[version];

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

  private static rawPayloadToJson(raw: string): { [key: string]: unknown } {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(
      decodeURIComponent(
        raw
          .split('')
          // eslint-disable-next-line @typescript-eslint/no-magic-numbers
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
    );
  }
}
