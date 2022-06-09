import { LocationEntity } from './location.entity';
import { AddressEntity } from './address.entity';
import { CategoryEnum } from '../schema/enum/category.enum';

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

  organizerName!: string;

  category!: CategoryEnum[];

  participants!: string[];
}
