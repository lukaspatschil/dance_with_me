import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AboutPageComponent } from './standardPages/about-page/about-page.component';
import { LegalPageComponent } from './standardPages/legal-page/legal-page.component';
import { PrivacyPageComponent } from './standardPages/privacy-page/privacy-page.component';
import {environment} from "../environments/environment";
import {LoginComponent} from "./core/auth/login/login.component";
import {LoginGuard} from "./core/auth/login.guard";
import {AuthGuard} from "./core/auth/auth.guard";
import {LandingComponent} from "./standardPages/landing/landing.component";

const routes: Routes = [
  {path: '', component: LandingComponent},
  {path: '', canActivate: [AuthGuard], children: []},
  {path: 'about', component: AboutPageComponent},
  {path: 'legal', component: LegalPageComponent},
  {path: 'privacy', component: PrivacyPageComponent},
  {path: 'loginSite', component: LoginComponent},
  {path: environment.loginCallback, component: LandingComponent, canActivate: [LoginGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabledBlocking'
})],
  exports: [RouterModule]
})
export class AppRoutingModule {}
