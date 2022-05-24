import { Module } from '@nestjs/common';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDocument, UserSchema } from '../core/schema/user.schema';
import { EventDocument, EventSchema } from '../core/schema/event.schema';
import { DatabaseModule } from '../core/database/database.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
      { name: EventDocument.name, schema: EventSchema },
    ]),
    DatabaseModule,
  ],
  providers: [RecommendationService],
  controllers: [RecommendationController],
  exports: [RecommendationService],
})
export class RecommendationModule {}
