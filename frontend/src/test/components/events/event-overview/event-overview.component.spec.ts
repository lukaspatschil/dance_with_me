import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventOverviewComponent } from '../../../../app/components/events/event-overview/event-overview.component';
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {EventService} from "../../../../app/services/event.service";
import {EventServiceMock} from "../../../mock/event.service.mock";
import {RouterTestingModule} from "@angular/router/testing";

describe('EventOverviewComponent', () => {
  let comp: EventOverviewComponent;
  let fixture: ComponentFixture<EventOverviewComponent>;

  let httpMock: HttpTestingController;
  let eventService: EventService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventOverviewComponent ],
      imports: [ HttpClientTestingModule, RouterTestingModule],
      providers: [{provide: EventService, useClass: EventServiceMock}]
    })
    .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    eventService = TestBed.inject(EventService);
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
    it('should fetch events from API ', () => {
      // When
      fixture.whenStable().then(() => {
        comp.getEvents();
        // Then
        expect(eventService.getEvents).toHaveBeenCalledTimes(2)
      })
    });
  });

  describe('ngOnInit', () => {
    it('should fetch events from API ', () => {
      // When
      fixture.whenStable().then(() => {
        comp.ngOnInit();
        // Then
        expect(eventService.getEvents).toHaveBeenCalledTimes(2)
      })
    });
  });
});
