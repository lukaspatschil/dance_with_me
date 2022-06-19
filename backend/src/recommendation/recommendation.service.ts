import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventDocument } from '../core/schema/event.schema';
import mongoose, { Model, PipelineStage } from 'mongoose';
import { EventEntity } from '../core/entity/event.entity';
import { AuthUser } from '../auth/interfaces';
import { Neo4jService } from 'nest-neo4j';
import { EventMapper } from '../core/mapper/event.mapper';
import { GeolocationEnum } from '../core/schema/enum/geolocation.enum';
import { RecommendationQueryDto } from '../core/dto/recommendationQuery.dto';

const DEFAULT_TAKE = 50;
const DEFAULT_SKIP = 0;

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    @InjectModel(EventDocument.name)
    private readonly eventModel: Model<EventDocument>,
    private readonly neo4jService: Neo4jService,
  ) {}

  private readonly matchingQueryPart1: string =
    "MATCH (u1:User)-[:PARTICIPATES]->(e:Event)<-[:PARTICIPATES]-(u2:User) WHERE u1 <> u2 AND u1.id = '";

  private readonly matchingQueryPart2: string =
    "'" +
    'WITH u1, u2, COUNT(DISTINCT e) as intersection ' +
    'MATCH (u:User)-[:PARTICIPATES]->(e:Event) ' +
    'WHERE u in [u1, u2] ' +
    'WITH u1, u2, intersection, COUNT(DISTINCT e) as uni ' +
    'WITH u1, u2, intersection, uni, (intersection * 1.0 / uni) as jaccard_index ' +
    'MATCH (u2)-[:PARTICIPATES]->(e:Event) ' +
    'WHERE  NOT (u1)-[:PARTICIPATES]->(e:Event)<-[:PARTICIPATES]-(u2) ' +
    'WITH u1, u2, intersection, uni, jaccard_index, collect(distinct e.id) as possibleEvents ' +
    'ORDER BY jaccard_index DESC, u2.id ' +
    'RETURN u1.id as user, u2.id as neighborUserId, intersection, uni, jaccard_index, possibleEvents';

  async getRecommendation(
    query: RecommendationQueryDto,
    user: AuthUser,
  ): Promise<EventEntity[]> {
    this.logger.log(`Get recommendation for user with id: ${user.id}`);
    this.logger.log(`Query: ${JSON.stringify(query)}`);
    const take = Number.isFinite(query.take)
      ? (query.take as number)
      : DEFAULT_TAKE;
    const skip = Number.isFinite(query.skip)
      ? (query.skip as number)
      : DEFAULT_SKIP;

    const geoFilter: PipelineStage.GeoNear = {
      $geoNear: {
        near: {
          type: GeolocationEnum.POINT,
          coordinates: [query.longitude as number, query.latitude as number],
        },
        distanceField: 'distance',
        spherical: true,
        maxDistance: query.radius as number,
      },
    };

    const skipStage: PipelineStage.Skip = { $skip: skip };
    const takeStage: PipelineStage.Limit = { $limit: take };

    try {
      // returns the events which are recommended for the user
      const result = await this.neo4jService.write(
        this.getMatchingQuery(user.id),
      );

      this.logger.log(result);

      const ids: mongoose.Types.ObjectId[] = [];
      const referenceArray: string[] = [];

      result.records.forEach((record) => {
        const possibleEvents = record.get('possibleEvents');
        possibleEvents.forEach((eventId: string) => {
          if (!referenceArray.includes(eventId)) {
            referenceArray.push(eventId);
            const objectId = new mongoose.Types.ObjectId(eventId);
            ids.push(objectId);
          }
        });
      });

      //query mongo containing the location

      const matchQuery: PipelineStage.Match = {
        $match: {
          $and: [
            {
              startDateTime: {
                $gte: new Date(),
              },
              // eslint-disable-next-line @typescript-eslint/naming-convention
              _id: {
                $in: ids,
              },
              paid: true,
            },
          ],
        },
      };

      // add geo, must be first stage
      const aggregatePipe: PipelineStage[] = [
        geoFilter,
        matchQuery,
        skipStage,
        takeStage,
      ];

      const data = await this.eventModel.aggregate(aggregatePipe);
      const events = data.map<EventEntity>(EventMapper.mapDocumentToEntity);
      return this.sortEvents(events, ids);
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
  }

  private sortEvents(
    events: EventEntity[],
    referenceArray: mongoose.Types.ObjectId[],
  ) {
    const sortedEvents: EventEntity[] = [];

    referenceArray.forEach((tempId) => {
      const nextEvent = events.find((event) => {
        return event.id?.toString() === tempId.toString();
      });

      if (nextEvent) {
        sortedEvents.push(nextEvent);
      }
    });

    return sortedEvents;
  }

  private getMatchingQuery(userId: string): string {
    return this.matchingQueryPart1 + userId + this.matchingQueryPart2;
  }
}
