import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from './token.service';
import { Router } from '@angular/router';
import { PasetoService, PasetoToken } from './paseto.service';
import { UserService } from '../../services/user.service';

const AUTH_API = `${environment.baseUrl}/auth`;
const httpOptions = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  withCredentials: true
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private _accessToken: string | null = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private refreshTimeout: any = null;

  constructor(
    private readonly http: HttpClient,
    private readonly tokenStorage: TokenStorageService,
    private readonly router: Router,
    private readonly paseto: PasetoService,
    private readonly userService: UserService
  ) {}

  private async getTimeoutTime(accessToken: PasetoToken): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    let timeout = 15 * 60 * 1000;
    const decoded = this.paseto.decodeToken(accessToken);
    let id = decoded.payload.sub;
    if (id != null) {
      await this.userService.updateUser(id);
    }
    if (decoded.payload.exp) {
      timeout = new Date(decoded.payload.exp).getTime() - new Date().getTime();
    }
    return timeout;
  }

  private set accessToken(accessToken: string | null) {
    this._accessToken = accessToken;
  }

  get getToken(): string | null {
    return this._accessToken;
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken);
  }

  async setTokens(accessToken: PasetoToken, refreshToken: string): Promise<void> {
    this.accessToken = accessToken;
    this.tokenStorage.saveRefreshToken(refreshToken);

    if (this.refreshTimeout) {
      const timeoutId = this.refreshTimeout;
      clearTimeout(timeoutId);
      this.refreshTimeout = null;
    }

    const timeoutTime = await this.getTimeoutTime(accessToken);
    this.refreshTimeout = setTimeout((): void => void this.refreshAccessToken(), timeoutTime);
  }

  logout(): void {
    const refreshToken = this.tokenStorage.getRefreshToken();
    this.http.post(`${AUTH_API}/revoke`, { refreshToken }, httpOptions).subscribe(() => {
      this.tokenStorage.clearRefreshToken();
      this.accessToken = null;

      this.userService.resetUser();
      this.router.parseUrl(environment.loginUrl);
    });
  }

  refreshAccessToken(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const refreshToken = this.tokenStorage.getRefreshToken();
      if (refreshToken) {
        this.http.post(`${AUTH_API}/refresh_token`, { refreshToken }, httpOptions)
          .subscribe({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            next: async (response: any) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-confusing-void-expression
              await this.setTokens(response.accessToken, response.refreshToken);
              resolve();
            },
            error: err => {
              reject(err);
            }
          });
      } else {
        resolve();
      }
    });
  }
}
