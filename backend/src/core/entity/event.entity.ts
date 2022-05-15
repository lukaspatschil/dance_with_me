import { LocationEntity } from './location.entity';
import { AddressEntity } from './address.entity';

export class EventEntity {
  id?: string;
  name!: string;
  description!: string;
  startDateTime!: Date;
  endDateTime!: Date;
  location?: LocationEntity;
  address?: AddressEntity;
  price!: number;
  public!: boolean;
  imageId?: string;
  organizerId!: string;
  category!: string;
}
