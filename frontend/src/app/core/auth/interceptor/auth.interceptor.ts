import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import {AuthService} from "../auth.service";
import {environment} from "../../../../environments/environment";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private readonly publicEndpoints = [
    `${environment.baseUrl}/auth/login_redirect/google`,
    `${environment.baseUrl}/auth/login_redirect/facebook`
  ]

  constructor(private readonly authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let httpRequest = request;

    if (!this.publicEndpoints.includes(request.url)) {
      httpRequest = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${this.authService.getToken}`)
      });
    }

    return next.handle(httpRequest);
  }
}
