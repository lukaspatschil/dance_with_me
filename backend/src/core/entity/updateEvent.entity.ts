import { UpdateLocationEntity } from './location.entity';
import { CategoryEnum } from '../schema/enum/category.enum';
import { AddressEntity } from './address.entity';
import { IsOptional } from 'class-validator';

export class UpdateEventEntity {
  @IsOptional()
  name?: string;
  @IsOptional()
  description?: string;
  @IsOptional()
  startDateTime?: Date;
  @IsOptional()
  endDateTime?: Date;
  @IsOptional()
  location?: UpdateLocationEntity;
  @IsOptional()
  address?: AddressEntity;
  @IsOptional()
  price?: number;
  @IsOptional()
  public?: boolean;
  @IsOptional()
  imageId?: string;
  @IsOptional()
  organizerId?: string;
  @IsOptional()
  category?: CategoryEnum[];
}
