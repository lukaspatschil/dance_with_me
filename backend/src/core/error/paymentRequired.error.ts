import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';

export const PaymentRequiredError = (error: string, message: string) =>
  new HttpException({ error, message }, HttpStatus.PAYMENT_REQUIRED);
