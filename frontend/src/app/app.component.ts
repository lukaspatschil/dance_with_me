import { Component, HostBinding, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './core/auth/auth.service';
import { UserService } from './services/user.service';
import { EventEntity } from './entities/event.entity';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  title = 'dance-with-me-web-client';

  language = 'de';

  events: EventEntity[] = [];

  @HostBinding('class.navbar-opened') navbarOpened = false;

  constructor(
    public readonly translate: TranslateService,
    public readonly authService: AuthService,
    public readonly userService: UserService,
    private readonly swUpdate: SwUpdate
  ) {
    translate.addLangs(['en', 'de']);
    translate.setDefaultLang('de');
  }

  ngOnInit(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        window.location.reload();
      });
    }
  }

  toggleNavbar(): void {
    this.navbarOpened = !this.navbarOpened;
  }

  toggleLanguage(): void {
    if (this.language == 'de'){
      this.language = 'en';
    } else {
      this.language = 'de';
    }
    this.translate.use(this.language);
  }
}
