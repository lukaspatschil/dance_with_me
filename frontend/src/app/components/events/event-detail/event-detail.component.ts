import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, take } from 'rxjs';
import { EventEntity } from '../../../entities/event.entity';
import { EventService } from '../../../services/event.service';
import { HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {

  event$!: Observable<EventEntity | null>;

  userParticipates = false;

  private id!: string;


  constructor(private readonly route: ActivatedRoute,
    private readonly eventService: EventService) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;

    this.event$ = this.eventService.getEvent(this.id);

    this.event$.pipe(take(1)).subscribe(event => {
      if (event !== null) {
        this.userParticipates = event.userParticipates;
      }
    });
  }

  onAttendClicked(event: EventEntity): void{
    if (!this.userParticipates){
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
