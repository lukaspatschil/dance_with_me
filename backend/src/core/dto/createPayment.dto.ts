import { IsNotEmpty } from 'class-validator';

export class CreatePaymentDto {
  constructor(paymentMethodId: string, eventId: string) {
    this.paymentMethodId = paymentMethodId;
    this.eventId = eventId;
  }

  @IsNotEmpty()
  paymentMethodId: string;

  @IsNotEmpty()
  eventId: string;
}
