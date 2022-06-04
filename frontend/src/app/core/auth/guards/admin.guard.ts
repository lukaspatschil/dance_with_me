import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { UserService } from '../../../services/user.service';
import { RoleEnum } from '../../../enums/role.enum';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private readonly userService: UserService, private readonly router: Router) {}

  canActivate(): UrlTree | boolean {
    let isAuthenticated: UrlTree | boolean = this.userService.role === RoleEnum.ADMIN;

    if (!isAuthenticated) {
      isAuthenticated = this.router.parseUrl(environment.loginUrl);
    }

    return isAuthenticated;
  }
}
