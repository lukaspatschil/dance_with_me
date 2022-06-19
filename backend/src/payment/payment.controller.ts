import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Organizer } from '../auth/role.guard';
import { CreatePaymentDto } from '../core/dto/createPayment.dto';
import { User } from '../auth/user.decorator';
import { AuthUser } from '../auth/interfaces';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Organizer()
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async createPayment(
    @Body() { paymentMethodId, eventId }: CreatePaymentDto,
    @User() user: AuthUser,
  ) {
    await this.paymentService.createPayment(user.id, paymentMethodId, eventId);
  }
}
