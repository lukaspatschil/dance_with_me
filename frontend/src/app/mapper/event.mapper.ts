import { LocationEntity } from '../entities/location.entity';
import { AddressEntity } from '../entities/address.entity';
import { EventEntity } from '../entities/event.entity';
import { EventDto } from '../dto/event.dto';

export class EventMapper {

  static mapEventDtoToEntity(entry: EventDto): EventEntity | null {
    if (entry.id &&
      entry.name &&
      entry.description &&
      typeof entry.price === 'number' &&
      entry.startDateTime &&
      entry.endDateTime &&
      entry.public &&
      entry.category &&
      entry.address?.street &&
      entry.address.housenumber &&
      entry.address.city &&
      entry.address.country &&
      entry.address.postalcode &&
      entry.organizerName &&
      typeof entry.location?.longitude === 'number' &&
      typeof entry.location.latitude === 'number') {
      const location = new LocationEntity(
        entry.location.longitude,
        entry.location.latitude);

      const address = new AddressEntity(
        entry.address.country,
        entry.address.city,
        entry.address.postalcode,
        entry.address.street,
        entry.address.housenumber,
        entry.address.addition);

      const event = new EventEntity(
        entry.id,
        entry.name,
        entry.description,
        location,
        address,
        entry.price,
        entry.public,
        new Date(entry.startDateTime),
        new Date(entry.endDateTime),
        entry.category,
        entry.organizerName
      );

      event.imageId = entry.imageId;
      event.userParticipates = entry.userParticipates ?? false;

      return event;
    } else {
      return null;
    }
  }
}
