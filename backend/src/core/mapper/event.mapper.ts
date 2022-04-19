import { EventDocument } from '../schema/event.schema';
import { EventEntity } from '../entity/event.entity';
import { CreateEventDto } from '../dto/createEvent.dto';
import { GeolocationEnum } from '../schema/enum/geolocation.enum';
import { LocationEntity } from '../entity/location.entity';
import { EventDto } from '../dto/event.dto';
import { LocationDto } from '../dto/location.dto';

export class EventMapper {
  static mapDocumentToEntity(event: EventDocument): Required<EventEntity> {
    const newEvent = new EventEntity();
    newEvent.id = event._id;
    newEvent.name = event.name;
    newEvent.description = event.description;
    newEvent.date = event.date;
    newEvent.startTime = event.startTime;
    newEvent.endTime = event.endTime;
    newEvent.location = new LocationEntity();
    newEvent.location.type = event.location.type;
    newEvent.location.coordinates = [
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore currently not using the correct type
      event.location.coordinates[0],
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore currently not using the correct type
      event.location.coordinates[1],
    ];
    newEvent.price = event.price;
    newEvent.isPublic = event.isPublic;
    newEvent.imageId = event.imageId;
    newEvent.organizerId = event.organizerId;
    newEvent.category = event.category;

    return newEvent as Required<EventEntity>;
  }

  static mapCreateDtoToEntity(event: CreateEventDto): EventEntity {
    const newEvent = new EventEntity();
    newEvent.name = event.name;
    newEvent.description = event.description;
    newEvent.date = event.date;
    newEvent.startTime = event.startTime;
    newEvent.endTime = event.endTime;
    newEvent.location = new LocationEntity();
    newEvent.location.type = GeolocationEnum.POINT;
    newEvent.location.coordinates = [
      event.location.longitude,
      event.location.latitude,
    ];
    newEvent.price = event.price;
    newEvent.isPublic = event.isPublic;
    newEvent.imageId = event.imageId;
    newEvent.organizerId = event.organizerId;
    newEvent.category = event.category;

    return newEvent;
  }

  static mapEntityToDto(event: Required<EventEntity>): EventDto {
    const newEvent = new EventDto();
    newEvent.id = event.id;
    newEvent.name = event.name;
    newEvent.description = event.description;
    newEvent.date = event.date;
    newEvent.startTime = event.startTime;
    newEvent.endTime = event.endTime;
    newEvent.location = new LocationDto();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore currently not using the correct type
    newEvent.location.longitude = event.location.coordinates[0];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore currently not using the correct type
    newEvent.location.latitude = event.location.coordinates[1];
    newEvent.price = event.price;
    newEvent.isPublic = event.isPublic;
    newEvent.imageId = event.imageId;
    newEvent.organizerId = event.organizerId;
    newEvent.category = event.category;

    return newEvent;
  }
}
