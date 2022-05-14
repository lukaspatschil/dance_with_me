import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
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
import { CategoryEnum } from '../schema/enum/category.enum';

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
  startDateTime!: Date;

  @IsNotEmpty()
  @Transform((data) => {
    return new Date(data.value);
  })
  @IsDate()
  @MinDate(new Date())
  @IsBefore('endTime', { message: 'startTime must be before the endTime' })
  endDateTime!: Date;

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
  public!: boolean;

  imageId?: string;

  @IsNotEmpty()
  organizerId!: string;

  @IsNotEmpty()
  @IsArray()
  @IsEnum(CategoryEnum, { each: true })
  @ArrayMinSize(1)
  category!: CategoryEnum[];
}
