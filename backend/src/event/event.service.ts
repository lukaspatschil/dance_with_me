import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage } from 'mongoose';
import { EventDocument } from '../core/schema/event.schema';
import { EventMapper } from '../core/mapper/event.mapper';
import { EventEntity } from '../core/entity/event.entity';
import { GeolocationEnum } from '../core/schema/enum/geolocation.enum';
import { QueryDto } from '../core/dto/query.dto';
import { NotFoundError } from '../core/error/notFound.error';
import { OpenStreetMapApiService } from '../openStreetMapApi/openStreetMapApi.service';
import { AuthUser } from '../auth/interfaces';
import { NotYetParticipatedConflictError } from '../core/error/notYetParticipatedConflict.error';
import { AlreadyParticipatedConflictError } from '../core/error/alreadyParticipatedConflict.error';
import { Neo4jService } from 'nest-neo4j';
import { InjectMeiliSearch } from 'nestjs-meilisearch';
import { MeiliSearch } from 'meilisearch';

const DEFAULT_TAKE = 50;
const DEFAULT_SKIP = 0;
const DEFAULT_RADIUS = 100;

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  private readonly PARTICIPATES_RELATIONSHIP: string = 'PARTICIPATES';

  constructor(
    @InjectModel(EventDocument.name)
    private readonly eventModel: Model<EventDocument>,
    private readonly positionStackService: OpenStreetMapApiService,
    private readonly neo4jService: Neo4jService,
    @InjectMeiliSearch() private readonly meiliSearch: MeiliSearch,
  ) {}

  async getEventsQueryDto(query: QueryDto): Promise<EventEntity[]> {
    const take = Number.isFinite(query.take)
      ? (query.take as number)
      : DEFAULT_TAKE;
    const skip = Number.isFinite(query.skip)
      ? (query.skip as number)
      : DEFAULT_SKIP;
    const radius = Number.isFinite(query.radius)
      ? query.radius
      : DEFAULT_RADIUS;
    const startDate: Date = query.startDate ? query.startDate : new Date();
    const dateQuery: PipelineStage.Match = {
      $match: {
        $and: [
          {
            startDateTime: {
              $gte: startDate,
            },
          },
        ],
      },
    };
    const skipStage: PipelineStage.Skip = { $skip: skip };
    const takeStage: PipelineStage.Limit = { $limit: take };

    const aggregatePipe: PipelineStage[] = [];
    let sort: PipelineStage.Sort;
    if (Number.isFinite(query.longitude) && Number.isFinite(query.latitude)) {
      const filter: PipelineStage.GeoNear = {
        $geoNear: {
          near: {
            type: GeolocationEnum.POINT,
            coordinates: [query.longitude as number, query.latitude as number],
          },
          distanceField: 'distance',
          spherical: true,
          maxDistance: radius,
        },
      };

      // add geo, must be first stage
      aggregatePipe.push(filter);

      sort = {
        $sort: {
          distance: 1,
          startDateTime: 1,
          name: 1,
        },
      };
    } else {
      sort = {
        $sort: {
          startDateTime: 1,
          name: 1,
        },
      };
    }

    aggregatePipe.push(dateQuery, sort, skipStage, takeStage);

    let result;
    try {
      const data = await this.eventModel.aggregate(aggregatePipe).exec();
      result = data.map<EventEntity>(EventMapper.mapDocumentToEntity);
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }

    return result;
  }

  async createEvent(eventEntity: EventEntity): Promise<Required<EventEntity>> {
    this.logger.log('Create new event: ' + JSON.stringify(eventEntity));
    let result;
    if (eventEntity.location?.coordinates.length === 2) {
      eventEntity.address = await this.positionStackService.getAddress(
        ...eventEntity.location.coordinates,
      );
    } else if (eventEntity.address) {
      eventEntity.location = await this.positionStackService.getLocationPoint(
        eventEntity.address,
      );
    } else {
      throw new BadRequestException();
    }
    try {
      const createdEvent = await this.eventModel.create(eventEntity);
      result = EventMapper.mapDocumentToEntity(createdEvent);

      const neo4jResult = await this.neo4jService.write(
        `CREATE (e:Event {id: '${result.id}'})`,
      );
      this.logger.log(neo4jResult);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }

    if (result.public) {
      this.logger.log('Add event to meili search: ' + JSON.stringify(result));
      await this.meiliSearch
        .index('events')
        .addDocuments([result])
        .catch(() => {
          this.logger.error('Error while adding event to meili search');
        });
    }

    return result;
  }

  async getEventById(id: string): Promise<EventEntity> {
    let event;
    try {
      this.logger.log('Get Event: ' + id.toString());
      event = await this.eventModel.findById(id).exec();
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }

    if (!event) {
      throw NotFoundError;
    }

    return EventMapper.mapDocumentToEntity(event);
  }

  async deleteEvent(id: string, organizerId?: string) {
    this.logger.log(`Deleting event with id ${id}`);

    let result;
    try {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const filter: FilterQuery<EventDocument> = { _id: id };
      if (organizerId) filter.organizerId = organizerId;
      result = await this.eventModel.findOneAndDelete(filter).exec();
      await this.neo4jService.write(`MATCH (e:Event {id: '${id}'}) DELETE e;`);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
    return result;
  }

  async deleteParticipation(eventId: string, user: AuthUser): Promise<void> {
    this.logger.log(
      `Delete participation for event ${eventId} by user ${user.id}`,
    );

    let result;
    try {
      result = await this.eventModel
        .findByIdAndUpdate(eventId, {
          $pull: { participants: user.id },
        })
        .exec();

      const neo4jResult = await this.neo4jService.write(
        `MATCH (u:User {id: '${user.id}'})-[r:${this.PARTICIPATES_RELATIONSHIP}]->(e:Event {id: '${eventId}'}) DELETE r;`,
      );
      this.logger.log(neo4jResult);
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }

    if (result == null) {
      this.logger.error(`Event with id ${eventId} not found`);
      throw NotFoundError;
    }

    const event = EventMapper.mapDocumentToEntity(result);

    if (!event.participants.includes(user.id)) {
      this.logger.error(`User with id ${user.id} did not participate`);
      throw NotYetParticipatedConflictError;
    }
  }

  async createParticipation(eventId: string, user: AuthUser) {
    this.logger.log(
      `Create participation for event ${eventId} by user ${user.id}`,
    );

    let result;

    try {
      result = await this.eventModel
        .findByIdAndUpdate(eventId, {
          $addToSet: { participants: user.id },
        })
        .exec();

      const neo4jResult = await this.neo4jService.write(
        `Match (e:Event {id: '${eventId}'}), (u:User {id: '${user.id}'}) CREATE (u)-[p:${this.PARTICIPATES_RELATIONSHIP}]->(e)`,
      );
      this.logger.log(neo4jResult);
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }

    if (result == null) {
      this.logger.error(`Event with id ${eventId} not found`);
      throw NotFoundError;
    }

    const event = EventMapper.mapDocumentToEntity(result);

    if (event.participants.includes(user.id)) {
      this.logger.error(`User with id ${user.id} already participates`);
      throw AlreadyParticipatedConflictError;
    }
  }

  async deleteUsersFromFutureEvents(userId: string): Promise<void> {
    this.logger.log(`Delete participation for future events by user ${userId}`);

    try {
      await this.eventModel
        .updateMany(
          { participants: userId, startDateTime: { $gte: new Date() } },
          { $pull: { participants: userId } },
        )
        .exec();
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
    return Promise.resolve();
  }
}
