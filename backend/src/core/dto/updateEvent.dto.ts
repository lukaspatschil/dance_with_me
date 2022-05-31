import {
  IsBoolean,
  IsDate,
  IsNumber,
  MinDate,
  ValidateNested,
  IsOptional,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { LocationDto } from './location.dto';
import { Transform, Type } from 'class-transformer';
import { IsBefore } from '../validators/IsBefore';
import { CategoryEnum } from '../schema/enum/category.enum';
import { AddressDto } from './address.dto';

export class UpdateEventDto {
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @Transform((data) => {
    return new Date(data.value);
  })
  @IsOptional()
  @IsDate()
  @MinDate(new Date())
  //@IsBefore('endTime', { message: 'startTime must be before the endTime' })
  startDateTime?: Date;

  @IsOptional()
  @Transform((data) => {
    return new Date(data.value);
  })
  @IsOptional()
  @IsDate()
  @MinDate(new Date())
  endDateTime?: Date;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @ValidateNested()
  address?: AddressDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsBoolean()
  public?: boolean;

  @IsOptional()
  imageId?: string;

  @IsOptional()
  organizerId?: string;

  @IsOptional()
  category?: CategoryEnum[];
}
