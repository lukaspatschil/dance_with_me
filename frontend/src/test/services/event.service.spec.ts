import { TestBed } from '@angular/core/testing';

import { EventService } from '../../app/services/event.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CreateEventDto } from '../../app/dto/createEvent.dto';
import { Category } from '../../app/enums/category.enum';
import { EventDto } from '../../app/dto/event.dto';
import { environment } from '../../environments/environment';
import { EventEntity } from '../../app/entities/event.entity';


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
      // Given
      let long = 40.000;
      let lat = 31.000;
      let radius = 100;

      // When
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

  describe('getRecommendation', () => {
    it('should fetch all events', () => {
      // Given
      let long = 40.000;
      let lat = 31.000;
      let radius = 100;

      // When
      eventService.getRecommendation(long, lat, radius).subscribe(
        events => {
          expect(events).toEqual(expectedEvents);
        }
      );

      // Then
      const req = httpTestingController.expectOne(`${environment.baseUrl}/recommendation?longitude=40&latitude=31&radius=100`);
      expect(req.request.method).toEqual('GET');

      req.flush(expectedEvents);
    });
  });

  describe('participateOnEvent', () => {
    it('should return 204 when request was successfully', () => {
      // When
      const id = 'google:12345';
      const status = 204;

      eventService.participateOnEvent(id).subscribe(
        resp => {
          expect(resp.status).toEqual(status);
        }
      );

      // Then
      const req = httpTestingController.expectOne(`${environment.baseUrl}/event/${id}/participation`);
      expect(req.request.method).toEqual('POST');
    });

    it('should add participation to event', () => {
      // When
      const id = 'google:12345';

      eventService.participateOnEvent(id).subscribe(() => {});

      // Then
      const req = httpTestingController.expectOne(`${environment.baseUrl}/event/${id}/participation`);
      expect(req.request.method).toEqual('POST');

      eventService.getEvent(id).subscribe(
        resp => {
          expect(resp).toEqual(event);
        }
      );

      const post = httpTestingController.expectOne(`${environment.baseUrl}/event/${id}`);
      post.flush(event);

    });

  });

  describe('deleteParticipateOnEvent', () => {
    it('should return 204 when request was successfully', () => {
      // When
      const id = 'google:12345';
      const status = 204;

      eventService.deleteParticipateOnEvent(id).subscribe(
        resp => {
          expect(resp.status).toEqual(status);
        }
      );

      // Then
      const req = httpTestingController.expectOne(eventService.URL_EVENT_BASE + '/' + id + '/participation');
      expect(req.request.method).toEqual('DELETE');
    });
    it('should delete participation from event', () => {
      // When
      const id = 'google:12345';

      eventService.deleteParticipateOnEvent(id).subscribe(() => {});

      // Then
      const req = httpTestingController.expectOne(`${environment.baseUrl}/event/${id}/participation`);
      expect(req.request.method).toEqual('DELETE');

      eventService.getEvent(id).subscribe(
        resp => {
          expect(resp).toEqual(eventNoParticipation);
        }
      );

      const post = httpTestingController.expectOne(`${environment.baseUrl}/event/${id}`);
      post.flush(eventNoParticipation);
    });
  });

  describe('deleteEvent', () => {
    it('should return 204 when request was successfully', () => {
      // When
      const id = 'google:12345';
      const status = 204;

      eventService.deleteEvent(id).subscribe(
        resp => {
          expect(resp.status).toEqual(status);
        }
      );

      const req = httpTestingController.expectOne(`${environment.baseUrl}/event/${id}`);
      req.flush(eventDto);
    });
  });


  describe('patchEvent', () => {
    it('should patch an event and return ok', () => {
      // Given
      const id = 'google:12345';
      const newEvent: Partial<CreateEventDto> =  {
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

      // When
      eventService.patchEvent(newEvent, id).subscribe((res) => {
        expect(res.ok).toBeTruthy();
      }
      );

      // Then
      httpTestingController.expectOne({
        method: 'PATCH',
        url: eventService.URL_EVENT_BASE + '/' + id
      });
    });
  });

});

const event: EventEntity = {
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
  userParticipates: true,
  organizerName: 'organizerName'
};

const eventNoParticipation: EventEntity = {
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
  userParticipates: false,
  organizerName: 'organizerName'
};

const eventDto: EventDto = {
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
  category: [Category.SALSA],
  organizerName: 'organizerName'
};

const expectedEvents: EventDto[] = [eventDto];
