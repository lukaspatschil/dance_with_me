import { Controller, Get, Logger } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  getHello(): string {
    return 'payment service is live';
  }
}
