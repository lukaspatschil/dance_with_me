import { EventEntity } from '../../src/core/entity/event.entity';
import { LocationEntity } from '../../src/core/entity/location.entity';
import { GeolocationEnum } from '../../src/core/schema/enum/geolocation.enum';
import { validAddress } from '../../test/test_data/openStreetMapApi.testData';

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
    eventEntity.date = new Date('2020-01-01');
    eventEntity.startTime = new Date('2020-01-01 00:10:00');
    eventEntity.endTime = new Date('2020-01-01 00:12:00');
    eventEntity.location = locationEntity;
    eventEntity.price = 12.5;
    eventEntity.isPublic = true;
    eventEntity.imageId = '1';
    eventEntity.organizerId = '1';
    eventEntity.category = 'Jazz';
    eventEntity.address = validAddress;
    return eventEntity;
  }
}
