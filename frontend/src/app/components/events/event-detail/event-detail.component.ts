import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, take } from 'rxjs';
import { EventEntity } from '../../../entities/event.entity';
import { EventService } from '../../../services/event.service';
import { HttpStatusCode } from '@angular/common/http';
import { Clipboard } from '@angular/cdk/clipboard';
import { moveIn } from '../../../core/animations/moveIn.animation';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss'],
  animations: [moveIn]
})
export class EventDetailComponent implements OnInit {

  event$!: Observable<EventEntity | null>;

  userParticipates = false;

  private id!: string;

  showAlert = false;


  constructor(private readonly route: ActivatedRoute,
    private readonly eventService: EventService, private readonly clipboard: Clipboard) {}

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

  async copyMessage(): Promise<void> {
    const url = window.location.href;
    this.clipboard.copy(url);
    this.showAlert = true;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    await new Promise(resolve => setTimeout(resolve, 3000));
    this.showAlert = false;
  }
}
