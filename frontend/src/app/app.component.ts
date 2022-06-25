import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './core/auth/auth.service';
import { UserService } from './services/user.service';
import { EventEntity } from './entities/event.entity';
import { EventService } from './services/event.service';
import { SwPush } from '@angular/service-worker';
import { NotificationService } from './services/notification.service';
import { first } from 'rxjs';
import { GeolocationService } from '@ng-web-apis/geolocation';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy{
  title = 'dance-with-me-web-client';

  language = 'de';

  events: EventEntity[] = [];

  sub: PushSubscription | undefined;

  interval: number | undefined;

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  radius = 10000;

  readonly VAPID_PUBLIC_KEY = 'BMpsMmCEIm_5UDo9GImyXTSIzwaSbJTh-CxEu1wsPjJGHQhOKsK-KFP8Z0O3H_TixTbEEoxaDfu2ByF7mxAubnk';

  @HostBinding('class.navbar-opened') navbarOpened = false;

  constructor(
    public readonly translate: TranslateService,
    public readonly authService: AuthService,
    public readonly userService: UserService,
    public readonly eventService: EventService,
    private readonly geolocation$: GeolocationService,
    private readonly swPush: SwPush,
    private readonly notificationService: NotificationService) {
    translate.addLangs(['en', 'de']);
    translate.setDefaultLang('de');
  }

  ngOnInit(): void {
    this.subscribeToNotifications();

    this.interval = window.setInterval(() => {
      this.getRecommendation();
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    }, 10000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  getRecommendation(): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    this.geolocation$.pipe(first(position => position !== null)).subscribe((position) => {
      this.eventService.getRecommendation(position.coords.longitude, position.coords.latitude, this.radius).subscribe((data) => {
        if (data.length > 0) {
          this.sendNotification();
        }
      });
    });
  }

  subscribeToNotifications(): void {
    if (!this.swPush.isEnabled) {
      console.log('Notification is not enabled.');
      return;
    }

    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    }).then(sub => {
      this.notificationService.addPushSubscriber(sub).subscribe();
    }).catch((error) => {
      console.log(error);
    });
  }

  sendNotification(): void {
    this.notificationService.send().subscribe();
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
