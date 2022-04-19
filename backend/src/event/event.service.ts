import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventDocument } from '../core/schema/event.schema';
import { EventMapper } from '../core/mapper/event.mapper';
import { EventEntity } from '../core/entity/event.entity';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    @InjectModel(EventDocument.name)
    private readonly eventModel: Model<EventDocument>,
  ) {}

  getEvents(): string {
    return 'Hello Event';
  }

  async createEvent(eventEntity: EventEntity): Promise<EventEntity> {
    this.logger.log('Create new event: ' + JSON.stringify(eventEntity));
    const createdEvent = await this.eventModel.create(eventEntity);
    const result = EventMapper.mapDocumentToEntity(createdEvent);
    return result;
  }
}
