import mongoose, { QueryOptions } from 'mongoose';
import { EventEntity } from '../../src/core/entity/event.entity';
import { UpdateEventEntity } from '../../src/core/entity/updateEvent.entity';
import { EventDto } from '../../src/core/dto/event.dto';
import { UpdateEventDto } from '../../src/core/dto/updateEvent.dto';
import { GeolocationEnum } from '../../src/core/schema/enum/geolocation.enum';
import { CategoryEnum } from '../../src/core/schema/enum/category.enum';
import { validAddress } from './openStreetMapApi.testData';

/* eslint @typescript-eslint/naming-convention: 0 */

export const validObjectId1 = new mongoose.Types.ObjectId();
export const validObjectId2 = new mongoose.Types.ObjectId();
export const validObjectId3 = new mongoose.Types.ObjectId();
export const nonExistingObjectId = new mongoose.Types.ObjectId();
export const invalidObjectId = 'xxxxxxxxxxxxxxxxxxx';

export const validEventDocument = {
  _id: '',
  name: 'Test Event',
  description: 'Test Event Description',
  startDateTime: new Date('2023-01-01 10:00:00'),
  endDateTime: new Date('2023-01-01 12:00:00'),
  location: {
    type: GeolocationEnum.POINT,
    coordinates: [8.54529, -171.23794],
  },
  address: validAddress,
  price: 12.5,
  public: true,
  imageId: '1',
  organizerId: '1',
  category: [CategoryEnum.SALSA, CategoryEnum.ZOUK],
};

export const validEventEntity: EventEntity = {
  id: '',
  name: 'Test Event',
  description: 'Test Event Description',
  startDateTime: new Date('2023-01-01 10:00:00'),
  endDateTime: new Date('2023-01-01 12:00:00'),
  location: {
    type: GeolocationEnum.POINT,
    coordinates: [8.54529, -171.23794],
  },
  address: {
    addition: undefined,
    city: 'Wien',
    country: 'Österreich',
    housenumber: '4',
    postalcode: '1010',
    street: 'Stephansplatz',
  },
  price: 12.5,
  public: true,
  imageId: '1',
  organizerId: '1',
  category: [CategoryEnum.SALSA, CategoryEnum.ZOUK],
  participants: [],
};

export const validEventDto: EventDto = {
  id: '',
  name: 'Test name',
  description: 'Test description',
  startDateTime: new Date('2023-01-01 10:00'),
  endDateTime: new Date('2023-01-01 12:00'),
  location: {
    longitude: 8.54529,
    latitude: -171.23794,
  },
  price: 12.5,
  public: true,
  imageId: '1',
  organizerId: '1',
  category: [CategoryEnum.SALSA, CategoryEnum.ZOUK],
  participants: 0,
  address: {
    country: 'Österreich',
    city: 'Wien',
    postalcode: '1010',
    street: 'Stephansplatz',
    housenumber: '4',
  },
  userParticipates: false,
};

// Update Objects
export const validEventUpdateEntity: UpdateEventEntity = {
  id: undefined,
  name: 'Test name2',
  description: 'Test description2',
  startDateTime: undefined,
  endDateTime: undefined,
  location: undefined,
  address: undefined,
  price: 21.5,
  public: undefined,
  imageId: '2',
  organizerId: '2',
  category: [CategoryEnum.MERENGUE],
};

export const validEventUpdateDto: UpdateEventDto = {
  name: 'Test name2',
  description: 'Test description2',
  price: 21.5,
  imageId: '2',
  organizerId: '2',
  category: [CategoryEnum.MERENGUE],
};

export const updateOptions: QueryOptions = { new: true };
