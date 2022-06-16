import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventOverviewComponent } from '../../../../app/components/events/event-overview/event-overview.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { of } from 'rxjs';
import { EventEntity } from '../../../../app/entities/event.entity';
import { Category } from '../../../../app/enums/category.enum';
import { EventService } from '../../../../app/services/event.service';
import { EventServiceMock } from '../../../mock/event.service.mock';



describe('EventOverviewComponent', () => {
  let comp: EventOverviewComponent;
  let fixture: ComponentFixture<EventOverviewComponent>;

  let eventService: EventService;
  let geoService: GeolocationService;

  let radiusSlider: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventOverviewComponent ],
      imports: [ HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: EventService, useClass: EventServiceMock },
        { provide: GeolocationService, useValue: of({ coords: { latitude: 1, longitude: 1 } }) }
      ]
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

  beforeEach(async () => {
    await fixture.whenStable();
    radiusSlider = fixture.debugElement.nativeElement.querySelector('#radius');
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

  describe('getRecommendation', () => {
    it('should fetch events from API ', async () => {
      // When
      await fixture.whenStable();
      comp.getRecommendation();

      // Then
      expect(eventService.getRecommendation).toHaveBeenCalled();
    });
    it('should subscribe to user position',  () => {
      //When
      jest.spyOn(geoService, 'subscribe');
      comp.getRecommendation();

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

  describe('onAttendClicked', () => {
    it('should delete a participation', async () => {
      // When
      await fixture.whenStable();
      comp.onAttendClicked(eventEntity);

      // Then
      expect(eventService.deleteParticipateOnEvent).toHaveBeenCalledWith(eventEntity.id);
    });

    it('should post an participation', async () => {
      // When
      await fixture.whenStable();
      comp.onAttendClicked(eventEntityNoParticipation);

      // Then
      expect(eventService.participateOnEvent).toHaveBeenCalledWith(eventEntity.id);
    });
  });

  describe('radiusChanged', () => {
    it('should call getEvents', async () => {
      // When
      await fixture.whenStable();
      comp.recommendation = false;
      radiusSlider.dispatchEvent(new Event('change'));

      // Then
      expect(eventService.getEvents).toHaveBeenCalled();
    });

    it('should call getRecommendation', async () => {
      // When
      await fixture.whenStable();
      comp.recommendation = true;
      radiusSlider.dispatchEvent(new Event('change'));

      // Then
      expect(eventService.getRecommendation).toHaveBeenCalled();
    });
  });
});

const eventEntity: EventEntity = {
  id: '1',
  name: 'name',
  description: 'description',
  location: {
    longitude: 40.000,
    latitude: 31.000
  },
  address: {
    country: 'country',
    street: 'street',
    city: 'city',
    housenumber: '10',
    postalcode: '1020',
    addition: 'addition'
  },
  price: 1,
  public: true,
  startDateTime: new Date('2022-04-24T10:00'),
  endDateTime: new Date('2022-04-24T10:00'),
  category: [Category.SALSA],
  userParticipates: true
};

const eventEntityNoParticipation: EventEntity = {
  id: '1',
  name: 'name',
  description: 'description',
  location: {
    longitude: 40.000,
    latitude: 31.000
  },
  address: {
    country: 'country',
    street: 'street',
    city: 'city',
    housenumber: '10',
    postalcode: '1020',
    addition: 'addition'
  },
  price: 1,
  public: true,
  startDateTime: new Date('2022-04-24T10:00'),
  endDateTime: new Date('2022-04-24T10:00'),
  category: [Category.SALSA],
  userParticipates: false
};

