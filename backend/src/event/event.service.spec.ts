import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { getConnectionToken } from '@nestjs/mongoose';

describe('EventService', () => {
  let sut: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: getConnectionToken('Database'),
          useValue: {},
        },
      ],
    }).compile();

    sut = module.get<EventService>(EventService);
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
});
