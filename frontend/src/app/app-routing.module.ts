import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AboutPageComponent } from './standardPages/about-page/about-page.component';
import { LegalPageComponent } from './standardPages/legal-page/legal-page.component';
import { PrivacyPageComponent } from './standardPages/privacy-page/privacy-page.component';

const routes: Routes = [
  {path: 'about', component: AboutPageComponent},
  {path: 'legal', component: LegalPageComponent},
  {path: 'privacy', component: PrivacyPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabledBlocking'
})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
