import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { UserEntity } from '../core/entity/user.entity';
import { EventEntity } from '../core/entity/event.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendInvoice(
    organizer: UserEntity,
    event: EventEntity,
    invoiceId: string,
    total: number,
    currency?: string,
  ) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const eventUrl = `${frontendUrl}/event/${event.id}`;

    this.logger.log(`Sending email to ${organizer.email}`);
    try {
      const mailResponse = await this.mailerService.sendMail({
        to: `${organizer.displayName} <${organizer.email}>`,
        subject: 'Your DanceWithMe invoice',
        template: 'invoice',
        context: {
          name: organizer.displayName,
          eventUrl,
          eventName: event.name,
          eventDate: event.startDateTime.toDateString(),
          invoiceId,
          total,
          currency: currency ?? 'EUR',
        },
        attachments: [
          // For real invoices, the invoice PDF should be attached.
        ],
      });
      this.logger.log(
        `Email ${mailResponse.messageId} sent: ${mailResponse.response}`,
      );
      return mailResponse;
    } catch (error: any) {
      this.logger.error(error.message, error.stack);
    }
  }
}
