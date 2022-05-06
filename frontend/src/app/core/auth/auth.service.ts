import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from '../../../environments/environment';
import {TokenStorageService} from "./token.service";
import { Router } from '@angular/router';
import {PasetoService, PasetoToken} from "./paseto.service";

const AUTH_API = `${environment.baseUrl}/auth`;
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _accessToken: string | null = null;
  private refreshTimeout: any = null;

  constructor(
    private readonly http: HttpClient,
    private readonly tokenStorage: TokenStorageService,
    private readonly router: Router,
    private readonly paseto: PasetoService
  ) {}

  private async getTimeoutTime(accessToken: PasetoToken): Promise<number> {
    let timeout = 14 * 60 * 1000;
    const decoded = await this.paseto.decodeToken(accessToken);
    if (decoded.payload['exp']) {
      timeout = new Date(decoded.payload['exp']).getTime() - new Date().getTime() - 60 * 1000;
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

  async setTokens(accessToken: PasetoToken, refreshToken: string) {
    this.accessToken = accessToken;
    this.tokenStorage.saveRefreshToken(refreshToken);

    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }

    const timeoutTime = await this.getTimeoutTime(accessToken);
    this.refreshTimeout = setTimeout(this.refreshAccessToken, timeoutTime);
  }

  logout() {
    this.http.post(`${AUTH_API}/revoke`, {}, httpOptions).subscribe(() => {
      this.tokenStorage.clearRefreshToken();
      this.accessToken = null;

      if (this.refreshTimeout) {
        clearTimeout(this.refreshTimeout);
        this.refreshTimeout = null;
      }

      this.router.parseUrl(environment.loginUrl);
    });
  }

  refreshAccessToken() {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (refreshToken) {
      this.http.post(`${AUTH_API}/refresh_token`, { refreshToken }, httpOptions)
        .subscribe(async (response: any) => {
          await this.setTokens(response.accessToken, response.refreshToken);
        });
    }
  }
}
