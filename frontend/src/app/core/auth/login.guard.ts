import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {AuthService} from "./auth.service";
import {PasetoToken} from "./paseto.service";

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    const fragments = this.parseFragment(route.fragment);
    const accessToken = fragments.get('access_token') as PasetoToken | undefined;
    const refreshToken = fragments.get('refresh_token');
    let loginFailure: boolean | UrlTree = true;

    if (accessToken && refreshToken) {
      await this.authService.setTokens(accessToken, refreshToken);
      loginFailure = this.router.parseUrl('/');
    }

    return loginFailure;
  }

  private parseFragment(fragment: string | null): Map<string, string> {
    const result = new Map();

    if (fragment) {
      const params = fragment.split('&');
      params.forEach(param => {
        const keyValue = param.split('=');
        result.set(keyValue[0], keyValue[1]);
      });
    }
    return result;
  }
}
