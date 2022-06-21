import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventOverviewMapComponent } from '../../../../app/components/events/event-overview-map/event-overview-map.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '../../../../app/services/event.service';
import { RouterTestingModule } from '@angular/router/testing';
import { EventServiceMock } from '../../../mock/event.service.mock';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { of } from 'rxjs';


jest.mock('ol', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    Map: jest.fn(),
    View: jest.fn(),
    Feature: jest.fn(),
    Overlay: jest.fn()
  };
});


jest.mock('ol/layer', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    layer: jest.fn(),
    Tile: jest.fn(),
    Vector: jest.fn()
  };
});

jest.mock('ol/Map', () => {
  return {
    addOverlay: jest.fn()
  };
});

jest.mock('ol/source', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    source: jest.fn(),
    OSM: jest.fn(),
    Vector: jest.fn()
  };
});

jest.mock('ol/geom', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    geom: jest.fn(),
    Point: jest.fn()
  };
});

jest.mock('ol/proj', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    proj: jest.fn(),
    fromLonLat: jest.fn()
  };
});

jest.mock('ol/style', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    style: jest.fn(),
    Icon: jest.fn(),
    Style: jest.fn()
  };
});

jest.mock('ol/Geolocation', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    Geolocation: jest.fn()
  };
});

jest.mock('ol/geom/Point', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    Point: jest.fn()
  };
});

jest.mock('ol/Overlay', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    Overlay: jest.fn(),
    addOverlay: jest.fn()
  };
});

describe('EventOverviewMapComponent', () => {
  let comp: EventOverviewMapComponent;
  let fixture: ComponentFixture<EventOverviewMapComponent>;

  let eventService: EventService;
  let geoService: GeolocationService;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventOverviewMapComponent ],
      imports: [ HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: EventService, useClass: EventServiceMock },
        { provide: GeolocationService, useValue: of({ coords: { latitude: 0, longitude: 0 } }) }
      ]
    })
      .compileComponents();

    eventService = TestBed.inject(EventService);
    geoService = TestBed.inject(GeolocationService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventOverviewMapComponent);
    comp = fixture.componentInstance;

    void fixture.whenStable().then(() => {
      let element = fixture.nativeElement;
      let map = element.querySelector('#map');
      map.style.width = '100px';
      map.style.height = '100px';

    });
    comp.ngOnInit();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });


  describe('getEvents', () => {
    it('should fetch events from API ', () => {
      // When
      comp.getEvents();

      // Then
      expect(eventService.getEvents).toHaveBeenCalled();
    });
    it('should subscribe to user position', () => {
      //When
      jest.spyOn(geoService, 'subscribe');
      comp.getEvents();

      // Then
      expect(geoService.subscribe).toHaveBeenCalled();
    });
  });
});
