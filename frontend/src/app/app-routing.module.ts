import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AboutPageComponent } from './components/about-page/about-page.component';
import { LegalPageComponent } from './components/legal-page/legal-page.component';
import { PrivacyPageComponent } from './components/privacy-page/privacy-page.component';
import {environment} from "../environments/environment";
import {LoginComponent} from "./core/auth/login/login.component";
import {LoginGuard} from "./core/auth/login.guard";
import {AuthGuard} from "./core/auth/auth.guard";
import {LandingComponent} from "./components/landing/landing.component";
import {EventOverviewComponent} from "./components/events/event-overview/event-overview.component";
import {CreateEventPageComponent} from "./components/events/create-event-page/create-event-page.component";

const routes: Routes = [
  {path: '', component: LandingComponent},
  {path: '', canActivate: [AuthGuard], children: []},
  {path: 'about', component: AboutPageComponent},
  {path: 'legal', component: LegalPageComponent},
  {path: 'privacy', component: PrivacyPageComponent},
  {path: 'create', component: CreateEventPageComponent},
  {path: 'events', component: EventOverviewComponent},
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
