import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectStripe } from 'nestjs-stripe';
import { EventService } from '../event/event.service';
import Stripe from 'stripe';
import { PaymentRequiredError } from '../core/error/paymentRequired.error';
import { EmailService } from '../email/email.service';
import { UserService } from '../user/user.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectStripe() private readonly stripeClient: Stripe,
    private readonly eventService: EventService,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
  ) {}

  public async createPayment(
    userId: string,
    paymentMethodId: string,
    eventId: string,
  ) {
    this.logger.log(
      `Creating payment for event ${eventId} with payment method ${paymentMethodId}`,
    );
    try {
      const intent = await this.stripeClient.paymentIntents.create({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        payment_method: paymentMethodId,
        amount: 1000,
        currency: 'eur',
        confirm: true,
        metadata: {
          eventId,
        },
      });

      if (intent.status === 'succeeded') {
        const event = await this.eventService.markEventAsPaid(eventId);
        const user = await this.userService.getUser(userId);
        await this.emailService.sendInvoice(
          user,
          event,
          intent.id,
          intent.amount,
          intent.currency,
        );
        return;
      } else {
        this.logger.error(intent);
      }
    } catch (error: any) {
      this.logger.error(error);
      if (error.type === 'StripeCardError') {
        throw PaymentRequiredError(error.code, error.message);
      }
      throw new InternalServerErrorException({
        error: 'unknown_payment_error',
      });
    }
    throw new InternalServerErrorException({
      error: 'invalid_payment_intent_status',
    });
  }
}
