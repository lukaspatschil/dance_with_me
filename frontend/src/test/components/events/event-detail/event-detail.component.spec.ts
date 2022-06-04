import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventDetailComponent } from '../../../../app/components/events/event-detail/event-detail.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '../../../../app/services/event.service';
import { RouterTestingModule } from '@angular/router/testing';
import { EventServiceMock } from '../../../mock/event.service.mock';

describe('EventDetailComponent', () => {
  let comp: EventDetailComponent;
  let fixture: ComponentFixture<EventDetailComponent>;

  let eventService: EventService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventDetailComponent ],
      imports: [ HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: EventService, useClass: EventServiceMock }]
    })
      .compileComponents();

    eventService = TestBed.inject(EventService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventDetailComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });


  describe('ngOnInit', () => {
    it('should fetch event from API ', async () => {
      // When
      await fixture.whenStable();
      comp.ngOnInit();

      // Then
      expect(eventService.getEvent).toHaveBeenCalled();

    });
  });
});
