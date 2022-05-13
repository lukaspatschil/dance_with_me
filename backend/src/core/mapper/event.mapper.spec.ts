import 'reflect-metadata';
import { EventMapper } from './event.mapper';
import { CreateEventDto } from '../dto/createEvent.dto';
import { EventEntity } from '../entity/event.entity';
import { GeolocationEnum } from '../schema/enum/geolocation.enum';
import { EventDto } from '../dto/event.dto';
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

    it('should return correct entity without address', () => {
      // Given
      const createEventDto = getCreateEventDtoWithoutAddress();

      // When
      const result = EventMapper.mapCreateDtoToEntity(createEventDto);

      // Then
      const expectedEventEntity = getEventEntityWithoutAddress();
      expect(result).toEqual(expectedEventEntity);
    });

    it('should return correct entity without location', () => {
      // Given
      const createEventDto = getCreateEventDtoWithoutLocation();

      // When
      const result = EventMapper.mapCreateDtoToEntity(createEventDto);

      // Then
      const expectedEventEntity = getEventEntityWithoutLocation();
      expect(result).toEqual(expectedEventEntity);
    });
  });

  describe('mapEntityToDto', () => {
    it('should return correct Dto', () => {
      // Given
      const eventEntity = {
        id: '1',
        ...getDefaultEventEntity(),
      };

      // When
      const result = EventMapper.mapEntityToDto(eventEntity);

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
    return {
      id: '1',
      name: 'Test name',
      description: 'Test description',
      date: new Date('2020-01-01'),
      startTime: new Date('2020-01-01 10:00'),
      endTime: new Date('2020-01-01 12:00'),
      location: {
        type: GeolocationEnum.POINT,
        coordinates: [-171.23794, 8.54529],
      },
      price: 12.5,
      isPublic: true,
      imageId: '1',
      organizerId: '1',
      category: 'Jazz',
      address: {
        country: 'Österreich',
        city: 'Wien',
        postalcode: '1010',
        street: 'Stephansplatz',
        housenumber: '4',
      },
    } as EventDocument;
  }

  function getCreateEventDtoWithoutLocation(): CreateEventDto {
    return {
      name: 'Test name',
      description: 'Test description',
      date: new Date('2020-01-01'),
      startTime: new Date('2020-01-01 10:00'),
      endTime: new Date('2020-01-01 12:00'),
      price: 12.5,
      isPublic: true,
      imageId: '1',
      organizerId: '1',
      category: 'Jazz',
      address: {
        country: 'Österreich',
        city: 'Wien',
        postalcode: '1010',
        street: 'Stephansplatz',
        housenumber: '4',
      },
    };
  }

  function getCreateEventDtoWithoutAddress(): CreateEventDto {
    return {
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
  }

  function getDefaultCreateEventDto(): CreateEventDto {
    return {
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
      address: {
        country: 'Österreich',
        city: 'Wien',
        postalcode: '1010',
        street: 'Stephansplatz',
        housenumber: '4',
      },
    };
  }

  function getDefaultEventDto(): EventDto {
    return {
      id: '1',
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
      address: {
        country: 'Österreich',
        city: 'Wien',
        postalcode: '1010',
        street: 'Stephansplatz',
        housenumber: '4',
      },
    };
  }

  function getEventEntityWithoutLocation(): Omit<EventEntity, 'id'> {
    return {
      name: 'Test name',
      description: 'Test description',
      date: new Date('2020-01-01'),
      startTime: new Date('2020-01-01 10:00'),
      endTime: new Date('2020-01-01 12:00'),
      price: 12.5,
      isPublic: true,
      imageId: '1',
      organizerId: '1',
      category: 'Jazz',
      address: {
        country: 'Österreich',
        city: 'Wien',
        postalcode: '1010',
        street: 'Stephansplatz',
        housenumber: '4',
      },
    };
  }

  function getEventEntityWithoutAddress(): Omit<EventEntity, 'id'> {
    return {
      name: 'Test name',
      description: 'Test description',
      date: new Date('2020-01-01'),
      startTime: new Date('2020-01-01 10:00'),
      endTime: new Date('2020-01-01 12:00'),
      location: {
        type: GeolocationEnum.POINT,
        coordinates: [-171.23794, 8.54529],
      },
      price: 12.5,
      isPublic: true,
      imageId: '1',
      organizerId: '1',
      category: 'Jazz',
    };
  }

  function getDefaultEventEntity(): Required<Omit<EventEntity, 'id'>> {
    return {
      name: 'Test name',
      description: 'Test description',
      date: new Date('2020-01-01'),
      startTime: new Date('2020-01-01 10:00'),
      endTime: new Date('2020-01-01 12:00'),
      location: {
        type: GeolocationEnum.POINT,
        coordinates: [-171.23794, 8.54529],
      },
      price: 12.5,
      isPublic: true,
      imageId: '1',
      organizerId: '1',
      category: 'Jazz',
      address: {
        country: 'Österreich',
        city: 'Wien',
        postalcode: '1010',
        street: 'Stephansplatz',
        housenumber: '4',
      },
    };
  }
});
