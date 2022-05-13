import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  MinDate,
  ValidateNested,
} from 'class-validator';
import { LocationDto } from './location.dto';
import { Transform } from 'class-transformer';
import { IsBefore } from '../validators/IsBefore';
import { AddressDto } from './address.dto';

export class EventDto {
  id!: string;

  @IsNotEmpty()
  name!: string;

  @IsNotEmpty()
  description!: string;

  @IsNotEmpty()
  @Transform((data) => {
    return new Date(data.value);
  })
  @IsDate()
  @MinDate(new Date())
  @IsBefore('endTime', { message: 'startTime must be before the endTime' })
  date!: Date;

  @IsNotEmpty()
  @Transform((data) => {
    return new Date(data.value);
  })
  @IsDate()
  @MinDate(new Date())
  @IsBefore('endTime', { message: 'startTime must be before the endTime' })
  startTime!: Date;

  @IsNotEmpty()
  @Transform((data) => {
    return new Date(data.value);
  })
  @IsDate()
  @MinDate(new Date())
  @IsBefore('endTime', { message: 'startTime must be before the endTime' })
  endTime!: Date;

  @IsNotEmptyObject()
  @ValidateNested()
  location?: LocationDto;

  @IsNotEmptyObject()
  @ValidateNested()
  address?: AddressDto;

  @IsNotEmpty()
  @IsNumber()
  price!: number;

  @IsNotEmpty()
  @IsBoolean()
  isPublic!: boolean;
  imageId!: string;

  @IsNotEmpty()
  organizerId!: string;

  @IsNotEmpty()
  category!: string;
}
