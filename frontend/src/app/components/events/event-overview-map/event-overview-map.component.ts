import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EventService } from '../../../services/event.service';
import { EventEntity } from '../../../entities/event.entity';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { take } from 'rxjs';
import { Feature, Map, Overlay, View } from 'ol';
import * as layer from 'ol/layer';
import * as source from 'ol/source';
import * as geom from 'ol/geom';
import * as proj from 'ol/proj';
import * as style from 'ol/style';
import Geolocation from 'ol/Geolocation';
import Point from 'ol/geom/Point';


@Component({
  selector: 'app-event-overview-map',
  templateUrl: './event-overview-map.component.html',
  styleUrls: ['./event-overview-map.component.scss']
})


export class EventOverviewMapComponent implements OnInit {

  @ViewChild('popup') popupElement!: ElementRef;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map!: any;

  events: EventEntity[] | null = [];

  eventEntity?: EventEntity;

  constructor(private readonly eventService: EventService,
    private readonly geolocation$: GeolocationService) {}

  ngOnInit(): void {
    this.getPosition();
  }

  getEvents(long: number, lat: number): void {
    let radius = 10000;
    this.eventService.getEvents(long, lat, radius).subscribe((data) => this.events = data);
  }

  initializeMap(currLat: number, currLng: number): void{
    this.map = new Map({
      target: 'map',
      layers: [
        new layer.Tile({
          source:  new source.OSM({
            url: 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
          })
        })
      ],
      view: new View({
        center: proj.fromLonLat([currLng, currLat]),
        zoom: 15
      })
    });

    // add marker for all events
    if (this.events !== null) {
      for (let i in this.events) {
        let event = this.events[i];
        if (event !== undefined) {
          this.addPoint(event.location.latitude, event.location.longitude, event);
        }
      }
    }
  }

  addUserPositionPoint(): void{
    let geolocation = new Geolocation({
      projection: this.map.getView().getProjection(),
      tracking: true,
      trackingOptions: {
        enableHighAccuracy: true,
        maximumAge: 2000
      }
    });

    let markerFeature = new Feature();

    let vectorLayer = new layer.Vector({
      source: new source.Vector({
        features: [markerFeature]
      }),
      style: new style.Style({
        image: new style.Icon({
          // eslint-disable-next-line @typescript-eslint/no-magic-numbers
          anchor: [0.5, 0.5],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          src: 'assets/img/user_marker.svg'
        })
      })
    });

    this.map.addLayer(vectorLayer);

    geolocation.on('change', function () {
      let pos = geolocation.getPosition();
      markerFeature.setGeometry(pos ? new Point(pos) : undefined);
    });
  }

  addPoint(lat: number, lng: number, eventEntity: EventEntity): void {
    let vectorLayer = new layer.Vector({
      source: new source.Vector({
        features: [
          new Feature({
            geometry: new geom.Point(proj.fromLonLat([lat, lng])),
            event: eventEntity
          })]
      }),
      style: new style.Style({
        image: new style.Icon({
          // eslint-disable-next-line @typescript-eslint/no-magic-numbers
          anchor: [0.5, 0.5],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          src: 'assets/img/marker.svg'
        })
      })
    });

    this.onEventSelected();

    this.map.addLayer(vectorLayer);
  }


  onEventSelected(): void{
    let popup = new Overlay({
      element: this.popupElement.nativeElement,
      positioning: 'bottom-center',
      stopEvent: false,
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      offset: [-10, -10]
    });
    this.map.addOverlay(popup);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.map.on('singleclick', (e: { originalEvent: any; coordinate: unknown;  feature: Feature }) => {
      const pixel = this.map.getEventPixel(e.originalEvent);
      const hit = this.map.hasFeatureAtPixel(pixel);
      if (hit){
        let feature = this.map.getFeaturesAtPixel(pixel);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        popup.setPosition(e.coordinate);
        this.eventEntity = feature[0].get('event');
      } else {
        popup.setPosition(undefined);
      }
    });
  }

  getPosition(): void {
    this.geolocation$.pipe(take(1)).subscribe(position => {
      this.getEvents(position.coords.latitude, position.coords.longitude);
      this.initializeMap(position.coords.latitude, position.coords.longitude);
      this.addUserPositionPoint();
    }
    );
  }
}
