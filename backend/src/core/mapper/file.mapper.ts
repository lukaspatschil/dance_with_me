import { Express } from 'express';
import { FileDto } from '../dto/file.dto';
import { FileEntity } from '../entity/file.entity';

export class FileMapper {
  static mapEntityToDto(file: FileEntity, ownerId: string): FileDto {
    let filename = file.originalFileName;
    if (file.fileName) {
      filename = file.fileName;
    }
    return new FileDto(
      filename,
      ownerId,
      file.originalFileName,
      Date.now(),
      Date.now(),
      file.buffer.length,
      `${file.width}x${file.height}`,
    );
  }

  static mapFileToEntity(file: Express.Multer.File): FileEntity {
    return new FileEntity(
      file.buffer,
      file.originalname,
      file.mimetype,
      file.encoding,
    );
  }
}
