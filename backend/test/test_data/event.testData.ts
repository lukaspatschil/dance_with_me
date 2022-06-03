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
  participants: ['Mike', 'Pete'],
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
  participants: ['Mike', 'Pete'],
};

export const validEventDto: EventDto = {
  id: '',
  name: 'Test Event',
  description: 'Test Event Description',
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
  participants: 2,
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

export const validEventUpdateEntityStartDateTime: UpdateEventEntity = {
  name: undefined,
  description: undefined,
  startDateTime: new Date('2023-01-01 11:00:00'),
  endDateTime: undefined,
  location: undefined,
  address: undefined,
  price: undefined,
  public: undefined,
  imageId: undefined,
  organizerId: undefined,
  category: undefined,
};

export const validEventUpdateEntityEndDateTime: UpdateEventEntity = {
  name: undefined,
  description: undefined,
  startDateTime: undefined,
  endDateTime: new Date('2025-01-01 11:00:00'),
  location: undefined,
  address: undefined,
  price: undefined,
  public: undefined,
  imageId: undefined,
  organizerId: undefined,
  category: undefined,
};

// startDateTime after endDateTime
export const invalidEventUpdateEntity1: UpdateEventEntity = {
  name: undefined,
  description: undefined,
  startDateTime: new Date('2023-01-01 18:00:00'),
  endDateTime: new Date('2023-01-01 12:00:00'),
  location: undefined,
  address: undefined,
  price: undefined,
  public: undefined,
  imageId: undefined,
  organizerId: undefined,
  category: undefined,
};

// startDateTime before current date
export const invalidEventUpdateEntity2: UpdateEventEntity = {
  name: undefined,
  description: undefined,
  startDateTime: new Date('2020-01-01 18:00:00'),
  endDateTime: new Date('2023-01-01 12:00:00'),
  location: undefined,
  address: undefined,
  price: undefined,
  public: undefined,
  imageId: undefined,
  organizerId: undefined,
  category: undefined,
};

export const validEventUpdateDto: UpdateEventDto = {
  name: 'Test name2',
  description: 'Test description2',
  price: 21.5,
  imageId: '2',
  organizerId: '2',
  category: [CategoryEnum.MERENGUE],
};

export const validEventUpdateDtoStartDateTime: UpdateEventDto = {
  startDateTime: new Date('2023-01-01 11:00:00'),
};

export const validEventUpdateDtoEndDateTime: UpdateEventDto = {
  endDateTime: new Date('2025-01-01 11:00:00'),
};

export const updateOptions: QueryOptions = { new: true };
