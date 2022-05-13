import { IsNotEmpty, IsOptional } from 'class-validator';

export class AddressDto {
  @IsNotEmpty()
  country!: string;

  @IsNotEmpty()
  city!: string;

  @IsNotEmpty()
  postalcode!: string;

  @IsNotEmpty()
  street!: string;

  @IsOptional()
  housenumber?: string;

  @IsOptional()
  addition?: string;
}
