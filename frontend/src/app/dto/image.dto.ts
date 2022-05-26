export class ImageDto {
  id?: string;
  ownerId?: string;
  filename?: string;
  createdAt?: number;
  updatedAt?: number;
  size?: number;
  resolution?: string;

  constructor(id: string, ownerId: string, filename: string, createdAt: number, updatedAt: number, size: number, resolution: string) {
    this.id = id;
    this.ownerId = ownerId;
    this.filename = filename;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.size = size;
    this.resolution = resolution;
  }
}
