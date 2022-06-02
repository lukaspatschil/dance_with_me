import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const multerOptions: MulterOptions = {
  // Enable file size limits
  limits: {
    fileSize: Number(process.env['MAX_FILE_SIZE']) ?? 33554432,
  },
  // Check the mimetypes to allow for upload
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(jpeg|png)$/)) {
      cb(null, true);
    } else {
      cb(new BadRequestException({ error: 'image_format_invalid' }), false);
    }
  },
};
