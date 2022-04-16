import { IsLatitude, IsLongitude, IsOptional } from 'class-validator';

export class LocationBodyDto {
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @IsLatitude()
  latitude?: number;
}
