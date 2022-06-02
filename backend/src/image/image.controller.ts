import {
  Controller,
  Logger,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ImageService } from './image.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { FileMapper } from '../core/mapper/file.mapper';
import { User } from '../auth/user.decorator';
import { UserEntity } from '../core/entity/user.entity';
import { FileDto } from '../core/dto/file.dto';
import { Organizer } from '../auth/role.guard';
import { multerOptions } from './multer.config';

@Controller('image')
export class ImageController {
  private readonly logger = new Logger(ImageController.name);

  constructor(private readonly imageService: ImageService) {}

  @Post()
  @Organizer()
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @User() user: UserEntity,
  ): Promise<FileDto> {
    this.logger.log(`User with id: ${user.id} is uploading a image.`);
    const result = await this.imageService.uploadImage(
      await FileMapper.mapFileToEntity(file),
    );
    return FileMapper.mapEntityToDto(result, user.id);
  }
}
