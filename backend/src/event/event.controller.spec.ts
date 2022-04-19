import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { CreateEventDto } from '../core/dto/createEvent.dto';
import { EventDto } from '../core/dto/event.dto';
import { LocationDto } from '../core/dto/location.dto';
import { EventEntity } from '../core/entity/event.entity';
import { LocationEntity } from '../core/entity/location.entity';
import { GeolocationEnum } from '../core/schema/enum/geolocation.enum';

describe('EventController', () => {
  let sut: EventController;
  let eventService: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: EventService,
          useValue: {
            createEvent: jest.fn(() => {
              return getEventEntity();
            }),
          },
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

  describe('getEvents', () => {
    it('should return `Hello Event`', () => {
      // When
      const response = sut.getEvents();

      // Then
      expect(response).toEqual('Hello Event');
    });
  });

  describe('createEvent', () => {
    it('should call createEvent', () => {
      // Given
      const createEventDto = getCreateEventDTO();
      //When
      sut.createEvent(createEventDto);

      //Then
      expect(eventService.createEvent).toHaveBeenCalledWith(getEventEntity());
    });

    it('should return correct EventEntity', async () => {
      // Given
      const createEventDto = getCreateEventDTO();
      //When
      const data = await sut.createEvent(createEventDto);
      data.id = '1';

      const expectedData = getEventDTO();
      //Then
      expect(data).toEqual(expectedData);
    });
  });

  function getCreateEventDTO() {
    const location = new LocationDto();
    location.latitude = 8.54529;
    location.longitude = -171.23794;

    const createEventDto: CreateEventDto = {
      name: 'Test name',
      description: 'Test description',
      date: new Date('2020-01-01'),
      startTime: new Date('2020-01-01 00:10:00'),
      endTime: new Date('2020-01-01 00:12:00'),
      location: location,
      price: 12.5,
      isPublic: true,
      imageId: '1',
      organizerId: '1',
      category: 'Jazz',
    };
    return createEventDto;
  }

  function getEventDTO(): EventDto {
    const location = new LocationDto();
    location.longitude = -171.23794;
    location.latitude = 8.54529;

    const eventDto = new EventDto();
    eventDto.id = '1';
    eventDto.name = 'Test name';
    eventDto.description = 'Test description';
    eventDto.date = new Date('2020-01-01');
    eventDto.startTime = new Date('2020-01-01 00:10:00');
    eventDto.endTime = new Date('2020-01-01 00:12:00');
    eventDto.location = location;
    eventDto.price = 12.5;
    eventDto.isPublic = true;
    eventDto.imageId = '1';
    eventDto.organizerId = '1';
    eventDto.category = 'Jazz';

    return eventDto;
  }

  function getEventEntity(): EventEntity {
    const locationEntity = new LocationEntity();
    locationEntity.type = GeolocationEnum.POINT;
    locationEntity.coordinates = [-171.23794, 8.54529];

    const eventEntity = new EventEntity();
    eventEntity.name = 'Test name';
    eventEntity.description = 'Test description';
    eventEntity.date = new Date('2020-01-01');
    eventEntity.startTime = new Date('2020-01-01 00:10:00');
    eventEntity.endTime = new Date('2020-01-01 00:12:00');
    eventEntity.location = locationEntity;
    eventEntity.price = 12.5;
    eventEntity.isPublic = true;
    eventEntity.imageId = '1';
    eventEntity.organizerId = '1';
    eventEntity.category = 'Jazz';

    return eventEntity;
  }
});
