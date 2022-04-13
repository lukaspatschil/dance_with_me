import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventDocument, EventSchema } from '../core/schema/event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventDocument.name, schema: EventSchema },
    ]),
  ],
  providers: [EventService],
  controllers: [EventController],
})
export class EventModule {}
