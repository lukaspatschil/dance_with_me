import { Component, NgZone, OnInit, SecurityContext } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, take } from 'rxjs';
import { EventEntity } from '../../../entities/event.entity';
import { EventService } from '../../../services/event.service';
import { HttpStatusCode } from '@angular/common/http';
import { Clipboard } from '@angular/cdk/clipboard';
import { moveIn } from '../../../core/animations/moveIn.animation';
import { UserService } from '../../../services/user.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss'],
  animations: [moveIn]
})
export class EventDetailComponent implements OnInit {

  event$!: Observable<EventEntity | null>;

  event?: EventEntity;

  userParticipates = false;

  private id!: string;

  showAlert = false;

  showDeleteOption = false;

  showError = false;

  constructor(private readonly route: ActivatedRoute,
    private readonly eventService: EventService,
    private readonly clipboard: Clipboard,
    private readonly sanitizer: DomSanitizer,
    private readonly userService: UserService,
    private readonly _router: Router,
    private readonly zone: NgZone) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;

    this.event$ = this.eventService.getEvent(this.id);

    const user = this.userService.user;

    this.eventService.getEvent(this.id).subscribe(event => {
      if (event) {
        this.event = event;
      }
    });

    this.showError = false;

    this.event$.pipe(take(1)).subscribe(event => {
      if (event && user) {
        this.userParticipates = event.userParticipates;
        this.showDeleteOption = event.organizerId === user.id;
      }
    });
  }

  deleteAndRefresh(event: EventEntity): void{
    this.eventService.deleteEvent(event.id).subscribe({
      next: async (resp) => {
        await this.zone.run(async () => {
          if (resp.status === HttpStatusCode.NoContent) {
            await this._router.navigateByUrl('events');
          } else {
            this.showError = true;
          }
        });
      },
      error: () => {
        this.zone.run(() => {
          this.showError = true;
        });
      }
    });
  }

  imageUrl(event?: EventEntity): SafeUrl | null {
    return this.sanitizer.sanitize(SecurityContext.URL, `${environment.baseUrl}/image/${event?.imageId}`);
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
