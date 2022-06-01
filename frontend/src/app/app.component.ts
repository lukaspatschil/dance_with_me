import {Component, HostBinding} from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { AuthService } from './core/auth/auth.service';
import {UserService} from "./services/user.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  title = 'dance-with-me-web-client';
  language = 'de';

  @HostBinding('class.navbar-opened') navbarOpened = false;
  constructor(
    public readonly translate: TranslateService,
    public readonly authService: AuthService,
    public readonly userService: UserService
  ) {
    translate.addLangs(['en', 'de']);
    translate.setDefaultLang('de');
  }

  toggleNavbar() {
    this.navbarOpened = !this.navbarOpened;
  }

  toggleLanguage(){
    if(this.language == 'de'){
      this.language = 'en';
    } else {
      this.language = 'de';
    }
    this.translate.use(this.language)
  }
}
