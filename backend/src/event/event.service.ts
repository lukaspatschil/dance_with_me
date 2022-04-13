import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventDocument } from '../core/schema/event.schema';

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
}
