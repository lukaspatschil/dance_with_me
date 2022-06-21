import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EventService } from '../../../services/event.service';
import { EventEntity } from '../../../entities/event.entity';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { first } from 'rxjs';
import { Feature, Map, MapEvent, Overlay, View } from 'ol';
import Geolocation from 'ol/Geolocation';
import Point from 'ol/geom/Point';
import { Vector as VectorLayer, Tile as TileLayer } from 'ol/layer';
import { fromLonLat, transform, transformExtent } from 'ol/proj';
import { Vector, OSM } from 'ol/source';
import { getDistance } from 'ol/sphere';
import { Style, Icon } from 'ol/style';


@Component({
  selector: 'app-event-overview-map',
  templateUrl: './event-overview-map.component.html',
  styleUrls: ['./event-overview-map.component.scss']
})


export class EventOverviewMapComponent implements OnInit {

  @ViewChild('popup') popupElement!: ElementRef;

  map!: Map;

  eventsLayer = new VectorLayer({
    style: new Style({
      image: new Icon({
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        anchor: [0.5, 0.5],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        src: 'assets/img/marker.svg'
      })
    })
  });

  eventEntity?: EventEntity;

  constructor(private readonly eventService: EventService,
    private readonly geolocation$: GeolocationService) {}

  ngOnInit(): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    this.geolocation$.pipe(first(position => position !== null)).subscribe((position) => {
      this.initializeMap(position.coords.latitude, position.coords.longitude);
    });
  }

  renderEvents(longitude: number, latitude: number, radius: number): void {
    this.eventService.getEvents(longitude, latitude, radius).subscribe((events) => {
      this.eventsLayer.setSource(new Vector({
        features: events.map(event =>
          new Feature({
            geometry: new Point(fromLonLat([event.location.longitude, event.location.latitude])),
            event: event
          })
        )
      }));
    });
  }

  initializeMap(currLat: number, currLng: number): void{
    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source:  new OSM({
            url: 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
          })
        }),
        this.eventsLayer
      ],
      view: new View({
        center: fromLonLat([currLng, currLat]),
        zoom: 15
      })
    });

    this.addUserPositionPoint();

    this.map.on('moveend', (mapEvent: MapEvent) => {
      const size = mapEvent.map.getSize();
      const center = <[number, number]>mapEvent.map.getView().getCenter();
      const sourceProj = mapEvent.map.getView().getProjection();
      const extent = mapEvent.map.getView().calculateExtent(size);

      const [minX, minY, maxX, maxY] = transformExtent(extent, sourceProj, 'EPSG:4326');
      const transformedCenter = <[number, number]>transform(center, sourceProj, 'EPSG:4326');

      const centerToMinXY = getDistance(transformedCenter, [minX, minY]);
      const centerToMaxXY = getDistance(transformedCenter, [maxX, maxY]);

      const maxRadius = Math.max(centerToMinXY, centerToMaxXY);
      const [longitude, latitude] = transformedCenter;

      this.renderEvents(longitude, latitude, maxRadius);
    });

    this.onEventSelected();
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

    let vectorLayer = new VectorLayer({
      source: new Vector({
        features: [markerFeature]
      }),
      style: new Style({
        image: new Icon({
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

  onEventSelected(): void{
    let popup = new Overlay({
      element: this.popupElement.nativeElement,
      positioning: 'bottom-center',
      stopEvent: false,
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      offset: [-10, -10]
    });
    this.map.addOverlay(popup);

    this.map.on('singleclick', (event) => {
      const pixel = this.map.getEventPixel(event.originalEvent);
      const hit = this.map.hasFeatureAtPixel(pixel);
      if (hit){
        const [feature] = this.map.getFeaturesAtPixel(pixel);

        popup.setPosition(event.coordinate);
        this.eventEntity = feature?.get('event');
      } else {
        popup.setPosition(undefined);
      }
    });
  }

}
