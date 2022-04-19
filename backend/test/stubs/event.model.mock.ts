import { GeolocationEnum } from '../../src/core/schema/enum/geolocation.enum';
import { EventEntity } from '../../src/core/entity/event.entity';

export class EventModelMock {
  create = jest.fn((eventEntity: EventEntity) => {
    const eventDocument = {
      _id: '1',
      name: eventEntity.name,
      description: eventEntity.description,
      date: eventEntity.date,
      location: {
        type: GeolocationEnum.POINT,
        coordinates: [
          eventEntity.location.coordinates[0],
          eventEntity.location.coordinates[1],
        ],
      },
      price: eventEntity.price,
      organizerId: eventEntity.organizerId,
      imageId: eventEntity.imageId,
      startTime: eventEntity.startTime,
      endTime: eventEntity.endTime,
      category: eventEntity.category,
      isPublic: eventEntity.isPublic,
    };
    return Promise.resolve(eventDocument);
  });
}
