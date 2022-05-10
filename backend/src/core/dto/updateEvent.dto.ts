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
import { UpdateLocationDto } from './location.dto';
import { Transform, Type } from 'class-transformer';
import { IsBefore } from '../validators/IsBefore';

export class UpdateEventDto {
  @IsOptional()
  id?: string;

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
  @IsBefore('endTime', { message: 'startTime must be before the endTime' })
  date?: Date;

  @IsOptional()
  @Transform((data) => {
    return new Date(data.value);
  })
  @IsOptional()
  @IsDate()
  @MinDate(new Date())
  @IsBefore('endTime', { message: 'startTime must be before the endTime' })
  startTime?: Date;

  @IsOptional()
  @Transform((data) => {
    return new Date(data.value);
  })
  @IsOptional()
  @IsDate()
  @MinDate(new Date())
  endTime?: Date;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateLocationDto)
  location?: UpdateLocationDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  imageId?: string;

  @IsOptional()
  organizerId?: string;

  @IsOptional()
  category?: string;
}
