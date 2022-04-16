import mongoose from 'mongoose';
import { EventEntity } from '../../src/core/entity/event.entity';
import { EventDto } from '../../src/core/dto/event.dto';
import { GeolocationEnum } from '../../src/core/schema/enum/geolocation.enum';

export const validObjectId1 = new mongoose.Types.ObjectId();
export const validObjectId2 = new mongoose.Types.ObjectId();
export const validObjectId3 = new mongoose.Types.ObjectId();
export const nonExistingObjectId = new mongoose.Types.ObjectId();
export const invalidObjectId = 'xxxxxxxxxxxxxxxxxxx';

export const validEventDocument = {
  _id: '',
  name: 'Test Event',
  description: 'Test Event Description',
  date: new Date('2023-01-01 00:00:00'),
  startTime: new Date('2023-01-01 10:00:00'),
  endTime: new Date('2023-01-01 12:00:00'),
  location: {
    type: GeolocationEnum.POINT,
    coordinates: [0, 0],
  },
  price: 12.5,
  isPublic: true,
  imageId: '1',
  organizerId: '1',
  category: 'Jazz',
};

export const validEventEntity: EventEntity = {
  id: '',
  name: 'Test Event',
  description: 'Test Event Description',
  date: new Date('2023-01-01 00:00:00'),
  startTime: new Date('2023-01-01 10:00:00'),
  endTime: new Date('2023-01-01 12:00:00'),
  location: {
    type: GeolocationEnum.POINT,
    coordinates: [0, 0],
  },
  price: 12.5,
  isPublic: true,
  imageId: '1',
  organizerId: '1',
  category: 'Jazz',
};

export const validEventDto: EventDto = {
  id: '',
  name: 'Test name',
  description: 'Test description',
  date: new Date('2023-01-01 00:00'),
  startTime: new Date('2023-01-01 10:00'),
  endTime: new Date('2023-01-01 12:00'),
  location: {
    longitude: -171.23794,
    latitude: 8.54529,
  },
  price: 12.5,
  isPublic: true,
  imageId: '1',
  organizerId: '1',
  category: 'Jazz',
};
