import { Component, OnInit, SecurityContext } from '@angular/core';
import { EventService } from '../../../services/event.service';
import { EventEntity } from '../../../entities/event.entity';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { first } from 'rxjs';

import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-event-overview',
  templateUrl: './event-overview.component.html',
  styleUrls: ['./event-overview.component.scss']
})
export class EventOverviewComponent implements OnInit{
  title = 'events';

  events: EventEntity[] = [];

  recommendation = false;

  userParticipates = false;

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  radius = 10000;

  constructor(private readonly eventService: EventService,
    private readonly sanitizer: DomSanitizer,
    private readonly geolocation$: GeolocationService){}

  ngOnInit(): void {
    this.getEvents();
  }

  getEvents(): void {
    this.recommendation = false;
    this.events = [];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    this.geolocation$.pipe(first(position => position !== null)).subscribe((position) => {
      this.eventService.getEvents(position.coords.longitude, position.coords.latitude, this.radius).subscribe((data) => {
        this.events = data;
      });
    });
  }

  imageUrl(event: EventEntity): SafeUrl | null {
    return this.sanitizer.sanitize(SecurityContext.URL, `${environment.baseUrl}/image/${event.imageId}`);
  }

  getRecommendation(): void {
    this.recommendation = true;
    this.events = [];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    this.geolocation$.pipe(first(position => position !== null)).subscribe((position) => {
      this.events = [];
      this.eventService.getRecommendation(position.coords.longitude, position.coords.latitude, this.radius).subscribe((data) => {
        this.events = data;
      });
    });
  }


  radiusChanged(event: Event): void {
    const element = event.target as HTMLInputElement;

    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    this.radius = parseInt(element.value) * 1000;
    if (this.recommendation){
      this.getRecommendation();
    } else {
      this.getEvents();
    }
  }
}
