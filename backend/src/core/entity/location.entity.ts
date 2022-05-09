import { GeolocationEnum } from '../schema/enum/geolocation.enum';

export class LocationEntity {
  type!: GeolocationEnum;

  coordinates!: [number, number];
}

export class UpdateLocationEntity {
  type?: GeolocationEnum;
  coordinates?: number[] | undefined;
  //coordinates?: (number | undefined)[];
}
