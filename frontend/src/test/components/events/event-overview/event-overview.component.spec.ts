import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventOverviewComponent } from '../../../../app/components/events/event-overview/event-overview.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '../../../../app/services/event.service';
import { EventServiceMock } from '../../../mock/event.service.mock';
import { RouterTestingModule } from '@angular/router/testing';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { of } from 'rxjs';


describe('EventOverviewComponent', () => {
  let comp: EventOverviewComponent;
  let fixture: ComponentFixture<EventOverviewComponent>;

  let eventService: EventService;
  let geoService: GeolocationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventOverviewComponent ],
      imports: [ HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: EventService, useClass: EventServiceMock },
        { provide: GeolocationService, useValue: of({ coords: { latitude: 1, longitude: 1 } }) }]
    })
      .compileComponents();

    eventService = TestBed.inject(EventService);
    geoService = TestBed.inject(GeolocationService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventOverviewComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });

  describe('getEvents', () => {
    it('should fetch events from API ', async () => {
      // When
      await fixture.whenStable();
      comp.getEvents();

      // Then
      expect(eventService.getEvents).toHaveBeenCalled();
    });
    it('should subscribe to user position',  () => {
      //When
      jest.spyOn(geoService, 'subscribe');
      comp.getEvents();

      // Then
      expect(geoService.subscribe).toHaveBeenCalled();
    });
  });

  describe('ngOnInit', () => {
    it('should fetch events from API ', async () => {
      // When
      await fixture.whenStable();
      comp.ngOnInit();

      // Then
      expect(eventService.getEvents).toHaveBeenCalledTimes(2);
    });
  });
});
