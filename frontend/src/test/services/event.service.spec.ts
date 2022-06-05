import { TestBed } from '@angular/core/testing';

import { EventService } from '../../app/services/event.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CreateEventDto } from '../../app/dto/createEvent.dto';
import { Category } from '../../app/enums/category.enum';
import { EventDto } from '../../app/dto/event.dto';
import { environment } from '../../environments/environment';


describe('EventService', () => {
  let eventService: EventService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EventService]
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    eventService = TestBed.inject(EventService);
  });

  afterEach(() => {
    httpTestingController.verify(); //Verifies that no requests are outstanding.
  });

  it('should be created', () => {
    expect(eventService).toBeTruthy();
  });

  describe('createEvent', () => {
    it('should add an event and return it', () => {
      // When
      const newEvent: CreateEventDto =  {
        name: 'name',
        description: 'description',
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
        startDateTime: new Date('2022-04-24T10:00').toISOString(),
        endDateTime: new Date('2022-04-24T12:00').toISOString(),
        category: [Category.SALSA]
      };

      eventService.createEvent(newEvent).subscribe((res) => {
        expect(res).toEqual(newEvent);
      }
      );

      // Then
      httpTestingController.expectOne({
        method: 'POST',
        url: eventService.URL_EVENT_BASE
      });
    });
  });

  describe('getEvents', () => {
    it('should fetch all events', () => {
      // When
      const expectedEvents: EventDto[] = [{
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
        startDateTime: new Date('2022-04-24T10:00').toISOString(),
        endDateTime: new Date('2022-04-24T12:00').toISOString(),
        category: [Category.SALSA]
      }];

      let long = 40.000;
      let lat = 31.000;
      let radius = 100;
      eventService.getEvents(long, lat, radius).subscribe(
        events => {
          expect(events).toEqual(expectedEvents);
        }
      );

      // Then
      const req = httpTestingController.expectOne(`${environment.baseUrl}/event?longitude=40&latitude=31&radius=100`);
      expect(req.request.method).toEqual('GET');

      req.flush(expectedEvents);
    });
  });

  describe('getEvent', () => {
    it('should fetch event with id 1', () => {
      // When
      const expectedEvents: EventDto[] = [{
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
        startDateTime: new Date('2022-04-24T10:00').toISOString(),
        endDateTime: new Date('2022-04-24T12:00').toISOString(),
        category: [Category.SALSA]
      }];

      eventService.getEvent('1').subscribe(
        events => {
          expect(events).toEqual(expectedEvents);
        }
      );

      // Then
      const req = httpTestingController.expectOne(eventService.URL_EVENT_BASE + '/1');
      expect(req.request.method).toEqual('GET');

      req.flush(expectedEvents);
    });
  });
});
