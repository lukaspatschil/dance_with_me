import 'reflect-metadata';
import { EventMapper } from './event.mapper';
import { CreateEventDto } from '../dto/createEvent.dto';
import { EventEntity } from '../entity/event.entity';
import { GeolocationEnum } from '../schema/enum/geolocation.enum';
import { LocationEntity } from '../entity/location.entity';
import { EventDto } from '../dto/event.dto';
import { LocationDto } from '../dto/location.dto';
import { EventDocument } from '../schema/event.schema';

describe('EventMapper', () => {
  describe('mapCreateDtoToEntity', () => {
    it('should return correct entity', () => {
      // Given
      const createEventDto = getDefaultCreateEventDto();

      // When
      const result = EventMapper.mapCreateDtoToEntity(createEventDto);

      // Then
      const expectedEventEntity = getDefaultEventEntity();
      expect(result).toEqual(expectedEventEntity);
    });
  });

  describe('mapEntityToDto', () => {
    it('should return correct Dto', () => {
      // Given
      const eventEntity = getDefaultEventEntity();
      eventEntity.id = '1';

      // When
      const result = EventMapper.mapEntityToDto(
        eventEntity as Required<EventEntity>,
      );

      // Then
      expect(result).toEqual(getDefaultEventDto());
    });
  });

  describe('mapDocumentToEntity', () => {
    it('should return correct Entity', () => {
      // Given
      const eventEntity = getDefaultEventDocument();
      eventEntity.id = '1';

      // When
      const result = EventMapper.mapDocumentToEntity(eventEntity);

      // Then
      expect(result).toEqual(getDefaultEventEntity());
    });
  });

  function getDefaultEventDocument(): EventDocument {
    const location = {
      type: GeolocationEnum.POINT,
      coordinates: [-171.23794, 8.54529],
    };

    const eventDocument = {
      id: '1',
      name: 'Test name',
      description: 'Test description',
      date: new Date('2020-01-01'),
      startTime: new Date('2020-01-01 10:00'),
      endTime: new Date('2020-01-01 12:00'),
      location,
      price: 12.5,
      isPublic: true,
      imageId: '1',
      organizerId: '1',
      category: 'Jazz',
    };
    return eventDocument as EventDocument;
  }

  function getDefaultCreateEventDto(): CreateEventDto {
    const createEventDto: CreateEventDto = {
      name: 'Test name',
      description: 'Test description',
      date: new Date('2020-01-01'),
      startTime: new Date('2020-01-01 10:00'),
      endTime: new Date('2020-01-01 12:00'),
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
    return createEventDto;
  }

  function getDefaultEventDto(): EventDto {
    const location = new LocationDto();
    location.longitude = -171.23794;
    location.latitude = 8.54529;

    const eventDto: EventDto = {
      id: '1',
      name: 'Test name',
      description: 'Test description',
      date: new Date('2020-01-01'),
      startTime: new Date('2020-01-01 10:00'),
      endTime: new Date('2020-01-01 12:00'),
      location: location,
      price: 12.5,
      isPublic: true,
      imageId: '1',
      organizerId: '1',
      category: 'Jazz',
    };
    return eventDto;
  }

  function getDefaultEventEntity(): EventEntity {
    const location = new LocationEntity();
    location.type = GeolocationEnum.POINT;
    location.coordinates = [-171.23794, 8.54529];

    const eventDto: EventEntity = {
      name: 'Test name',
      description: 'Test description',
      date: new Date('2020-01-01'),
      startTime: new Date('2020-01-01 10:00'),
      endTime: new Date('2020-01-01 12:00'),
      location,
      price: 12.5,
      isPublic: true,
      imageId: '1',
      organizerId: '1',
      category: 'Jazz',
    };
    return eventDto;
  }
});
