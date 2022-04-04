import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

describe('PaymentController', () => {
  let sut: PaymentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PaymentService,
          useValue: {},
        },
      ],
      controllers: [PaymentController],
    }).compile();

    sut = module.get<PaymentController>(PaymentController);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('getHello', () => {
    it('should return `payment service is live`', () => {
      // When
      const response = sut.getHello();

      // Then
      expect(response).toEqual('payment service is live');
    });
  });
});
