import { EventDocument } from '../schema/event.schema';
import { EventEntity } from '../entity/event.entity';
import { CreateEventDto } from '../dto/createEvent.dto';
import { GeolocationEnum } from '../schema/enum/geolocation.enum';
import { LocationEntity } from '../entity/location.entity';
import { EventDto } from '../dto/event.dto';
import { LocationDto } from '../dto/location.dto';
import { AddressEntity } from '../entity/address.entity';
import { AddressDto } from '../dto/address.dto';

export class EventMapper {
  static mapDocumentToEntity(event: EventDocument): Required<EventEntity> {
    const newEvent = new EventEntity();
    newEvent.id = event._id;
    newEvent.name = event.name;
    newEvent.description = event.description;
    newEvent.startDateTime = event.startDateTime;
    newEvent.endDateTime = event.endDateTime;
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
    newEvent.address = new AddressEntity(
      event.address.country,
      event.address.city,
      event.address.postalcode,
      event.address.street,
    );
    newEvent.address.housenumber = event.address.housenumber;
    newEvent.address.addition = event.address.addition;

    newEvent.price = event.price;
    newEvent.public = event.public;
    newEvent.imageId = event.imageId;
    newEvent.organizerId = event.organizerId;
    newEvent.category = event.category;
    newEvent.participants = event.participants;

    return newEvent as Required<EventEntity>;
  }

  static mapCreateDtoToEntity(
    event: CreateEventDto,
    organizerId: EventEntity['organizerId'],
  ): EventEntity {
    const newEvent = new EventEntity();
    newEvent.name = event.name;
    newEvent.description = event.description;
    newEvent.startDateTime = event.startDateTime;
    newEvent.endDateTime = event.endDateTime;
    if (event.location) {
      newEvent.location = new LocationEntity();
      newEvent.location.type = GeolocationEnum.POINT;
      newEvent.location.coordinates = [
        event.location.longitude,
        event.location.latitude,
      ];
    } else {
      delete newEvent.location;
    }
    if (event.address) {
      newEvent.address = new AddressEntity(
        event.address.country,
        event.address.city,
        event.address.postalcode,
        event.address.street,
      );
      if (event.address.housenumber) {
        newEvent.address.housenumber = event.address.housenumber;
      }
      if (event.address.addition) {
        newEvent.address.addition = event.address.addition;
      }
    } else {
      delete newEvent.address;
    }

    newEvent.price = event.price;
    newEvent.public = event.public;
    newEvent.imageId = event.imageId;
    newEvent.organizerId = organizerId;
    newEvent.category = event.category;
    newEvent.participants = [];

    return newEvent;
  }

  static mapEntityToDto(
    event: Required<EventEntity>,
    userid: string,
  ): EventDto {
    const newEvent = new EventDto();
    newEvent.id = event.id;
    newEvent.name = event.name;
    newEvent.description = event.description;
    newEvent.startDateTime = event.startDateTime;
    newEvent.endDateTime = event.endDateTime;
    newEvent.location = new LocationDto();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore currently not using the correct type
    newEvent.location.longitude = event.location.coordinates[0];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore currently not using the correct type
    newEvent.location.latitude = event.location.coordinates[1];
    newEvent.address = new AddressDto();
    newEvent.address.country = event.address.country;
    newEvent.address.city = event.address.city;
    newEvent.address.postalcode = event.address.postalcode;
    newEvent.address.street = event.address.street;
    newEvent.address.housenumber = event.address.housenumber;
    newEvent.address.addition = event.address.addition;
    newEvent.price = event.price;
    newEvent.public = event.public;
    newEvent.imageId = event.imageId;
    newEvent.organizerId = event.organizerId;
    newEvent.category = event.category;
    newEvent.participants = event.participants.length;
    newEvent.userParticipates = event.participants.includes(userid);

    return newEvent;
  }
}
