import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { MailerService } from '@nestjs-modules/mailer';
import { validUserEntity } from '../../test/test_data/user.testData';
import { validEventEntity } from '../../test/test_data/event.testData';
import { ConfigService } from '@nestjs/config';

describe('EmailService', () => {
  let sut: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              return {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                FRONTEND_URL: 'mock-frontend-url',
              }[key];
            }),
          },
        },
      ],
    }).compile();

    sut = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('sendInvoice', () => {
    it('should log error if sending fails', async () => {
      // Given
      const errorMessage = 'test-error';
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      jest.spyOn(sut.mailerService, 'sendMail').mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const loggerSpy = jest.spyOn(sut.logger, 'error');

      // When
      await sut.sendInvoice(
        validUserEntity,
        validEventEntity(),
        'test-invoice-id',
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        10,
      );

      // Then
      expect(loggerSpy).toHaveBeenCalledWith(
        errorMessage,
        expect.stringContaining(EmailService.name),
      );
    });

    it('should send email using mailerService', async () => {
      // Given
      const sendMailSpy = jest
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .spyOn(sut.mailerService, 'sendMail')
        .mockImplementationOnce(() => {
          return Promise.resolve();
        });

      // When
      const eventId = 'test-event-id';
      const invoiceId = 'test-invoice-id';
      const total = 10;
      await sut.sendInvoice(
        validUserEntity,
        { ...validEventEntity(), id: eventId },
        invoiceId,
        total,
      );

      // Then
      expect(sendMailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: expect.stringContaining(validUserEntity.email),
          subject: 'Your DanceWithMe invoice',
          template: 'invoice',
          context: expect.objectContaining({
            name: validUserEntity.displayName,
            eventUrl: expect.stringContaining(
              `mock-frontend-url/event/${eventId}`,
            ),
            eventName: validEventEntity().name,
            eventDate: validEventEntity().startDateTime.toDateString(),
            invoiceId,
            total,
            currency: 'EUR',
          }),
        }),
      );
    });

    it('should return message object', async () => {
      // Given
      const messageInfo = { messageId: 'test-message-id' };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      jest.spyOn(sut.mailerService, 'sendMail').mockImplementationOnce(() => {
        return Promise.resolve(messageInfo);
      });

      // When
      const res = await sut.sendInvoice(
        validUserEntity,
        validEventEntity(),
        'test-invoice-id',
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        10,
      );

      // Then
      expect(res).toEqual(messageInfo);
    });
  });
});
