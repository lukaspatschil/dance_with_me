import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';

jest.mock('web-push');

describe('NotificationService', () => {
  let sut: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationService],
    }).compile();

    sut = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('getIndex', () => {
    it('should return the index string', () => {
      // When
      const response = sut.getIndex();

      // Then
      expect(response).toBe('Welcome to Dance with me web-push');
    });
  });

  describe('addSubscription', () => {
    it('should psuh to the subscribtions', () => {
      // Given
      const request = { body: 'testbody' } as unknown as Request;

      // When
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const result = sut.addSubscription(request);

      // Then
      expect(result).toBe('added');
    });
  });

  describe('sendNotification', () => {
    it('should return the return text', () => {
      // When
      const result = sut.sendNotification();

      // Then
      expect(result).toBe('test');
    });
  });
});
