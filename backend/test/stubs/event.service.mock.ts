import { EventEntity } from '../../src/core/entity/event.entity';
import { UpdateEventEntity } from '../../src/core/entity/updateEvent.entity';
import { LocationEntity } from '../../src/core/entity/location.entity';
import { GeolocationEnum } from '../../src/core/schema/enum/geolocation.enum';
import { validAddress } from '../test_data/openStreetMapApi.testData';
import { CategoryEnum } from '../../src/core/schema/enum/category.enum';
import {
  validEventDocument,
  validEventEntity,
  validObjectId1,
} from '../test_data/event.testData';

export const USER_PARTICIPATES_IN_EVENT_USER_ID = '999';
export const USER_PARTICIPATES_IN_EVENT_EVENT_ID = '998';

export class EventServiceMock {
  createEvent = jest.fn(() => {
    return this.getEventEntity();
  });

  getEventById = jest.fn((id) => {
    if (id === '-1') {
      throw new Error('Test Error');
    }

    const eventEntity = this.getEventEntity();
    if (id === USER_PARTICIPATES_IN_EVENT_EVENT_ID) {
      eventEntity.id = USER_PARTICIPATES_IN_EVENT_EVENT_ID;
      eventEntity.participants = [USER_PARTICIPATES_IN_EVENT_USER_ID];
    } else {
      eventEntity.id = id;
    }
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
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    locationEntity.coordinates = [-171.23794, 8.54529];

    const eventEntity = new EventEntity();
    eventEntity.name = 'Test name';
    eventEntity.description = 'Test description';
    eventEntity.startDateTime = new Date('2023-01-01 10:00:00');
    eventEntity.endDateTime = new Date('2023-01-01 12:00:00');
    eventEntity.location = locationEntity;
    eventEntity.price = 12.5;
    eventEntity.public = true;
    eventEntity.imageId = '1';
    eventEntity.organizerId = '1';
    eventEntity.organizerName = 'Smitty Werben';
    eventEntity.category = [CategoryEnum.SALSA, CategoryEnum.ZOUK];
    eventEntity.address = validAddress;
    eventEntity.participants = [];
    return eventEntity;
  }

  deleteEvent = jest.fn((id: string) => {
    if (id === validObjectId1.toString()) {
      return Promise.resolve(validEventDocument);
    } else {
      return Promise.resolve(null);
    }
  });

  updateEvent = jest.fn((id: string, eventEntity: UpdateEventEntity) => {
    if (id === validObjectId1.toString() || id === '-2') {
      const nonNullFields = Object.fromEntries(
        Object.entries(eventEntity).filter(([, value]) => value),
      );
      const event = { ...validEventEntity(), ...nonNullFields, id };
      return Promise.resolve(event);
    } else {
      return Promise.resolve(null);
    }
  });

  createParticipation = jest.fn(() => {
    return Promise.resolve();
  });

  deleteParticipation = jest.fn(() => {
    return Promise.resolve();
  });

  markEventAsPaid = jest.fn(() => {
    return Promise.resolve();
  });
}
