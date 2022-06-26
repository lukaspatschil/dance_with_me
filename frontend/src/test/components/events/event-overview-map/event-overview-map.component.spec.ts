import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventOverviewMapComponent } from '../../../../app/components/events/event-overview-map/event-overview-map.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EventService } from '../../../../app/services/event.service';
import { RouterTestingModule } from '@angular/router/testing';
import { EventServiceMock } from '../../../mock/event.service.mock';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { of } from 'rxjs';
import { ImageService } from '../../../../app/services/image.service';
import { ImageServiceMock } from '../../../mock/image.service.mock';
import { Vector } from 'ol/source';
import { Projection } from 'ol/proj';

/* eslint-disable @typescript-eslint/no-magic-numbers */

jest.mock('ol', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    Map: jest.fn(() => ({
      on: jest.fn(),
      addLayer: jest.fn(),
      addOverlay: jest.fn(),
      getView: jest.fn(() => ({
        getProjection: jest.fn()
      }))
    })),
    View: jest.fn(),
    Feature: jest.fn(),
    Overlay: jest.fn(),
    MapEvent: jest.fn()
  };
});


jest.mock('ol/layer', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    Tile: jest.fn(),
    Vector: jest.fn()
  };
});

jest.mock('ol/source', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    OSM: jest.fn(),
    Vector: jest.fn()
  };
});

jest.mock('ol/style', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    Icon: jest.fn(),
    Style: jest.fn()
  };
});

jest.mock('ol/Geolocation', () => {
  return jest.fn(() => ({
    on: jest.fn()
  }));
});

jest.mock('ol/geom/Point', () => {
  return jest.fn();
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
        { provide: ImageService, useClass: ImageServiceMock },
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

  it('should subscribe to user position', () => {
    //When
    jest.spyOn(geoService, 'subscribe');
    comp.ngOnInit();

    // Then
    expect(geoService.subscribe).toHaveBeenCalled();
  });

  describe('renderEvents', () => {
    it('should fetch events from API ', () => {
      // Given
      comp.eventsLayer = <never>{
        setSource: jest.fn(),
        getSource: jest.fn(() => ({
          getFeatures: jest.fn()
        }))
      };
      // When
      comp.renderEvents(0, 0, 0);

      // Then
      expect(eventService.getEvents).toHaveBeenCalled();
    });

    it('should add events to layer', () => {
      // Given
      comp.eventsLayer = <never>{
        setSource: jest.fn(),
        getSource: jest.fn(() => ({
          getFeatures: jest.fn(() => [])
        }))
      };

      // When
      comp.renderEvents(0, 0, 0);

      // Then
      expect(comp.eventsLayer.setSource).toHaveBeenCalledWith(expect.any(Vector));
    });
  });

  describe('moveHandler', () => {
    it('should call renderEvents with correct parameters', () => {
      // Given
      const spy = jest.spyOn(comp, 'renderEvents');
      const mapEvent = <never>{
        map: {
          getSize: jest.fn(() => [133, 1137]),
          getView: jest.fn(() => ({
            getCenter: jest.fn(() => [1819503, 6144280]),
            getProjection: jest.fn(() => new Projection({ code: 'EPSG:3857' })),
            calculateExtent: jest.fn(() => [1815979, 6140987, 1823159, 6147183])
          }))
        }
      };

      // When
      comp.moveHandler(mapEvent);

      // Then
      expect(spy).toHaveBeenCalledWith(16.344873544013215, 48.22446868127861, 3210.2528471114133);
    });
  });

});
