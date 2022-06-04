import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../auth.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  canActivate(): UrlTree | boolean {
    let isAuthenticated: UrlTree | boolean = this.authService.isAuthenticated();

    if (!isAuthenticated) {
      isAuthenticated = this.router.parseUrl(environment.loginUrl);
    }

    return isAuthenticated;
  }
}
