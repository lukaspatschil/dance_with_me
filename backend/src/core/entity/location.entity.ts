import { GeolocationEnum } from '../schema/enum/geolocation.enum';

export class LocationEntity {
  type!: GeolocationEnum;

  coordinates!: [number, number];
}
