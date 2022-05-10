import { UpdateLocationEntity } from './location.entity';

export class UpdateEventEntity {
  id?: string;
  name?: string;
  description?: string;
  date?: Date;
  startTime?: Date;
  endTime?: Date;
  location?: UpdateLocationEntity;
  price?: number;
  isPublic?: boolean;
  imageId?: string;
  organizerId?: string;
  category?: string;
}
