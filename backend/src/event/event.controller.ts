import {
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from '../core/dto/createEvent.dto';
import { EventDto } from '../core/dto/event.dto';
import { EventMapper } from '../core/mapper/event.mapper';
import { EventEntity } from '../core/entity/event.entity';
import { QueryDto } from '../core/dto/query.dto';

@Controller('/event')
export class EventController {
  private readonly logger = new Logger(EventController.name);

  constructor(private readonly eventService: EventService) {}

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

  @Get('/:id')
  async getEventById(@Param() params: any): Promise<EventDto> {
    this.logger.log('Get Event with id: ' + params.id);
    let result;
    try {
      result = await this.eventService.getEventById(params.id);
    } catch (error) {
      this.logger.error(error);
      throw new NotFoundException('Can not find Event with id: ' + params.id);
    }
    return EventMapper.mapEntityToDto(result as Required<EventEntity>);
  }

  @Get()
  async getEvents(@Query() query: QueryDto): Promise<EventDto[]> {
    this.logger.log('Get Events with query: {}', JSON.stringify(query));
    const result = await this.eventService.getEventsQueryDto(query);
    this.logger.log('Result: ' + JSON.stringify(result));
    return result.map((item) =>
      EventMapper.mapEntityToDto(item as Required<EventEntity>),
    );
  }
}
