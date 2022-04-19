import { LocationEntity } from './location.entity';

export class EventEntity {
  id?: string;
  name!: string;
  description!: string;
  date!: Date;
  startTime!: Date;
  endTime!: Date;
  location!: LocationEntity;
  price!: number;
  isPublic!: boolean;
  imageId!: string;
  organizerId!: string;
  category!: string;
}
