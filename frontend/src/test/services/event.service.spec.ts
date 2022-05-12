import { TestBed } from '@angular/core/testing';

import { EventService } from '../../app/services/event.service';
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";

import { EventDto } from '../../app/dto/event.dto'
import { Category } from "../../app/enums/category";
import { EventResponseDto } from "../../app/dto/eventResponse.dto";


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
      const newEvent: EventDto =  {
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
        date: '2022-04-24',
        starttime: '10:00',
        endtime: '12:00',
        category: Category.Salsa
      };

      eventService.createEvent(newEvent).subscribe((res) =>
        expect(res).toEqual(newEvent)
      );

      // Then
      const req = httpTestingController.expectOne({
        method: 'POST',
        url: eventService.URL_EVENT_BASE,
      });
    });
  });

  describe('getEvents', () => {
    it('should fetch all events', () => {
      // When
      const expectedEvents: EventResponseDto[] = [{
        id: '1',
        name: 'name',
        description: 'description',
        location: {
          longitude: 40.000,
          latitude: 31.000,
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
        date: '2022-04-24',
        starttime: '10:00',
        endtime: '12:00',
        category: Category.Salsa
      }]

      eventService.getEvents().subscribe(
        events => expect(events).toEqual(expectedEvents)
      )

      // Then
      const req = httpTestingController.expectOne(eventService.URL_EVENT_BASE);
      expect(req.request.method).toEqual('GET')

      req.flush(expectedEvents)
    });
  });

  describe('getEvent', () => {
    it('should fetch event with id 1', () => {
      // When
      const expectedEvents: EventResponseDto[] = [{
        id: '1',
        name: 'name',
        description: 'description',
        location: {
          longitude: 40.000,
          latitude: 31.000,
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
        date: '2022-04-24',
        starttime: '10:00',
        endtime: '12:00',
        category: Category.Salsa
      }]

      eventService.getEvent("1").subscribe(
        events => expect(events).toEqual(expectedEvents)
      )

      // Then
      const req = httpTestingController.expectOne(eventService.URL_EVENT_BASE + "/1");
      expect(req.request.method).toEqual('GET')

      req.flush(expectedEvents)
    });

  })
});
