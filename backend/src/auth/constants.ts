/* eslint @typescript-eslint/no-magic-numbers: 0 */
export const useSecureCookie = process.env['NODE_ENV'] !== 'development';
/* istanbul ignore next */
export const fingerPrintCookieName: string = useSecureCookie
  ? '__Secure-fingerprint'
  : 'fingerprint';
/* istanbul ignore next */
export const fingerPrintCookieSameSite = useSecureCookie ? 'strict' : 'none';
export const fingerPrintCookieMaxAge = 1000 * 60 * 60 * 24 * 30 * 6; // 6 months

export const pasetoKeyRotationInterval = 1000 * 60 * 60 * 24 * 7; // 1 week
