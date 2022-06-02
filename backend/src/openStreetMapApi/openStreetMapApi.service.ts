import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { LocationEntity } from '../core/entity/location.entity';
import { GeolocationEnum } from '../core/schema/enum/geolocation.enum';
import { AddressEntity } from '../core/entity/address.entity';
import { OpenStreetMapEntity } from '../core/entity/openStreetMap.entity';

@Injectable()
export class OpenStreetMapApiService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  private readonly logger = new Logger(OpenStreetMapApiService.name);

  async getAddress(
    longitude: number,
    latitude: number,
  ): Promise<AddressEntity> {
    let promiseResponse = null;
    try {
      promiseResponse = await lastValueFrom(
        this.httpService.get<OpenStreetMapEntity>(
          `${this.configService.get(
            'NOMINATIM_REVERSE_ENDPOINT',
            'https://nominatim.openstreetmap.org/reverse/?format=json&addressdetails=1&limit=1',
          )}&lat=${latitude}&lon=${longitude}`,
        ),
      );
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
    const response: OpenStreetMapEntity = promiseResponse.data;
    if (
      response.address &&
      response.address.country &&
      response.address.postcode &&
      response.address.road
    ) {
      return {
        country: response.address.country,
        city:
          response.address.city ??
          response.address.village ??
          response.address.state,
        postalcode: response.address.postcode,
        street: response.address.road,
        housenumber: response.address.house_number,
      } as AddressEntity;
    }
    throw new NotFoundException();
  }

  async getLocationPoint(
    addressEntity: AddressEntity,
  ): Promise<LocationEntity> {
    let promiseResponse = null;
    let url = new URLSearchParams(
      `street=${addressEntity.housenumber} ${addressEntity.street}&city=${addressEntity.city}&country=${addressEntity.country}&postalcode=${addressEntity.postalcode}`,
    ).toString();

    url = `${this.configService.get(
      'NOMINATIM_SEARCH_ENDPOINT',
      'https://nominatim.openstreetmap.org/search/?format=json&addressdetails=1&limit=1',
    )}&${url}`;

    try {
      promiseResponse = await lastValueFrom(
        this.httpService.get<Array<OpenStreetMapEntity>>(url),
      );
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
    const response: Array<OpenStreetMapEntity> = promiseResponse.data;

    if (response[0] && response[0].lat && response[0].lon) {
      return {
        type: GeolocationEnum.POINT,
        coordinates: [Number(response[0].lon), Number(response[0].lat)],
      } as LocationEntity;
    }
    throw new NotFoundException();
  }
}
