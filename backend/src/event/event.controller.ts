import { Controller, Get, Logger } from '@nestjs/common';

@Controller('event')
export class EventController {
  private readonly logger = new Logger(EventController.name);

  @Get()
  getEvents(): string {
    return 'Hello Event';
  }
}
