import { Module } from '@nestjs/common';
import { S3Module } from 'nestjs-s3';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';

@Module({
  imports: [
    S3Module.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        config: {
          accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
          secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
          endpoint: configService.get('AWS_ENDPOINT'),
          s3ForcePathStyle: true,
          signatureVersion: 'v4',
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  providers: [ImageService],
  controllers: [ImageController],
})
export class ImageModule {}
