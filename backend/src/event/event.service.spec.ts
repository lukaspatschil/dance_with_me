import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { getModelToken } from '@nestjs/mongoose';
import { EventDocument } from '../core/schema/event.schema';
import { Model } from 'mongoose';
import { EventModelMock } from '../../test/stubs/event.model.mock';
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
import { NotFoundError } from 'rxjs';
import { LocationEntity } from '../core/entity//location.entity';

describe('EventService', () => {
  let sut: EventService;
  let eventDocument: Model<EventDocument>;

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
      ],
    }).compile();

    sut = module.get<EventService>(EventService);

    eventDocument = module.get<Model<EventDocument>>(
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
      expect(eventDocument.create).toHaveBeenCalled();
    });

    it('should call the database and throw a DB Error', async () => {
      // Given
      const eventEntity = createEventEntity();
      eventEntity.id = '-2';

      // When
      const result = async () => await sut.createEvent(eventEntity);

      // Then
      expect(result).rejects.toThrow(InternalServerErrorException);
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
      expect(eventDocument.findById).toHaveBeenCalled();
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
      expect(eventDocument.aggregate).toHaveBeenCalled();
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
      expect(eventDocument.aggregate).toHaveBeenCalled();
    });

    it('should call the database and find all elements in the database in a certain radius', async () => {
      // Given
      const query = { latitude: 1, longitude: 2, radius: 10 };

      // When
      await sut.getEventsQueryDto(query);

      // Then
      expect(eventDocument.aggregate).toHaveBeenCalled();
    });
  });
  function createEventEntity(): EventEntity {
    const location = new LocationEntity();
    location.type = GeolocationEnum.POINT;
    location.coordinates = [-171.23794, 8.54529];

    const eventEntity = new EventEntity();
    eventEntity.id = '1';
    eventEntity.name = 'Test name';
    eventEntity.description = 'Test description';
    eventEntity.date = new Date('2020-01-01');
    eventEntity.startTime = new Date('2020-01-01 00:10:00');
    eventEntity.endTime = new Date('2020-01-01 00:12:00');
    eventEntity.location = location;
    eventEntity.price = 12.5;
    eventEntity.isPublic = true;
    eventEntity.imageId = '1';
    eventEntity.organizerId = '1';
    eventEntity.category = 'Jazz';
    eventEntity.address = validAddress;

    return eventEntity;
  }

  function getEventEntity(): EventEntity {
    const eventEntity: EventEntity = {
      id: '1',
      name: 'Test name',
      description: 'Test description',
      date: new Date('2020-01-01'),
      startTime: new Date('2020-01-01 00:10:00'),
      endTime: new Date('2020-01-01 00:12:00'),
      location: {
        type: GeolocationEnum.POINT,
        coordinates: [validLongitude, validLatitude],
      },
      price: 12.5,
      isPublic: true,
      imageId: '1',
      organizerId: '1',
      category: 'Jazz',
      address: validAddress,
    };

    return eventEntity;
  }
});
