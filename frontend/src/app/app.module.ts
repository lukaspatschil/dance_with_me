import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ImageAccessorDirective } from './directives/image.directive';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Language selection
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// components
import { AboutPageComponent } from './components/about-page/about-page.component';
import { LegalPageComponent } from './components/legal-page/legal-page.component';
import { PrivacyPageComponent } from './components/privacy-page/privacy-page.component';
import { AuthModule } from './core/auth/auth.module';
import { LandingComponent } from './components/landing/landing.component';
import { CreateEventPageComponent } from './components/events/create-event-page/create-event-page.component';
import { CoreModule } from './core/core.module';
import { EventDetailComponent } from './components/events/event-detail/event-detail.component';
import { UserDetailComponent } from './components/user/user-detail/user-detail.component';
import { PaymentComponent } from './components/payment/payment.component';
import { NgAisModule } from 'angular-instantsearch';
import { EventSearchComponent } from './components/events/event-search/event-search.component';
import { EventOverviewComponent } from './components/events/event-overview/event-overview.component';
import { EventOverviewMapComponent } from './components/events/event-overview-map/event-overview-map.component';
import { AdminComponent } from './components/admin/admin.component';
import { EditEventPageComponent } from './components/events/event-edit/edit-event-page.component';

@NgModule({
  declarations: [
    AppComponent,
    AboutPageComponent,
    LegalPageComponent,
    PrivacyPageComponent,
    CreateEventPageComponent,
    EditEventPageComponent,
    LandingComponent,
    EventOverviewComponent,
    EventOverviewMapComponent,
    EventDetailComponent,
    ImageAccessorDirective,
    UserDetailComponent,
    PaymentComponent,
    EventSearchComponent,
    AdminComponent,
    PaymentComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient]
      }
    }),
    NgAisModule.forRoot(),
    AuthModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

export function httpTranslateLoader(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
