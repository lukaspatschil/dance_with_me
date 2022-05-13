import { LocationEntity } from './location.entity';
import { AddressEntity } from './address.entity';

export class EventEntity {
  id?: string;
  name!: string;
  description!: string;
  date!: Date;
  startTime!: Date;
  endTime!: Date;
  location?: LocationEntity;
  address?: AddressEntity;
  price!: number;
  isPublic!: boolean;
  imageId!: string;
  organizerId!: string;
  category!: string;
}
