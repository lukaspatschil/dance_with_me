import 'reflect-metadata';
import { EventMapper } from './event.mapper';
import { CreateEventDto } from '../dto/createEvent.dto';
import { EventEntity } from '../entity/event.entity';
import { GeolocationEnum } from '../schema/enum/geolocation.enum';
import { EventDto } from '../dto/event.dto';
import { EventDocument } from '../schema/event.schema';
import { CategoryEnum } from '../schema/enum/category.enum';

/* eslint @typescript-eslint/no-magic-numbers: 0 */

describe('EventMapper', () => {
  describe('mapCreateDtoToEntity', () => {
    it('should return correct entity', () => {
      // Given
      const createEventDto = getDefaultCreateEventDto();

      // When
      const result = EventMapper.mapCreateDtoToEntity(
        createEventDto,
        getDefaultOrganizerId(),
        getDefaultOrganizerName(),
      );

      // Then
      const expectedEventEntity = getDefaultEventEntity();
      expect(result).toEqual(expectedEventEntity);
    });

    it('should return correct entity without address', () => {
      // Given
      const createEventDto = getCreateEventDtoWithoutAddress();

      // When
      const result = EventMapper.mapCreateDtoToEntity(
        createEventDto,
        getDefaultOrganizerId(),
        getDefaultOrganizerName(),
      );

      // Then
      const expectedEventEntity = getEventEntityWithoutAddress();
      expect(result).toEqual(expectedEventEntity);
    });

    it('should return correct entity without location', () => {
      // Given
      const createEventDto = getCreateEventDtoWithoutLocation();

      // When
      const result = EventMapper.mapCreateDtoToEntity(
        createEventDto,
        getDefaultOrganizerId(),
        getDefaultOrganizerName(),
      );

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

      const userId = '1';

      // When
      const result = EventMapper.mapEntityToDto(eventEntity, userId);

      // Then
      expect(result).toEqual(getDefaultEventDto());
    });

    it('should return correct Dto with positive user participation', () => {
      // Given
      const userId = '1';
      const defaultEventEntity = getDefaultEventEntity();
      defaultEventEntity.participants = [userId];

      const eventEntity = {
        id: '1',
        ...defaultEventEntity,
      };

      const expectedValue = getDefaultEventDto();
      expectedValue.userParticipates = true;
      expectedValue.participants = 1;

      // When
      const result = EventMapper.mapEntityToDto(eventEntity, userId);

      // Then
      expect(result).toEqual(expectedValue);
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
      startDateTime: new Date('2020-01-01 10:00'),
      endDateTime: new Date('2020-01-01 12:00'),
      location: {
        type: GeolocationEnum.POINT,
        coordinates: [-171.23794, 8.54529],
      },
      price: 12.5,
      public: true,
      imageId: '1',
      organizerId: '1',
      organizerName: 'Smitty Werben',
      category: [CategoryEnum.SALSA, CategoryEnum.ZOUK],
      address: {
        country: 'Österreich',
        city: 'Wien',
        postalcode: '1010',
        street: 'Stephansplatz',
        housenumber: '4',
      },
      participants: [] as string[],
      paid: false,
    } as EventDocument;
  }

  function getCreateEventDtoWithoutLocation(): CreateEventDto {
    return {
      name: 'Test name',
      description: 'Test description',
      startDateTime: new Date('2020-01-01 10:00'),
      endDateTime: new Date('2020-01-01 12:00'),
      price: 12.5,
      public: true,
      imageId: '1',
      category: [CategoryEnum.SALSA, CategoryEnum.ZOUK],
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
      startDateTime: new Date('2020-01-01 10:00'),
      endDateTime: new Date('2020-01-01 12:00'),
      location: {
        longitude: -171.23794,
        latitude: 8.54529,
      },
      price: 12.5,
      public: true,
      imageId: '1',
      category: [CategoryEnum.SALSA, CategoryEnum.ZOUK],
    };
  }

  function getDefaultCreateEventDto(): CreateEventDto {
    return {
      name: 'Test name',
      description: 'Test description',
      startDateTime: new Date('2020-01-01 10:00'),
      endDateTime: new Date('2020-01-01 12:00'),
      location: {
        longitude: -171.23794,
        latitude: 8.54529,
      },
      price: 12.5,
      public: true,
      imageId: '1',
      category: [CategoryEnum.SALSA, CategoryEnum.ZOUK],
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
      startDateTime: new Date('2020-01-01 10:00'),
      endDateTime: new Date('2020-01-01 12:00'),
      location: {
        longitude: -171.23794,
        latitude: 8.54529,
      },
      price: 12.5,
      public: true,
      imageId: '1',
      organizerId: '1',
      organizerName: 'Smitty Werben',
      category: [CategoryEnum.SALSA, CategoryEnum.ZOUK],
      address: {
        country: 'Österreich',
        city: 'Wien',
        postalcode: '1010',
        street: 'Stephansplatz',
        housenumber: '4',
      },
      participants: 0,
      userParticipates: false,
    };
  }

  function getEventEntityWithoutLocation(): Omit<EventEntity, 'id'> {
    return {
      name: 'Test name',
      description: 'Test description',
      startDateTime: new Date('2020-01-01 10:00'),
      endDateTime: new Date('2020-01-01 12:00'),
      price: 12.5,
      public: true,
      imageId: '1',
      organizerId: '1',
      organizerName: 'Smitty Werben',
      category: [CategoryEnum.SALSA, CategoryEnum.ZOUK],
      address: {
        country: 'Österreich',
        city: 'Wien',
        postalcode: '1010',
        street: 'Stephansplatz',
        housenumber: '4',
      },
      participants: [],
      paid: false,
    };
  }

  function getEventEntityWithoutAddress(): Omit<EventEntity, 'id'> {
    return {
      name: 'Test name',
      description: 'Test description',
      startDateTime: new Date('2020-01-01 10:00'),
      endDateTime: new Date('2020-01-01 12:00'),
      location: {
        type: GeolocationEnum.POINT,
        coordinates: [-171.23794, 8.54529],
      },
      price: 12.5,
      public: true,
      imageId: '1',
      organizerId: '1',
      organizerName: 'Smitty Werben',
      category: [CategoryEnum.SALSA, CategoryEnum.ZOUK],
      participants: [],
      paid: false,
    };
  }

  function getDefaultEventEntity(): Required<Omit<EventEntity, 'id'>> {
    return {
      name: 'Test name',
      description: 'Test description',
      startDateTime: new Date('2020-01-01 10:00'),
      endDateTime: new Date('2020-01-01 12:00'),
      location: {
        type: GeolocationEnum.POINT,
        coordinates: [-171.23794, 8.54529],
      },
      price: 12.5,
      public: true,
      imageId: '1',
      organizerId: '1',
      organizerName: 'Smitty Werben',
      category: [CategoryEnum.SALSA, CategoryEnum.ZOUK],
      address: {
        country: 'Österreich',
        city: 'Wien',
        postalcode: '1010',
        street: 'Stephansplatz',
        housenumber: '4',
      },
      participants: [],
      paid: false,
    };
  }

  function getDefaultOrganizerId(): string {
    return '1';
  }

  function getDefaultOrganizerName(): string {
    return 'Smitty Werben';
  }
});
