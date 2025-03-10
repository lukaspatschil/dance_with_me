import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AboutPageComponent } from './components/about-page/about-page.component';
import { LegalPageComponent } from './components/legal-page/legal-page.component';
import { PrivacyPageComponent } from './components/privacy-page/privacy-page.component';
import { environment } from '../environments/environment';
import { LoginComponent } from './core/auth/login/login.component';
import { LoginGuard } from './core/auth/login.guard';
import { AuthGuard } from './core/auth/guards/auth.guard';
import { LandingComponent } from './components/landing/landing.component';
import { EventOverviewComponent } from './components/events/event-overview/event-overview.component';
import { CreateEventPageComponent } from './components/events/create-event-page/create-event-page.component';
import { EditEventPageComponent } from './components/events/event-edit/edit-event-page.component';
import { EventOverviewMapComponent } from './components/events/event-overview-map/event-overview-map.component';
import { EventDetailComponent } from './components/events/event-detail/event-detail.component';
import { UserDetailComponent } from './components/user/user-detail/user-detail.component';
import { OrganiserGuard } from './core/auth/guards/organiser.guard';
import { RefreshGuard } from './core/auth/guards/refresh.guard';
import { PaymentComponent } from './components/payment/payment.component';
import { AdminComponent } from './components/admin/admin.component';
import { AdminGuard } from './core/auth/guards/admin.guard';
import { EventSearchComponent } from './components/events/event-search/event-search.component';

const routes: Routes = [
  { path: '', canActivate: [RefreshGuard], children: [
    { path: '', component: LandingComponent, canActivate: [LoginGuard] },
    { path: '', canActivate: [AuthGuard], children: [
      { path: 'create', canActivate: [OrganiserGuard], component: CreateEventPageComponent },
      { path: 'events', component: EventOverviewComponent },
      { path: 'event/:id', component: EventDetailComponent },
      { path: 'event/edit/:id', component: EditEventPageComponent },
      { path: 'map', component: EventOverviewMapComponent },
      { path: 'search', component: EventSearchComponent },
      { path: 'user', component: UserDetailComponent },
      { path: 'payment/:id', component: PaymentComponent },
      { path: 'admin', canActivate: [AdminGuard], component: AdminComponent }
    ] },
    { path: 'about', component: AboutPageComponent },
    { path: 'legal', component: LegalPageComponent },
    { path: 'privacy', component: PrivacyPageComponent },
    { path: 'loginSite', component: LoginComponent },
    { path: environment.loginCallback, component: LandingComponent, canActivate: [LoginGuard] }
  ] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabledBlocking'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
