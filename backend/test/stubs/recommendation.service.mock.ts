import { RecommendationQueryDto } from '../../src/core/dto/recommendationQuery.dto';
import { EventEntity } from '../../src/core/entity/event.entity';
import { CategoryEnum } from '../../src/core/schema/enum/category.enum';
import { LocationEntity } from '../../src/core/entity/location.entity';
import { AddressEntity } from '../../src/core/entity/address.entity';

export class RecommendationServiceMock {
  getRecommendation = jest.fn((query: RecommendationQueryDto) => {
    if (query.latitude === 2) {
      return [this.getDefaultEventEntity()];
    }

    return [];
  });

  getDefaultEventEntity(): EventEntity {
    const eventEntity = new EventEntity();

    eventEntity.id = '1';
    eventEntity.name = 'Event 1';
    eventEntity.description = 'Event 1 description';
    eventEntity.startDateTime = new Date('2023-01-01 10:00');
    eventEntity.endDateTime = new Date('2023-01-01 12:00');
    eventEntity.address = new AddressEntity(
      'Country 1',
      'City 1',
      'Postal Code 1',
      'Street 1',
    );
    eventEntity.address.housenumber = 'House Number 1';
    eventEntity.address.addition = 'Addition 1';

    eventEntity.location = new LocationEntity();
    eventEntity.location.coordinates = [1, 1];
    eventEntity.price = 10;
    eventEntity.public = true;
    eventEntity.organizerId = '1';
    eventEntity.organizerName = 'Smitty Werben';
    eventEntity.category = [CategoryEnum.SALSA];
    eventEntity.participants = ['1234'];

    return eventEntity;
  }
}
