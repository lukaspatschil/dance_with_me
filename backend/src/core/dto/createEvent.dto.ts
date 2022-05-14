import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  MinDate,
  ValidateNested,
} from 'class-validator';
import { LocationDto } from './location.dto';
import { Transform, Type } from 'class-transformer';
import { IsAfter } from '../validators/IsAfter';
import { IsBefore } from '../validators/IsBefore';
import { AddressDto } from './address.dto';
import { CategoryEnum } from '../schema/enum/category.enum';

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
  @IsBefore('endDateTime', {
    message: 'startDateTime must be before the endDateTime',
  })
  startDateTime!: Date;

  @IsNotEmpty()
  @Transform((data) => {
    return new Date(data.value);
  })
  @IsDate()
  @MinDate(new Date())
  @IsAfter('startDateTime', {
    message: 'endDateTime must be past the startDateTime',
  })
  endDateTime!: Date;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price!: number;

  @IsNotEmpty()
  @IsBoolean()
  public!: boolean;

  @IsOptional()
  imageId?: string;

  @IsNotEmpty()
  @IsArray()
  @IsEnum(CategoryEnum, { each: true })
  @ArrayMinSize(1)
  category!: CategoryEnum[];
}
