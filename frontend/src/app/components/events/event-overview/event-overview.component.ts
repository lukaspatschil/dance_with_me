import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../services/event.service';
import { EventEntity } from '../../../entities/event.entity';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { first } from 'rxjs';


@Component({
  selector: 'app-event-overview',
  templateUrl: './event-overview.component.html',
  styleUrls: ['./event-overview.component.scss']
})
export class EventOverviewComponent implements OnInit{
  title = 'events';

  events: EventEntity[] = [];

  constructor(private readonly eventService: EventService,
    private readonly geolocation$: GeolocationService){}

  ngOnInit(): void {
    this.getEvents();
  }

  getEvents(): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    this.geolocation$.pipe(first(position => position !== null)).subscribe((position) => {
      let radius = 10000;
      this.eventService.getEvents(position.coords.latitude, position.coords.longitude, radius).subscribe((data) => this.events = data);
    });
  }
}
