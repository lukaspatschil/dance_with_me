import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { getModelToken } from '@nestjs/mongoose';
import { EventDocument } from '../core/schema/event.schema';
import { Model } from 'mongoose';
import {
  DBErrorId,
  EventModelMock,
  NotFoundErrorId,
  ParticipationAlreadyStored,
  ParticipationNotAlreadyStored,
} from '../../test/stubs/event.model.mock';
import { EventEntity } from '../core/entity/event.entity';
import { GeolocationEnum } from '../core/schema/enum/geolocation.enum';
import { OpenStreetMapApiService } from '../openStreetMapApi/openStreetMapApi.service';
import { OpenStreetMapApiModelMock } from '../../test/stubs/openStreetMapApi.model.mock';
import {
  badRequestAddress,
  getEventEntityWithoutAddress,
  getEventEntityWithoutLocation,
  invalidAddress,
  invalidTokenLatitude,
  invalidTokenLongitude,
  noCountryLatitude,
  noCountryLongitude,
  validAddress,
  validLatitude,
  validLongitude,
} from '../../test/test_data/openStreetMapApi.testData';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { NotFoundError } from '../core/error/notFound.error';
import { LocationEntity } from '../core/entity/location.entity';
import { CategoryEnum } from '../core/schema/enum/category.enum';
import {
  invalidObjectId,
  nonExistingObjectId,
  validEventDocument,
  validObjectId1,
  validObjectId2,
} from '../../test/test_data/event.testData';
import { UserEntity } from '../core/entity/user.entity';
import { RoleEnum } from '../core/schema/enum/role.enum';
import { AlreadyParticipatedConflictError } from '../core/error/alreadyParticipatedConflict.error';
import { NotYetParticipatedConflictError } from '../core/error/notYetParticipatedConflict.error';
import { Neo4jService } from 'nest-neo4j/dist';
import { EventNeo4jServiceMock } from '../../test/stubs/event.neo4j.service.mock';

