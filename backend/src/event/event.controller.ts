import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from '../core/dto/createEvent.dto';
import { EventDto } from '../core/dto/event.dto';
import { UpdateEventDto } from '../core/dto/updateEvent.dto';
import { EventMapper } from '../core/mapper/event.mapper';
import { EventEntity } from '../core/entity/event.entity';
import { QueryDto } from '../core/dto/query.dto';
import { User } from '../auth/user.decorator';
import { AuthUser } from '../auth/interfaces';
import { Organizer } from '../auth/role.guard';

@Controller('event')
export class EventController {
  private readonly logger = new Logger(EventController.name);

  constructor(private readonly eventService: EventService) {}

  @Organizer()
  @Post()
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @User() user: AuthUser,
  ): Promise<EventDto> {
    this.logger.log('Create new event: ' + JSON.stringify(createEventDto));
    const eventEntity = EventMapper.mapCreateDtoToEntity(
      createEventDto,
      user.id,
      user.displayName,
    );
    return EventMapper.mapEntityToDto(
      await this.eventService.createEvent(eventEntity),
      user.id,
    );
  }

  @Get('/:id')
  async getEventById(
    @Param() params: any,
    @User() user: AuthUser,
  ): Promise<EventDto> {
    this.logger.log('Get Event with id: ' + params.id);
    const result = await this.eventService.getEventById(params.id);
    return EventMapper.mapEntityToDto(result as Required<EventEntity>, user.id);
  }

  @Get()
  async getEvents(
    @Query() query: QueryDto,
    @User() user: AuthUser,
  ): Promise<EventDto[]> {
    this.logger.log(`Get Events with query: ${JSON.stringify(query)}`);
    const result = await this.eventService.getEventsQueryDto(query);
    this.logger.log('Result: ' + JSON.stringify(result));
    return result.map((item) =>
      EventMapper.mapEntityToDto(item as Required<EventEntity>, user.id),
    );
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEvent(@Param('id') id: string): Promise<void> {
    this.logger.log(`Deleting event with id ${id}`);
    const event = await this.eventService.deleteEvent(id);

    if (!event) {
      this.logger.error(`Event with id ${id} not found`);
      throw new NotFoundException();
    }

    this.logger.log(`Event with id ${id} was deleted`);
  }

  @Post('/:id/participation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async createParticipation(
    @Param('id') eventId: string,
    @User() user: AuthUser,
  ): Promise<void> {
    this.logger.log(
      `Create participation for event ${eventId} by user ${user.id}`,
    );

    await this.eventService.createParticipation(eventId, user);
  }

  @Delete('/:id/participation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteParticipation(
    @Param('id') eventId: string,
    @User() user: AuthUser,
  ): Promise<void> {
    this.logger.log(
      `Delete participation for event ${eventId} by user ${user.id}`,
      eventId,
      user.id,
    );
    await this.eventService.deleteParticipation(eventId, user);
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @User() user: AuthUser,
  ) {
    this.logger.log(`Updating event with id ${id}`);

    if (
      (updateEventDto.startDateTime && !updateEventDto.endDateTime) ||
      (!updateEventDto.startDateTime && updateEventDto.endDateTime)
    ) {
      const requestedEvent = await this.eventService.getEventById(id);

      if (updateEventDto.startDateTime) {
        updateEventDto.endDateTime = requestedEvent.endDateTime;
      } else {
        updateEventDto.startDateTime = requestedEvent.startDateTime;
      }
    }

    return EventMapper.mapEntityToDto(
      await this.eventService.updateEvent(
        id,
        EventMapper.mapDtoToEntityUpdate(updateEventDto),
      ),
      user.id,
    );
  }
}
