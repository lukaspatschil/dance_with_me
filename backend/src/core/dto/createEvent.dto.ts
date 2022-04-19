import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  Min,
  MinDate,
  ValidateNested,
} from 'class-validator';
import { LocationDto } from './location.dto';
import { Transform, Type } from 'class-transformer';
import { IsAfter } from '../validators/IsAfter';
import { IsBefore } from '../validators/IsBefore';

export class CreateEventDto {
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
  @IsAfter('startTime', { message: 'endTime must be past the startTime' })
  endTime!: Date;

  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location!: LocationDto;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price!: number;

  @IsNotEmpty()
  @IsBoolean()
  isPublic!: boolean;

  @IsNotEmpty()
  imageId!: string;

  @IsNotEmpty()
  organizerId!: string;

  @IsNotEmpty()
  category!: string;
}
