import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class RefreshGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(): Promise<boolean> {
    if (!this.authService.isAuthenticated()) {
      await this.authService.refreshAccessToken().catch(() => console.error);
    }

    return true;
  }
}
