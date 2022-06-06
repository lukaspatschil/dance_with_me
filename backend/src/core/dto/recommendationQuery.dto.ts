import {
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RecommendationQueryDto {
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

  @Transform((value) => Number(value.value))
  @IsLongitude()
  longitude?: number;

  @Transform((value) => Number(value.value))
  @IsLatitude()
  latitude?: number;

  @Transform((value) => {
    return Number(value.value);
  })
  @IsNumber()
  radius?: number;
}
