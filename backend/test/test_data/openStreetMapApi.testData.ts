import { OpenStreetMapEntity } from '../../src/core/entity/openStreetMap.entity';
import { AddressEntity } from '../../src/core/entity/address.entity';
import { EventEntity } from '../../src/core/entity/event.entity';
import { GeolocationEnum } from '../../src/core/schema/enum/geolocation.enum';
import { AddressDto } from '../../src/core/dto/address.dto';

export const validLatitude = 48.208176;
export const validLongitude = 16.373819;

export const noCountryLatitude = 31.978187;
export const noCountryLongitude = -35.348262;

export const invalidTokenLatitude = 30.000001;
export const invalidTokenLongitude = -30.348262;

export const validAddress: AddressEntity = {
  country: 'Österreich',
  city: 'Wien',
  postalcode: '1010',
  street: 'Stephansplatz',
  housenumber: '4',
};

export const validAddressDTO: AddressDto = {
  country: 'Österreich',
  city: 'Wien',
  postalcode: '1010',
  street: 'Stephansplatz',
  housenumber: '4',
};
export const invalidAddress: AddressEntity = {
  country: 'Osterinseln',
  city: 'Bikinibottom',
  postalcode: '1000',
  street: 'Conchstreet',
  housenumber: '124',
};
export const badRequestAddress: AddressEntity = {
  country: 'USA',
  city: 'Springfield',
  postalcode: '3122',
  street: 'Evergreen Terrace',
  housenumber: '742',
};

export const searchURL =
  'https://nominatim.openstreetmap.org/search/?format=json&addressdetails=1&limit=1&email=example@dodo.com';
export const reverseURL =
  'https://nominatim.openstreetmap.org/reverse/?format=json&addressdetails=1&limit=1&email=example@dodo.com';

export const responseData401 = {
  data: {
    error: {
      code: 'invalid_access_key',
      message: 'You have not supplied a valid API Access Key.',
    },
  },
};
export const statusText401 = 'invalid_access_key';

export function invalidAddressResponseData(): OpenStreetMapEntity {
  return {};
}
export function noCountryResponseData(): OpenStreetMapEntity {
  return {
    lat: noCountryLatitude.toString(),
    lon: noCountryLongitude.toString(),
    address: {
      state: validAddress.city,
      postcode: validAddress.postalcode,
      road: validAddress.street,
    },
  };
}

export function validOpenStreetMapEntity(): OpenStreetMapEntity {
  return {
    lat: validLatitude.toString(),
    lon: validLongitude.toString(),
    address: {
      country: validAddress.country,
      state: validAddress.city,
      postcode: validAddress.postalcode,
      road: validAddress.street,
      house_number: validAddress.housenumber,
    },
  };
}

export function getEventEntityWithoutAddress(): EventEntity {
  return {
    id: '1',
    name: 'Test name',
    description: 'Test description',
    startDateTime: new Date('2020-01-01 00:10:00'),
    endDateTime: new Date('2020-01-01 00:12:00'),
    location: {
      type: GeolocationEnum.POINT,
      coordinates: [validLongitude, validLatitude],
    },
    price: 12.5,
    public: true,
    imageId: '1',
    organizerId: '1',
    category: 'Jazz',
  };
}

export function getEventEntityWithoutLocation(): EventEntity {
  return {
    id: '1',
    name: 'Test name',
    description: 'Test description',
    startDateTime: new Date('2020-01-01 00:10:00'),
    endDateTime: new Date('2020-01-01 00:12:00'),
    price: 12.5,
    public: true,
    imageId: '1',
    organizerId: '1',
    category: 'Jazz',
    address: validAddress,
  };
}

export function getEventEntityWithAddressAndLocation(): EventEntity {
  return {
    name: 'Test name',
    description: 'Test description',
    startDateTime: new Date('2020-01-01 00:10:00'),
    endDateTime: new Date('2020-01-01 00:12:00'),
    location: {
      type: GeolocationEnum.POINT,
      coordinates: [validLongitude, validLatitude],
    },
    price: 12.5,
    public: true,
    imageId: '1',
    organizerId: '1',
    category: 'Jazz',
    address: validAddress,
  };
}
