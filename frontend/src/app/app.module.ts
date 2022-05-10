import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule} from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Language selection
import { TranslateLoader, TranslateModule} from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

// components
import { AboutPageComponent } from './components/about-page/about-page.component';
import { LegalPageComponent } from './components/legal-page/legal-page.component';
import { PrivacyPageComponent } from './components/privacy-page/privacy-page.component';
import {AuthModule} from "./core/auth/auth.module";
import {LandingComponent} from "./components/landing/landing.component";
import { EventOverviewComponent } from './components/events/event-overview/event-overview.component';
import { CreateEventPageComponent} from "./components/events/create-event-page/create-event-page.component";
import { CoreModule } from "./core/core.module";

@NgModule({
  declarations: [
    AppComponent,
    AboutPageComponent,
    LegalPageComponent,
    PrivacyPageComponent,
    CreateEventPageComponent,
    LandingComponent,
    EventOverviewComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient]
      }
    }),
    AuthModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

export function httpTranslateLoader (http: HttpClient){
  return new TranslateHttpLoader(http);
}
