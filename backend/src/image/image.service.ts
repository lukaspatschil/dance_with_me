import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { PutObjectRequest, GetObjectRequest } from 'aws-sdk/clients/s3';
import { InjectS3, S3 } from 'nestjs-s3';
import { ImageSizeEnum } from '../core/schema/enum/imageSize.enum';
import { ConfigService } from '@nestjs/config';
import { FileEntity } from '../core/entity/file.entity';
import { Readable } from 'stream';
import mongoose from 'mongoose';
import { extname } from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import sharp = require('sharp');
import { NotFoundError } from '../core/error/notFound.error';

/* eslint @typescript-eslint/naming-convention: 0 */

@Injectable()
export class ImageService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ImageService.name);

  constructor(
    @InjectS3() private readonly s3: S3,
    private readonly configService: ConfigService,
  ) {}

  async getImageWithSize(
    id: string,
    imageSize: ImageSizeEnum,
  ): Promise<Readable> {
    const key = `${imageSize.toLowerCase()}/${id}`;
    const { body } = await this.getImage(key);
    return body;
  }

  async getImage(path: string) {
    const bucketName =
      this.configService.get('BUCKET_NAME_PREFIX') +
      this.configService.get('STAGE');
    this.logger.log(`Get File with Key: ${path} from Bucket: ${bucketName}.`);
    const config: GetObjectRequest = {
      Bucket: bucketName,
      Key: path,
    };
    try {
      const { Body, ContentType } = await this.s3.getObject(config).promise();

      // convert body to readable stream if necessary
      if (Body instanceof Buffer) {
        return {
          body: Readable.from(Body),
          contentType: ContentType,
        };
      } else if (typeof Body === 'string') {
        return {
          body: Readable.from([Body]),
          contentType: ContentType,
        };
      } else if (Body instanceof Readable) {
        return {
          body: Body,
          contentType: ContentType,
        };
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NoSuchKey') {
          this.logger.error(
            `Bucket ${bucketName} doesn't contain key ${path}.`,
          );
          throw NotFoundError;
        }
      }
      this.logger.error(`Unknown s3 error ${error}.`);
      throw new InternalServerErrorException();
    }

    this.logger.error(
      'S3 response was not a valid format, jpg and png are normally a buffer.',
    );
    throw new InternalServerErrorException();
  }

  async uploadImage(file: FileEntity): Promise<FileEntity> {
    const bucketName =
      this.configService.get('BUCKET_NAME_PREFIX') +
      this.configService.get('STAGE');
    try {
      file.fileName = `${new mongoose.Types.ObjectId()}${extname(
        file.originalFileName,
      )}`;
      const fileSharp = sharp(file.buffer);
      const metaInfos = await fileSharp.metadata();
      file.width = metaInfos.width;
      file.height = metaInfos.height;
      for (const size in ImageSizeEnum) {
        const sizeLowerCase = size.toLowerCase();
        this.logger.log(
          `Trying to upload image ${file.fileName} to bucket sub folder ${sizeLowerCase}`,
        );
        let buffer = file.buffer;
        if (size !== ImageSizeEnum.ORIGINAL) {
          const imageSize = this.getSize(sizeLowerCase);
          buffer = await fileSharp
            .resize({
              width: imageSize[0],
              height: imageSize[1],
              fit: sharp.fit.outside,
            })
            .toBuffer();
        }
        const config: PutObjectRequest = {
          Bucket: bucketName,
          Key: `${sizeLowerCase}/${file.fileName}`,
          Body: buffer,
          ContentType: file.mimetype,
        };
        await this.s3.putObject(config).promise();
      }
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
    return file;
  }

  private getSize(size: string): [number, number] {
    let widthString: string;
    let heightString: string;
    switch (size) {
      case ImageSizeEnum.THUMBNAIL:
        widthString = this.configService.get('THUMBNAIL_SIZE_WIDTH', '150');
        heightString = this.configService.get('THUMBNAIL_SIZE_HEIGHT', '150');
        break;
      case ImageSizeEnum.SMALL:
        widthString = this.configService.get('SMALL_SIZE_WIDTH', '300');
        heightString = this.configService.get('SMALL_SIZE_HEIGHT', '300');
        break;
      case ImageSizeEnum.LARGE:
        widthString = this.configService.get('LARGE_SIZE_WIDTH', '800');
        heightString = this.configService.get('LARGE_SIZE_HEIGHT', '800');
        break;
      default: // medium has the same size
        widthString = this.configService.get('MEDIUM_SIZE_WIDTH', '500');
        heightString = this.configService.get('MEDIUM_SIZE_HEIGHT', '500');
        break;
    }
    return [Number(widthString), Number(heightString)];
  }

  async onApplicationBootstrap(): Promise<void> {
    const bucketName =
      this.configService.get('BUCKET_NAME_PREFIX') +
      this.configService.get('STAGE');
    const exists = await this.bucketExists(bucketName);
    if (!exists) {
      this.logger.log(
        `Bucket ${this.configService.get(
          'BUCKET_NAME_PREFIX',
        )} does not exist, trying to create bucket.`,
      );
      await this.createBucket(bucketName);
    }
  }

  private async createBucket(bucketName: string): Promise<boolean> {
    const config = {
      Bucket: bucketName,
      CreateBucketConfiguration: {
        LocationConstraint: this.configService.get('BUCKET_REGION'),
      },
    };
    try {
      await this.s3.createBucket(config).promise();
    } catch (error) {
      this.logger.error(
        `Bucket ${bucketName} couldn't be created, due to error: ${error}`,
      );
      return false;
    }
    this.logger.log(`Bucket ${bucketName} was created successfully.`);
    return true;
  }

  private async bucketExists(bucketName: string): Promise<boolean> {
    const config = { Bucket: bucketName };
    try {
      await this.s3.headBucket(config).promise();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotFound') {
          this.logger.log(`Bucket ${bucketName} doesn't exist.`);
        } else {
          this.logger.error(
            `Unknown s3 error: ${error}.Check if the s3 instance is running.`,
          );
        }
      }
      return false;
    }
    return true;
  }
}
