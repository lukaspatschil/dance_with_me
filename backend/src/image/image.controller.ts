import {
  Controller,
  Get,
  Logger,
  Param,
  Query,
  StreamableFile,
  Header,
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
import { Public } from '../auth/auth.guard';
import { ImageSizeDto } from '../core/dto/ImageSize.dto';
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
      FileMapper.mapFileToEntity(file),
    );
    return FileMapper.mapEntityToDto(result, user.id);
  }

  @Get('/:id')
  @Public()
  @Header('content-type', 'image/*')
  async getImageById(
    @Param('id') id: string,
    @Query() imageSize: ImageSizeDto,
  ) {
    this.logger.log('Get Picture with id: ' + id);
    const result = await this.imageService.getImageWithSize(id, imageSize.size);
    return new StreamableFile(result);
  }
}
