import { EventEntity } from '../../src/core/entity/event.entity';
import { LocationEntity } from '../../src/core/entity/location.entity';
import { GeolocationEnum } from '../../src/core/schema/enum/geolocation.enum';
import { validAddress } from '../../test/test_data/openStreetMapApi.testData';
import { CategoryEnum } from '../../src/core/schema/enum/category.enum';
import {
  validEventDocument,
  validObjectId1,
} from '../test_data/event.testData';

export class EventServiceMock {
  createEvent = jest.fn(() => {
    return this.getEventEntity();
  });
  getEventById = jest.fn((id) => {
    if (id === '-1') {
      throw new Error('Test Error');
    }
    const eventEntity = this.getEventEntity();
    eventEntity.id = id;
    return eventEntity;
  });
  getEventsQueryDto = jest.fn(() => {
    const item1 = this.getEventEntity();
    item1.id = '1';
    return [item1, item1, item1];
  });
  getEventsByLocation = jest.fn(() => [
    this.getEventEntity(),
    this.getEventEntity(),
    this.getEventEntity(),
  ]);

  getEventEntity(): EventEntity {
    const locationEntity = new LocationEntity();
    locationEntity.type = GeolocationEnum.POINT;
    locationEntity.coordinates = [-171.23794, 8.54529];

    const eventEntity = new EventEntity();
    eventEntity.name = 'Test name';
    eventEntity.description = 'Test description';
    eventEntity.startDateTime = new Date('2020-01-01 00:10:00');
    eventEntity.endDateTime = new Date('2020-01-01 00:12:00');
    eventEntity.location = locationEntity;
    eventEntity.price = 12.5;
    eventEntity.public = true;
    eventEntity.imageId = '1';
    eventEntity.organizerId = '1';
    eventEntity.category = [CategoryEnum.SALSA, CategoryEnum.ZOUK];
    eventEntity.address = validAddress;
    eventEntity.participants = [];
    return eventEntity;
  }

  deleteEvent = jest.fn((id: string) => {
    if (id === validObjectId1.toString()) {
      const event = validEventDocument;
      event._id = id;
      return Promise.resolve(event);
    } else {
      return Promise.resolve(null);
    }
  });

  createParticipation = jest.fn((id, user) => {
    return Promise.resolve();
  });

  deleteParticipation = jest.fn((id, user) => {
    return Promise.resolve();
  });
}
