import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventDocument, EventSchema } from '../core/schema/event.schema';
import { OpenStreetMapApiModule } from '../openStreetMapApi/openStreetMapApi.module';
import { DatabaseModule } from '../core/database/database.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventDocument.name, schema: EventSchema },
    ]),
    OpenStreetMapApiModule,
    DatabaseModule,
  ],
  providers: [EventService],
  controllers: [EventController],
  exports: [EventService],
})
export class EventModule {}
