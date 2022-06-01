import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from "./auth.service";
import { AuthGuard } from "./guards/auth.guard";
import { TokenStorageService } from "./token.service";
import { LoginGuard } from "./login.guard";
import { LoginComponent } from './login/login.component';
import { HttpClientModule } from "@angular/common/http";
import { GoogleComponent } from './login/google/google.component';
import { FacebookComponent } from './login/facebook/facebook.component';
import {httpInterceptorProviders} from "./interceptor";
import { PasetoService } from "./paseto.service";
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    TranslateModule
  ],
  providers: [AuthService, AuthGuard, TokenStorageService, LoginGuard, httpInterceptorProviders, PasetoService],
  declarations: [
    LoginComponent,
    GoogleComponent,
    FacebookComponent
  ],
  exports: [ LoginComponent ]
})
export class AuthModule { }
