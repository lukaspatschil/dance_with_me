import {LocationEntity} from "../entities/location.entity";
import {AddressEntity} from "../entities/address.entity";
import {EventEntity} from "../entities/event.entity";
import {EventResponseDto} from "../dto/eventResponse.dto";

export class EventMapper {

  static mapEventDtoToEntity(entry: EventResponseDto): EventEntity{
    if (this.checkIfValid(entry) && this.checkIfAddressValid(entry) && this.checkIfLocationValid(entry)) {
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
          location, address,
          entry.price,
          entry.public,
          entry.date,
          entry.starttime,
          entry.endtime,
          entry.category);

          return event
    } else {
      return {} as EventEntity
    }
  }

  static checkIfValid(value: EventResponseDto): boolean{
    return Boolean(value.id &&
      value.name &&
      value.description &&
      Number.isFinite(value.price) &&
      value.date &&
      value.starttime &&
      value.endtime &&
      value.public &&
      value.category)
  }

  static checkIfAddressValid(value: EventResponseDto): boolean{
    return  Boolean (value.address!.street && value.address!.housenumber && value.address!.city && value.address!.country && value.address!.postalcode)
  }

  static checkIfLocationValid(value: EventResponseDto): boolean {
    return Boolean(Number.isFinite(value.location!.longitude) && Number.isFinite(value.location!.latitude))
  }

}
