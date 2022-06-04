import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { PasetoToken } from './paseto.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): UrlTree | boolean {
    const fragments = this.parseFragment(route.fragment);
    const accessToken = fragments.get('access_token') as PasetoToken | undefined;
    const refreshToken = fragments.get('refresh_token');
    let loginFailure: UrlTree | boolean = true;

    if (accessToken && refreshToken) {
      this.authService.setTokens(accessToken, refreshToken);
      loginFailure = this.router.parseUrl('/');
    }

    return loginFailure;
  }

  private parseFragment(fragment: string | null): Map<string, string> {
    const result = new Map<string, string>();

    if (fragment) {
      const params = fragment.split('&');
      params.forEach(param => {
        const keyValue = param.split('=');
        if (keyValue[0] && keyValue[1]) {
          result.set(keyValue[0], keyValue[1]);
        }
      });
    }
    return result;
  }
}
