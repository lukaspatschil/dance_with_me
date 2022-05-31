import { UpdateLocationEntity } from './location.entity';
import { CategoryEnum } from '../schema/enum/category.enum';
import { AddressEntity } from './address.entity';
import { IsDate, IsOptional, MinDate } from 'class-validator';
import { IsBefore } from '../validators/IsBefore';
import { Transform } from 'class-transformer';
import { IsAfter } from '../validators/IsAfter';

export class UpdateEventEntity {
  @IsOptional()
  name?: string;
  @IsOptional()
  description?: string;
  @IsOptional()
  @Transform((data) => {
    return new Date(data.value);
  })
  @IsDate()
  @MinDate(new Date())
  @IsBefore('endDateTime', {
    message: 'startDateTime must be before the endTime',
  })
  startDateTime?: Date;
  @IsOptional()
  @Transform((data) => {
    return new Date(data.value);
  })
  @IsDate()
  @MinDate(new Date())
  @IsAfter('startDateTime', {
    message: 'endDateTime must be after the startDateTime',
  })
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
