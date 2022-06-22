import { LocationEntity } from './location.entity';
import { Category } from '../enums/category.enum';
import { AddressEntity } from './address.entity';
import { SafeUrl } from '@angular/platform-browser';

export class EventEntity {
  id: string;

  name: string;

  description: string;

  location: LocationEntity;

  address: AddressEntity;

  price: number;

  public: boolean;

  startDateTime: Date;

  endDateTime: Date;

  category: Category[];

  imageId?: string;

  image?: SafeUrl;

  userParticipates = false;

  organizerName: string;

  constructor(
    id: string,
    name: string,
    description: string,
    location: LocationEntity,
    address: AddressEntity,
    price: number,
    isPublic: boolean,
    startDateTime: Date,
    endDateTime: Date,
    category: Category[],
    organizerName: string
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.location = location;
    this.address = address;
    this.price = price;
    this.public = isPublic;
    this.startDateTime = startDateTime;
    this.endDateTime = endDateTime;
    this.category = category;
    this.organizerName = organizerName;
  }
}
