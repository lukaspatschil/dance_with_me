import { Controller, Get, Logger } from '@nestjs/common';
import { PictureService } from './picture.service';

@Controller('picture')
export class PictureController {
  private readonly logger = new Logger(PictureController.name);

  constructor(private readonly pictureService: PictureService) {}

  @Get()
  getHello(): string {
    return 'Hello Picture!';
  }
}
