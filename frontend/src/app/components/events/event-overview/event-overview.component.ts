import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../services/event.service';
import { EventEntity } from '../../../entities/event.entity';

@Component({
  selector: 'app-event-overview',
  templateUrl: './event-overview.component.html',
  styleUrls: ['./event-overview.component.scss']
})
export class EventOverviewComponent implements OnInit{
  title = 'events';

  events: EventEntity[] = [];

  constructor(private readonly eventService: EventService){}

  ngOnInit(): void {
    this.getEvents();
  }

  getEvents(): void {
    this.eventService.getEvents().subscribe((data) => this.events = data);
  }
}
