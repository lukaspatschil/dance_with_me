import {
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryDto {
  @IsOptional()
  @Transform((value) => Number(value.value))
  @IsInt()
  @IsNumber()
  skip?: number;

  @IsOptional()
  @Transform((value) => {
    return Number(value.value);
  })
  @IsInt()
  @IsNumber()
  take?: number;

  @IsOptional()
  @Transform((value) => Number(value.value))
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @Transform((value) => Number(value.value))
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @Transform((value) => {
    return Number(value.value);
  })
  @IsNumber()
  radius?: number;
}
