import { IsLatitude, IsLongitude, IsNotEmpty } from 'class-validator';

export class LocationDto {
  @IsNotEmpty()
  @IsLongitude()
  longitude!: number;

  @IsNotEmpty()
  @IsLatitude()
  latitude!: number;
}
