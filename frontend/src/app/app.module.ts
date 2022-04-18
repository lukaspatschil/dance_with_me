import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule} from "@angular/common/http";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Language selection
import { TranslateLoader, TranslateModule} from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

// components
import { AboutPageComponent } from './standardPages/about-page/about-page.component';
import { LegalPageComponent } from './standardPages/legal-page/legal-page.component';
import { PrivacyPageComponent } from './standardPages/privacy-page/privacy-page.component';

@NgModule({
  declarations: [
    AppComponent,
    AboutPageComponent,
    LegalPageComponent,
    PrivacyPageComponent

  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient]
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

export function httpTranslateLoader (http: HttpClient){
  return new TranslateHttpLoader(http);
}

