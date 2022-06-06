import {
  getEventEntityWithAddressAndLocation,
  invalidAddress,
  noCountryLatitude,
  noCountryLongitude,
  validAddress,
  validLatitude,
  validLongitude,
} from '../test_data/openStreetMapApi.testData';
import { InternalServerErrorException } from '@nestjs/common';
import { AddressEntity } from '../../src/core/entity/address.entity';
import { NotFoundError } from '../../src/core/error/notFound.error';

export class OpenStreetMapApiModelMock {
  getAddress = jest.fn((long: number, lang: number) => {
    if (long === validLongitude && lang === validLatitude) {
      return getEventEntityWithAddressAndLocation().address;
    } else if (long === noCountryLongitude && lang === noCountryLatitude) {
      throw NotFoundError;
    } else {
      throw new InternalServerErrorException();
    }
  });

  getLocationPoint = jest.fn((address: AddressEntity) => {
    if (address === validAddress) {
      return getEventEntityWithAddressAndLocation().location;
    } else if (address === invalidAddress) {
      throw NotFoundError;
    } else {
      throw new InternalServerErrorException();
    }
  });
}
