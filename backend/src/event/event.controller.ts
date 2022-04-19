import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from '../core/dto/createEvent.dto';
import { EventDto } from '../core/dto/event.dto';
import { EventMapper } from '../core/mapper/event.mapper';
import { EventEntity } from '../core/entity/event.entity';

@Controller('event')
export class EventController {
  private readonly logger = new Logger(EventController.name);

  constructor(private readonly eventService: EventService) {}

  @Get()
  getEvents(): string {
    return 'Hello Event';
  }

  @Post()
  async createEvent(@Body() createEventDto: CreateEventDto): Promise<EventDto> {
    this.logger.log('Create new event: ' + JSON.stringify(createEventDto));
    const eventEntity = EventMapper.mapCreateDtoToEntity(createEventDto);
    return EventMapper.mapEntityToDto(
      (await this.eventService.createEvent(
        eventEntity,
      )) as Required<EventEntity>,
    );
  }
}
