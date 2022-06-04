import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { EventEntity } from '../../../entities/event.entity';
import { EventService } from '../../../services/event.service';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {

  event$!: Observable<EventEntity | null>;

  constructor(private readonly route: ActivatedRoute,
    private readonly service: EventService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;

    this.event$ = this.service.getEvent(id);
  }
}
