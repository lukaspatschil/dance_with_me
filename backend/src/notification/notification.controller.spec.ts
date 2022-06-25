import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationServiceMock } from '../../test/stubs/notification.service.mock';

describe('NotificationController', () => {
  let sut: NotificationController;

  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        { provide: NotificationService, useClass: NotificationServiceMock },
      ],
    }).compile();

    sut = module.get<NotificationController>(NotificationController);
    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('getIndex', () => {
    it('should call the service', () => {
      // When
      sut.getIndex();

      // Then
      expect(service.getIndex).toHaveBeenCalled();
    });
  });

  describe('sendNotification', () => {
    it('should call the service', () => {
      // When
      sut.sendNotification();

      // Then
      expect(service.sendNotification).toHaveBeenCalled();
    });
  });

  describe('postSubscribe', () => {
    it('should call the service', () => {
      // Given
      const request = {} as Request;

      // When
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      sut.postSubscribe(request);

      // Then
      expect(service.addSubscription).toHaveBeenCalledWith(request);
    });
  });
});
