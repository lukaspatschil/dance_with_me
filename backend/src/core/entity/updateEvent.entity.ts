import { LocationEntity } from './location.entity';
import { CategoryEnum } from '../schema/enum/category.enum';
import { AddressEntity } from './address.entity';

export class UpdateEventEntity {
  name?: string;

  description?: string;

  startDateTime?: Date;

  endDateTime?: Date;

  location?: LocationEntity;

  address?: AddressEntity;

  price?: number;

  public?: boolean;

  imageId?: string;

  category?: CategoryEnum[];
}
