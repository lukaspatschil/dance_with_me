import { Injectable } from '@angular/core';
const REFRESH_TOKEN_KEY = 'refreshToken';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  constructor() {}

  public saveRefreshToken(token: string) {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  public clearRefreshToken() {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}
