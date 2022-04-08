import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';

describe('EventController', () => {
  let sut: EventController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
    }).compile();

    sut = module.get<EventController>(EventController);
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
});
