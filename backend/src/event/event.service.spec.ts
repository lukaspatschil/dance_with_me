import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { getModelToken } from '@nestjs/mongoose';
import { EventDocument } from '../core/schema/event.schema';
import { Model } from 'mongoose';
import { EventModelMock } from '../../test/stubs/event.model.mock';
import { EventEntity } from '../core/entity/event.entity';
import { GeolocationEnum } from '../core/schema/enum/geolocation.enum';
import { LocationEntity } from '../core/entity/location.entity';

describe('EventService', () => {
  let sut: EventService;
  let eventDocument: Model<EventDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
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

  describe('getEvents', () => {
    it('should return "Hello World"', () => {
      // When
      const result = sut.getEvents();

      // Then
      expect(result).toEqual('Hello Event');
    });
  });

  describe('createEvent', () => {
    it('should call the database', async () => {
      // Given
      const eventEntity = getEventEntity();

      // When
      await sut.createEvent(eventEntity);

      // Then
      expect(eventDocument.create).toHaveBeenCalled();
    });

    it('should call the database and create a new element in the database', async () => {
      // Given
      const eventEntity = getEventEntity();

      // When
      const data = await sut.createEvent(eventEntity);

      // Then
      expect(data).toEqual(getEventEntity());
    });
  });

  function getEventEntity(): EventEntity {
    const location = new LocationEntity();
    location.type = GeolocationEnum.POINT;
    location.coordinates = [-171.23794, 8.54529];

    const eventEntity: EventEntity = {
      id: '1',
      name: 'Test name',
      description: 'Test description',
      date: new Date('2020-01-01'),
      startTime: new Date('2020-01-01 00:10:00'),
      endTime: new Date('2020-01-01 00:12:00'),
      location,
      price: 12.5,
      isPublic: true,
      imageId: '1',
      organizerId: '1',
      category: 'Jazz',
    };

    return eventEntity;
  }
});