describe('EventService', () => {
  let sut: EventService;
  let eventDocumentMock: Model<EventDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: OpenStreetMapApiService,
          useClass: OpenStreetMapApiModelMock,
        },
        {
          provide: getModelToken(EventDocument.name),
          useClass: EventModelMock,
        },
        {
          provide: Neo4jService,
          useClass: EventNeo4jServiceMock,
        },
      ],
    }).compile();

    sut = module.get<EventService>(EventService);

    eventDocumentMock = module.get<Model<EventDocument>>(
      getModelToken(EventDocument.name),
    );
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('createEvent', () => {
    it('should call the database and create a new element in the database', async () => {
      // Given
      const eventEntity = getEventEntity();

      // When
      await sut.createEvent(eventEntity);

      // Then
      expect(eventDocumentMock.create).toHaveBeenCalled();
    });

    it('should call the database and throw a DB Error', async () => {
      // Given
      const eventEntity = createEventEntity();
      eventEntity.id = '-2';

      // When
      const result = async () => await sut.createEvent(eventEntity);

      // Then
      await expect(result).rejects.toThrow(InternalServerErrorException);
    });

    it('should call the service and throw a NotFoundException from openStreetMap getAddress ', async () => {
      // Given
      const eventEntity = getEventEntityWithoutAddress();
      if (eventEntity.location) {
        eventEntity.location.coordinates[0] = noCountryLongitude;
        eventEntity.location.coordinates[1] = noCountryLatitude;
      }

      // When
      const result = async () => await sut.createEvent(eventEntity);

      // Then
      await expect(result).rejects.toThrow(new NotFoundException());
    });

    it('should call the service and throw a NotFoundException from openStreetMap getLocation', async () => {
      // Given
      const eventEntity = getEventEntityWithoutLocation();
      if (eventEntity.address) {
        eventEntity.address = invalidAddress;
      }

      // When
      const result = async () => await sut.createEvent(eventEntity);

      // Then
      await expect(result).rejects.toThrow(new NotFoundException());
    });

    it('should call the service and throw a InternalServerErrorException from openStreetMap getAddress', async () => {
      // Given
      const eventEntity = getEventEntityWithoutAddress();
      if (eventEntity.location) {
        eventEntity.location.coordinates[0] = invalidTokenLongitude;
        eventEntity.location.coordinates[1] = invalidTokenLatitude;
      }

      // When
      const result = async () => await sut.createEvent(eventEntity);

      // Then
      await expect(result).rejects.toThrow(new InternalServerErrorException());
    });

    it('should call the service and throw a InternalServerErrorException from openStreetMap getLocation ', async () => {
      // Given
      const eventEntity = getEventEntityWithoutLocation();
      if (eventEntity.address) {
        eventEntity.address = badRequestAddress;
      }

      // When
      const result = async () => await sut.createEvent(eventEntity);

      // Then
      await expect(result).rejects.toThrow(new InternalServerErrorException());
    });
  });

  describe('getEventById', () => {
    it('should call the database and find a element in the database', async () => {
      // Given
      const param = '1';

      // When
      await sut.getEventById(param);

      // Then
      expect(eventDocumentMock.findById).toHaveBeenCalled();
    });

    it('should call getEventById and throw an error', async () => {
      // Given
      const param = '-1';

      // When
      const result = async () => await sut.getEventById(param);

      // Then
      await expect(result).rejects.toThrow(NotFoundError);
    });

    it('should call getEventById and throw an DB Error', async () => {
      // Given
      const param = '-2';

      // When
      const result = async () => await sut.getEventById(param);

      // Then
      await expect(result).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getEvents', () => {
    it('should call the database and find all elements in the database', async () => {
      // Given
      const param = {};

      // When
      await sut.getEventsQueryDto(param);

      // Then
      expect(eventDocumentMock.aggregate).toHaveBeenCalled();
    });

    it('should call the database using the take: 1 parameter and find 1 element in the database', async () => {
      // Given
      const param = { take: 1 };

      // When
      const result = await sut.getEventsQueryDto(param);

      // Then
      expect(result).toEqual([createEventEntity()]);
    });

    it('should call the database using the skip: 2 parameter and find 3 elements in the database', async () => {
      // Given
      const param = { skip: 2 };

      // When
      const result = await sut.getEventsQueryDto(param);

      // Then
      const item1 = createEventEntity();
      item1.id = '3';
      const item2 = createEventEntity();
      item2.id = '4';
      const item3 = createEventEntity();
      item3.id = '5';
      const expectedValue = [item1, item2, item3];

      expect(result).toEqual(expectedValue);
    });

    it('should call the database using the skip: 2 parameter take 2 parameter and should throw an DB Error', async () => {
      // Given
      const param = { skip: 2, take: 2 };

      // When
      const result = async () => await sut.getEventsQueryDto(param);

      // Then
      await expect(result).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getEventsByLocation', () => {
    it('should call the database and find all elements in the database', async () => {
      // Given
      const query = { latitude: 1, longitude: 2 };

      // When
      await sut.getEventsQueryDto(query);

      // Then
      expect(eventDocumentMock.aggregate).toHaveBeenCalled();
    });

    it('should call the database and find all elements in the database in a certain radius', async () => {
      // Given
      const query = { latitude: 1, longitude: 2, radius: 10 };

      // When
      await sut.getEventsQueryDto(query);

      // Then
      expect(eventDocumentMock.aggregate).toHaveBeenCalled();
    });
  });

  describe('deleteEvent', () => {
    it('should call the database', async () => {
      // When
      await sut.deleteEvent(validObjectId1.toString());

      // Then
      expect(eventDocumentMock.findOneAndDelete).toHaveBeenCalledWith({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _id: validObjectId1.toString(),
      });
    });

    it('should filter by organizerId when provided', async () => {
      // When
      await sut.deleteEvent(
        validObjectId1.toString(),
        validObjectId2.toString(),
      );

      // Then
      expect(eventDocumentMock.findOneAndDelete).toHaveBeenCalledWith({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _id: validObjectId1.toString(),
        organizerId: validObjectId2.toString(),
      });
    });

    it('should call the service and delete an event', async () => {
      // Given
      const event = validEventDocument;
      event._id = validObjectId1.toString();

      // When
      const response = await sut.deleteEvent(validObjectId1.toString());

      // Then
      expect(response).toEqual(event);
    });

    it('should return null when deleting a non existing event', async () => {
      //Given
      const eventId = nonExistingObjectId.toString();

      // When
      const response = await sut.deleteEvent(eventId);

      // Then
      expect(response).toBeNull();
    });

    it('should return null when deleting an invalid event id', async () => {
      //Given
      const eventId = invalidObjectId.toString();

      // When
      const response = await sut.deleteEvent(eventId);

      // Then
      expect(response).toBeNull();
    });

    it('should return an internal error response when some error occurs', async () => {
      //Given
      const eventId = '-2';

      // When
      const result = async () => await sut.deleteEvent(eventId);

      // Then
      await expect(result).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('createParticipation', () => {
    it('should call the add participation to an not existing event and throw not found exception', async () => {
      // Given

      const eventId = NotFoundErrorId;
      const user = getDefaultUser();

      // When
      const result = sut.createParticipation(eventId, user);

      // Then
      await expect(result).rejects.toThrow(NotFoundError);
    });

    it('should call the add participation to an event and thrown a random database exception', async () => {
      // Given

      const eventId = DBErrorId;
      const user = getDefaultUser();

      // When
      const result = sut.createParticipation(eventId, user);

      // Then
      await expect(result).rejects.toThrow(new InternalServerErrorException());
    });

    it('should call the add participation to an event where the user already participates and throw a ConflictException', async () => {
      const eventId = ParticipationAlreadyStored;
      const user = getDefaultUser();

      // When
      const result = sut.createParticipation(eventId, user);

      // Then
      await expect(result).rejects.toThrow(AlreadyParticipatedConflictError);
    });

    it('should call the add participation to an event and return nothing', async () => {
      const eventId = ParticipationNotAlreadyStored;
      const user = getDefaultUser();

      // When
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      const result = await sut.createParticipation(eventId, user);

      // Then
      expect(result).toBeUndefined();
    });
  });

  describe('removeParticipation', () => {
    it('should call the delete participation to an not existing event and throw a NotFoundException', async () => {
      // Given

      const eventId = NotFoundErrorId;
      const user = getDefaultUser();

      // When
      const result = sut.deleteParticipation(eventId, user);

      // Then
      await expect(result).rejects.toThrow(NotFoundError);
    });

    it('should call the delete participation to an event and throw a random database exception', async () => {
      // Given

      const eventId = DBErrorId;
      const user = getDefaultUser();

      // When
      const result = sut.deleteParticipation(eventId, user);

      // Then
      await expect(result).rejects.toThrow(new InternalServerErrorException());
    });

    it('should call the delete participation to an event and throw a ConflictException', async () => {
      // Given

      const eventId = ParticipationNotAlreadyStored;
      const user = getDefaultUser();

      // When
      const result = sut.deleteParticipation(eventId, user);

      // Then
      await expect(result).rejects.toThrow(NotYetParticipatedConflictError);
    });
  });

  describe('deleteUsersFromFutureEvents', () => {
    it('should call the database and delete all users from future events', async () => {
      // Given
      const userId = validObjectId1.toString();

      // When
      await sut.deleteUsersFromFutureEvents(userId);

      // Then
      expect(eventDocumentMock.updateMany).toHaveBeenCalled();
    });

    it('should call the database and delete all users from future events', async () => {
      // Given
      const userId = validObjectId1.toString();

      // When
      await sut.deleteUsersFromFutureEvents(userId);
    });
  });

  function getDefaultUser(): UserEntity {
    return {
      id: '1',
      email: 'john.doe@example.com',
      displayName: 'John Doe',
      emailVerified: true,
      role: RoleEnum.ADMIN,
    };
  }

  function createEventEntity(): EventEntity {
    const location = new LocationEntity();
    location.type = GeolocationEnum.POINT;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    location.coordinates = [-171.23794, 8.54529];

    const eventEntity = new EventEntity();
    eventEntity.id = '1';
    eventEntity.name = 'Test name';
    eventEntity.description = 'Test description';
    eventEntity.startDateTime = new Date('2020-01-01 00:10:00');
    eventEntity.endDateTime = new Date('2020-01-01 00:12:00');
    eventEntity.location = location;
    eventEntity.price = 12.5;
    eventEntity.public = true;
    eventEntity.imageId = '1';
    eventEntity.organizerId = '1';
    eventEntity.category = [CategoryEnum.SALSA, CategoryEnum.ZOUK];
    eventEntity.address = validAddress;
    eventEntity.participants = [];

    return eventEntity;
  }

  function getEventEntity(): EventEntity {
    const eventEntity: EventEntity = {
      id: '1',
      name: 'Test name',
      description: 'Test description',
      startDateTime: new Date('2020-01-01 00:10:00'),
      endDateTime: new Date('2020-01-01 00:12:00'),
      location: {
        type: GeolocationEnum.POINT,
        coordinates: [validLongitude, validLatitude],
      },
      price: 12.5,
      public: true,
      imageId: '1',
      organizerId: '1',
      category: [CategoryEnum.SALSA, CategoryEnum.ZOUK],
      address: validAddress,
      participants: [],
    };

    return eventEntity;
  }
});
