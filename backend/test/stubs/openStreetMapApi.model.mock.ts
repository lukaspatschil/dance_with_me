import {
  getEventEntityWithAddressAndLocation,
  invalidAddress,
  noCountryLatitude,
  noCountryLongitude,
  validAddress,
  validLatitude,
  validLongitude,
} from '../test_data/openStreetMapApi.testData';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AddressEntity } from '../../src/core/entity/address.entity';

export class OpenStreetMapApiModelMock {
  getAddress = jest.fn((long: number, lang: number) => {
    if (long === validLongitude && lang === validLatitude) {
      return getEventEntityWithAddressAndLocation().address;
    } else if (long === noCountryLongitude && lang === noCountryLatitude) {
      throw new NotFoundException();
    } else {
      throw new InternalServerErrorException();
    }
  });

  getLocationPoint = jest.fn((address: AddressEntity) => {
    if (address === validAddress) {
      return getEventEntityWithAddressAndLocation().location;
    } else if (address === invalidAddress) {
      throw new NotFoundException();
    } else {
      throw new InternalServerErrorException();
    }
  });
}
