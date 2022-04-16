import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { EventDocument } from '../core/schema/event.schema';
import { EventMapper } from '../core/mapper/event.mapper';
import { EventEntity } from '../core/entity/event.entity';
import { GeolocationEnum } from '../core/schema/enum/geolocation.enum';
import { QueryDto } from '../core/dto/query.dto';
import { NotFoundError } from 'rxjs';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(
    @InjectModel(EventDocument.name)
    private readonly eventModel: Model<EventDocument>,
  ) {}

  async getEventsQueryDto(query: QueryDto): Promise<EventEntity[]> {
    const take = Number.isFinite(query.take) ? (query.take as number) : 50;
    const skip = Number.isFinite(query.skip) ? (query.skip as number) : 0;
    const radius = Number.isFinite(query.radius) ? query.radius : 100;
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
          date: 1,
          startTime: 1,
          name: 1,
        },
      };
    } else {
      sort = {
        $sort: {
          date: 1,
          startTime: 1,
          name: 1,
        },
      };
    }

    aggregatePipe.push(sort, skipStage, takeStage);

    let result;
    try {
      const data = await this.eventModel.aggregate(aggregatePipe);
      result = data.map<EventEntity>(EventMapper.mapDocumentToEntity);
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }

    return result;
  }

  async createEvent(eventEntity: EventEntity): Promise<EventEntity> {
    let result;
    try {
      this.logger.log('Create new Event: ' + JSON.stringify(eventEntity));
      const createdEvent = await this.eventModel.create(eventEntity);
      result = EventMapper.mapDocumentToEntity(createdEvent);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }
    return result;
  }

  async getEventById(id: string): Promise<EventEntity> {
    let event;
    try {
      this.logger.log('Get Event: ' + id.toString());
      event = await this.eventModel.findById(id);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(error);
    }

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    return EventMapper.mapDocumentToEntity(event);
  }
}
