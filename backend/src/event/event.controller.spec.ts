import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { CreateEventDto } from '../core/dto/createEvent.dto';
import { EventEntity } from '../core/entity/event.entity';
import { GeolocationEnum } from '../core/schema/enum/geolocation.enum';
import { EventDto } from '../core/dto/event.dto';
import {
  EventServiceMock,
  USER_PARTICIPATES_IN_EVENT_EVENT_ID,
  USER_PARTICIPATES_IN_EVENT_USER_ID,
} from '../../test/stubs/event.service.mock';
import { NotFoundException } from '@nestjs/common';
import { UserEntity } from '../core/entity/user.entity';
import { RoleEnum } from '../core/schema/enum/role.enum';
import { CategoryEnum } from '../core/schema/enum/category.enum';
import {
  nonExistingObjectId,
  validObjectId1,
} from '../../test/test_data/event.testData';

describe('EventController', () => {
  let sut: EventController;
  let eventService: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: EventService,
          useClass: EventServiceMock,
        },
      ],
      controllers: [EventController],
    }).compile();

    sut = module.get<EventController>(EventController);
    eventService = module.get<EventService>(EventService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('getEventById', () => {
    it('should call getEventById and return event', async () => {
      // Given
      const params = { id: '1' };

      // When
      await sut.getEventById(params, getDefaultUser());

      // Then
      expect(eventService.getEventById).toHaveBeenCalled();
    });

    it('should call getEventById and throw an NotFoundError', async () => {
      // Given
      const params = { id: '-1' };

      // When
      const result = async () =>
        await sut.getEventById(params, getDefaultUser());

      // Then
      await expect(result).rejects.toThrow(NotFoundException);
    });

    it('should get an single event where the user participates and return a correct value for the userParticipates field', async () => {
      // Given
      const params = { id: USER_PARTICIPATES_IN_EVENT_EVENT_ID };
      const user = getDefaultUser();
      user.id = USER_PARTICIPATES_IN_EVENT_USER_ID;

      // When
      const data = await sut.getEventById(params, user);

      const item1 = getEventDTO();
      item1.id = USER_PARTICIPATES_IN_EVENT_EVENT_ID;
      item1.userParticipates = true;
      item1.participants = 1;

      // Then
      expect(data).toEqual(item1);
    });
  });

  describe('getEvents', () => {
    it('should call getEvents`', async () => {
      // Given
      const query = { take: 1, skip: 0 };

      // When
      await sut.getEvents(query, getDefaultUser());

      // Then
      expect(eventService.getEventsQueryDto).toBeCalledWith(query);
    });

    it('should call getEventsByLocation`', async () => {
      // Given
      const query = { take: 1, skip: 0, longitude: 1, latitude: 2 };
      // When
      await sut.getEvents(query, getDefaultUser());

      // Then
      expect(eventService.getEventsQueryDto).toBeCalledWith(query);
    });

    it('should return a array of eventDtos', async () => {
      // Given
      const query = {};
      // When
      const data = await sut.getEvents(query, getDefaultUser());

      const item1 = getEventDTO();
      item1.id = '1';

      // Then
      expect(data).toEqual([item1, item1, item1]);
    });
  });

  describe('createEvent', () => {
    it('should call createEvent', async () => {
      // Given
      const createEventDto = getCreateEventDTO();
      //When
      await sut.createEvent(createEventDto, getDefaultUser());

      //Then
      expect(eventService.createEvent).toHaveBeenCalledWith(getEventEntity());
    });

    it('should return correct EventEntity', async () => {
      // Given
      const createEventDto = getCreateEventDTO();
      //When
      const data = await sut.createEvent(createEventDto, getDefaultUser());
      data.id = '1';

      const expectedData = getEventDTO();
      //Then
      expect(data).toEqual(expectedData);
    });
  });

  describe('deleteEvent', () => {
    it('should call deleteEvent', async () => {
      // Given
      const idDto = validObjectId1.toString();

      //When
      await sut.deleteEvent(idDto);

      //Then
      expect(eventService.deleteEvent).toHaveBeenCalledWith(
        validObjectId1.toString(),
      );
    });

    it('should call deleteEvent and throw a NotFoundError', async () => {
      // When
      const result = async () => {
        await sut.deleteEvent(nonExistingObjectId.toString());
      };

      //Then
      await expect(result).rejects.toThrow(new NotFoundException());
    });
  });

  describe('createParticipation', () => {
    it('should call the add participation to an event', async () => {
      // When
      await sut.createParticipation('1', getDefaultUser());

      // Then
      expect(eventService.createParticipation).toHaveBeenCalled();
    });

    it('should call the add participation to an event with the correct parameters', async () => {
      // Given
      const eventId = '1';
      const user = getDefaultUser();

      // When
      await sut.createParticipation(eventId, user);

      // Then
      expect(eventService.createParticipation).toHaveBeenCalledWith(
        eventId,
        user,
      );
    });
  });

  describe('removeParticipation', () => {
    it('should call the delete participation to an event', async () => {
      // When
      await sut.deleteParticipation('1', getDefaultUser());

      // Then
      expect(eventService.deleteParticipation).toHaveBeenCalled();
    });

    it('should call the delete participation to an event with the correct parameters', async () => {
      // Given
      const eventId = '1';
      const user = getDefaultUser();

      // When
      await sut.deleteParticipation(eventId, user);

      // Then
      expect(eventService.deleteParticipation).toHaveBeenCalledWith(
        eventId,
        user,
      );
    });
  });

  function getCreateEventDTO(): CreateEventDto {
    return {
      name: 'Test name',
      description: 'Test description',
      startDateTime: new Date('2020-01-01 00:10:00'),
      endDateTime: new Date('2020-01-01 00:12:00'),
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

  function getEventDTO(): EventDto {
    return {
      id: '1',
      name: 'Test name',
      description: 'Test description',
      startDateTime: new Date('2020-01-01 00:10:00'),
      endDateTime: new Date('2020-01-01 00:12:00'),
      location: {
        longitude: -171.23794,
        latitude: 8.54529,
      },
      price: 12.5,
      public: true,
      imageId: '1',
      organizerId: '1',
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

  function getEventEntity(): EventEntity {
    return {
      name: 'Test name',
      description: 'Test description',
      startDateTime: new Date('2020-01-01 00:10:00'),
      endDateTime: new Date('2020-01-01 00:12:00'),
      location: {
        type: GeolocationEnum.POINT,
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        coordinates: [-171.23794, 8.54529],
      },
      price: 12.5,
      public: true,
      imageId: '1',
      organizerId: '1',
      category: [CategoryEnum.SALSA, CategoryEnum.ZOUK],
      address: {
        country: 'Österreich',
        city: 'Wien',
        postalcode: '1010',
        street: 'Stephansplatz',
        housenumber: '4',
      },
      participants: [],
    };
  }

  function getDefaultUser(): UserEntity {
    return {
      id: '1',
      email: 'john.doe@example.com',
      displayName: 'John Doe',
      emailVerified: true,
      role: RoleEnum.ADMIN,
    };
  }
});
