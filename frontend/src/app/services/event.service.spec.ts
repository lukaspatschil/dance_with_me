import { TestBed } from '@angular/core/testing';

import { EventService } from './event.service';
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";

import { Event } from '../models/event'
import {Category} from "../enums/category";


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
      const newEvent: Event =  {
        name: 'name',
        description: 'description',
        location: {
          country: 'country',
          street: 'street',
          city: 'city',
          housenumber: 10,
          postalcode: 1020,
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

  })
});
