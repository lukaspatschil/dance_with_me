import { Component, HostBinding } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './core/auth/auth.service';
import { UserService } from './services/user.service';
import { environment } from '../environments/environment';
import {first} from "rxjs";
import {GeolocationService} from "@ng-web-apis/geolocation";
import {EventService} from "./services/event.service";
import {EventEntity} from "./entities/event.entity";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  title = 'dance-with-me-web-client';

  language = 'de';

  events: EventEntity[] = [];

  @HostBinding('class.navbar-opened') navbarOpened = false;

  constructor(
    public readonly translate: TranslateService,
    public readonly authService: AuthService,
    public readonly userService: UserService,
    private readonly eventService: EventService,
    private readonly geolocation$: GeolocationService
  ) {
    translate.addLangs(['en', 'de']);
    translate.setDefaultLang('de');
  }

  ngOnInit(): void {
    this.getEvents();
    console.log(environment.baseUrl);
    console.log(environment.loginCallback);
  }

  getEvents(): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    this.geolocation$.pipe(first(position => position !== null)).subscribe((position) => {
      let radius = 10000;
      this.eventService.getEvents(position.coords.longitude, position.coords.latitude, radius).subscribe((data) =>{
        console.log(data);
        this.events = data} );
    });
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
