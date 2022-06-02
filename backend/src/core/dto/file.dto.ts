import { IsNotEmpty } from 'class-validator';

export class FileDto {
  constructor(
    id: string,
    ownerId: string,
    filename: string,
    createdAt: number,
    updatedAt: number,
    size: number,
    resolution: string,
  ) {
    this.id = id;
    this.ownerId = ownerId;
    this.filename = filename;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.size = size;
    this.resolution = resolution;
  }

  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  ownerId: string;

  @IsNotEmpty()
  filename: string;

  @IsNotEmpty()
  createdAt: number;

  @IsNotEmpty()
  updatedAt: number;

  @IsNotEmpty()
  size: number;

  @IsNotEmpty()
  resolution: string;
}
