import { ImageSizeEnum } from '../schema/enum/imageSize.enum';
import { IsEnum } from 'class-validator';

export class ImageSizeDto {
  @IsEnum(ImageSizeEnum)
  size: ImageSizeEnum = ImageSizeEnum.MEDIUM;
}
