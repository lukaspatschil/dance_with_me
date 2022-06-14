import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../services/event.service';
import { EventEntity } from '../../../entities/event.entity';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { first } from 'rxjs';
import { HttpStatusCode } from '@angular/common/http';


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

  constructor(private readonly eventService: EventService,
    private readonly geolocation$: GeolocationService){}

  ngOnInit(): void {
    this.getEvents();
  }

  getEvents(): void {
    this.recommendation = false;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    this.geolocation$.pipe(first(position => position !== null)).subscribe((position) => {
      let radius = 10000;
      this.eventService.getEvents(position.coords.longitude, position.coords.latitude, radius).subscribe((data) => this.events = data);
    });
  }

  getRecommendation(): void {
    this.recommendation = true;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    this.geolocation$.pipe(first(position => position !== null)).subscribe((position) => {
      let radius = 10000;
      this.eventService.getRecommendation(position.coords.longitude, position.coords.latitude, radius).subscribe((data) => {
        this.events = data;
      });
    });
  }

  onAttendClicked(event: EventEntity): void{
    if (!event.userParticipates){
      this.eventService.participateOnEvent(event.id).subscribe({
        next: resp => {
          if (resp.status == HttpStatusCode.NoContent) {
            this.userParticipates = true;
          }
        }
      });
    } else {
      this.eventService.deleteParticipateOnEvent(event.id).subscribe({
        next: resp => {
          if (resp.status == HttpStatusCode.NoContent) {
            this.userParticipates = false;
          }
        }
      });
    }
  }
}
