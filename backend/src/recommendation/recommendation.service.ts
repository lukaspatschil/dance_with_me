import { Injectable, Logger } from '@nestjs/common';
import { QueryDto } from '../core/dto/query.dto';
import { InjectModel } from '@nestjs/mongoose';
import { EventDocument } from '../core/schema/event.schema';
import { Model } from 'mongoose';
import { UserDocument } from '../core/schema/user.schema';
import { EventEntity } from '../core/entity/event.entity';
import { AuthUser } from '../auth/interfaces';
import { Neo4jService } from 'nest-neo4j';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    @InjectModel(EventDocument.name)
    private readonly eventModel: Model<EventDocument>,
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
    private readonly neo4jService: Neo4jService,
  ) {}

  async getRecommendation(
    query: QueryDto,
    user: AuthUser,
  ): Promise<EventEntity[]> {
    this.logger.log(`Get recommendation for user with id: ${user.id}`);
    this.logger.log(`Query: ${JSON.stringify(query)}`);
    /*const take = Number.isFinite(query.take) ? (query.take as number) : 50;
    const skip = Number.isFinite(query.skip) ? (query.skip as number) : 0;
    const radius = Number.isFinite(query.radius) ? query.radius : 100;
    if (!query.latitude) {
      throw new BadRequestException('Latitude is required');
    }
    if (!query.longitude) {
      throw new BadRequestException('Longitude is required');
    }*/

    return Promise.resolve([]);
  }
}
