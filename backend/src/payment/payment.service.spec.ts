import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { EventService } from '../event/event.service';
import { StripeMock } from '../../test/stubs/stripe.mock';
import { EventServiceMock } from '../../test/stubs/event.service.mock';
import { PaymentRequiredError } from '../core/error/paymentRequired.error';
import { InternalServerErrorException } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { UserService } from '../user/user.service';
import { UserServiceMock } from '../../test/stubs/user.service.mock';

describe('PaymentService', () => {
  let sut: PaymentService;
  let eventService: EventService;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: EventService,
          useClass: EventServiceMock,
        },
        {
          provide: 'StripeToken',
          useValue: StripeMock,
        },
        {
          provide: UserService,
          useClass: UserServiceMock,
        },
        {
          provide: EmailService,
          useValue: {
            sendInvoice: jest.fn(),
          },
        },
      ],
    }).compile();

    sut = module.get<PaymentService>(PaymentService);
    eventService = module.get<EventService>(EventService);
    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('createPayment', () => {
    it('should pass correct payment intent parameters to stripe', async () => {
      // Given
      const userId = 'mockUserId';
      const eventId = 'mockEventId';
      const paymentMethod = 'pm_card_visa';

      // When
      await sut.createPayment(userId, paymentMethod, eventId);

      // Then
      expect(StripeMock.paymentIntents.create).toHaveBeenCalledWith({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        payment_method: paymentMethod,
        amount: 1000,
        currency: 'eur',
        confirm: true,
        metadata: {
          eventId: eventId,
        },
      });
    });

    it('should mark event as paid if payment was successful', async () => {
      // Given
      const userId = 'mockUserId';
      const eventId = 'mockEventId';
      const paymentMethod = 'pm_card_visa';

      // When
      await sut.createPayment(userId, paymentMethod, eventId);

      // Then
      expect(eventService.markEventAsPaid).toHaveBeenCalledWith(eventId);
    });

    it('should send invoice if payment was successful', async () => {
      // Given
      const userId = 'mockUserId';
      const eventId = 'mockEventId';
      const paymentMethod = 'pm_card_visa';

      // When
      await sut.createPayment(userId, paymentMethod, eventId);

      // Then
      expect(emailService.sendInvoice).toHaveBeenCalled();
    });

    it('should throw 402 error if card was declined', async () => {
      // Given
      const userId = 'mockUserId';
      const eventId = 'mockEventId';
      const paymentMethod = 'declined_card';

      // When
      const result = sut.createPayment(userId, paymentMethod, eventId);

      // Then
      await expect(result).rejects.toThrow(
        PaymentRequiredError(
          'card_declined',
          'There are insufficient funds on your card.',
        ),
      );
    });

    it('should throw internal server error if intent status is invalid', async () => {
      // Given
      const userId = 'mockUserId';
      const eventId = 'mockEventId';
      const paymentMethod = 'pm_card_mastercard';

      // When
      const result = sut.createPayment(userId, paymentMethod, eventId);

      // Then
      await expect(result).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw internal server error if stripe error is unknown', async () => {
      // Given
      const userId = 'mockUserId';
      const eventId = 'mockEventId';
      const paymentMethod = 'something_else';

      // When
      const result = sut.createPayment(userId, paymentMethod, eventId);

      // Then
      await expect(result).rejects.toThrow(InternalServerErrorException);
    });
  });
});
