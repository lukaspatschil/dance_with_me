import { Component, Inject } from '@angular/core';
import {environment} from "../../../../environments/environment";
import { DOCUMENT } from '@angular/common';

const AUTH_API = `${environment.baseUrl}/auth`;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  public loginGoogle() {
    document.location.href = `${AUTH_API}/login_redirect/google`;
  }

  public loginFacebook() {
    document.location.href = `${AUTH_API}/login_redirect/facebook`;
  }
}
