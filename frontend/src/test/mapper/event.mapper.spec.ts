import { EventMapper } from '../../app/mapper/event.mapper';
import { Category } from '../../app/enums/category.enum';
import { EventEntity } from '../../app/entities/event.entity';
import { EventDto } from '../../app/dto/event.dto';
import { AddressEntity } from '../../app/entities/address.entity';
import { LocationEntity } from '../../app/entities/location.entity';


describe('EventMapper', () => {
  describe('mapDtoToEntity', () => {
    it('should return correct entity', () => {
      // Given
      const eventResponseDto: EventDto = {
        id: '1',
        name: 'name',
        description: 'description',
        location: {
          latitude: 40.000,
          longitude: 31.000

        },
        address: {
          country: 'country',
          street: 'street',
          city: 'city',
          housenumber: '10',
          postalcode: '1020',
          addition: 'addition'
        },
        price: 1,
        public: true,
        startDateTime: new Date('2022-04-24T10:00').toISOString(),
        endDateTime: new Date('2022-04-24T12:00').toISOString(),
        category: [Category.SALSA],
        userParticipates: false,
        organizerName: 'organizerName',
        organizerId: '1'
      };

      // When
      const result = EventMapper.mapEventDtoToEntity(eventResponseDto);

      // Then
      expect(result).toEqual(createExpectedEventEntity());
    });

    it('should return null on incorrect entities', () => {
      // Given
      const incorrectEntity: EventDto = {};

      // When
      const result = EventMapper.mapEventDtoToEntity(incorrectEntity);

      // Then
      expect(result).toBeNull();
    });

    it('should return null on undefined address', () => {
      // Given
      const eventResponseDto: EventDto = {
        id: '1',
        name: 'name',
        description: 'description',
        price: 1,
        public: true,
        startDateTime: new Date('2022-04-24T10:00').toISOString(),
        endDateTime: new Date('2022-04-24T12:00').toISOString(),
        category: [Category.SALSA],
        userParticipates: true,
        address: {
          country: 'country',
          street: 'street',
          city: 'city',
          housenumber: '10',
          postalcode: '1020',
          addition: 'addition'
        },
        organizerName: 'organizerName'
      };

      // When
      const result = EventMapper.mapEventDtoToEntity(eventResponseDto);

      // Then
      expect(result).toBeNull();
    });

    it('should return null on undefined location', () => {
      // Given
      const eventResponseDto: EventDto = {
        id: '1',
        name: 'name',
        description: 'description',
        price: 1,
        public: true,
        startDateTime: new Date('2022-04-24T10:00').toISOString(),
        endDateTime: new Date('2022-04-24T12:00').toISOString(),
        category: [Category.SALSA],
        userParticipates: true,
        organizerName: 'organizerName'
      };

      // When
      const result = EventMapper.mapEventDtoToEntity(eventResponseDto);

      // Then
      expect(result).toBeNull();
    });
  });


  function createExpectedEventEntity(): EventEntity{
    const addressEntity = new AddressEntity('country', 'city', '1020', 'street', '10', 'addition');
    const longitude = 31.000;
    const latitude = 40.000;
    const locationEntity = new LocationEntity(longitude, latitude);
    const event = new EventEntity(
      '1',
      'name',
      'description',
      locationEntity,
      addressEntity,
      1,
      true,
      new Date('2022-04-24T10:00'),
      new Date('2022-04-24T12:00'),
      [Category.SALSA],
      'organizerName'
    );
    event.organizerId = '1';
    return event;
  }
});
