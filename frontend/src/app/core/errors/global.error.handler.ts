import { ErrorHandler, Injectable } from '@angular/core';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private readonly logger: LoggerService) {}

  handleError(error: unknown): void {
    this.logger.error(error);
  }
}
