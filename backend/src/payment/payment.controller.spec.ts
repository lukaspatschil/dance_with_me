import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { RoleEnum } from '../core/schema/enum/role.enum';

describe('PaymentController', () => {
  let sut: PaymentController;
  let paymentService: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PaymentService,
          useValue: {
            createPayment: jest.fn(),
          },
        },
      ],
      controllers: [PaymentController],
    }).compile();

    sut = module.get<PaymentController>(PaymentController);
    paymentService = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('createPayment', () => {
    it('should call service with eventId and paymentMethodId', async () => {
      // Given
      const createPaymentDto = {
        paymentMethodId: 'mockPaymentMethodId',
        eventId: 'mockEventId',
      };
      const user = {
        id: 'mockUserId',
        displayName: 'Oscar Organized',
        role: RoleEnum.ORGANISER,
      };

      // When
      await sut.createPayment(createPaymentDto, user);

      // Then
      expect(paymentService.createPayment).toHaveBeenCalledWith(
        user.id,
        createPaymentDto.paymentMethodId,
        createPaymentDto.eventId,
      );
    });
  });
});
