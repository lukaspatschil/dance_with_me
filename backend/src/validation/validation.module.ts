import { Module } from '@nestjs/common';
import { ValidationController } from './validation.controller';
import { ValidationService } from './validation.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ValidationDocument,
  ValidationSchema,
} from '../core/schema/validation.schema';
import { S3Module } from 'nestjs-s3';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserDocument, UserSchema } from '../core/schema/user.schema';
import { ImageService } from '../image/image.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ValidationDocument.name, schema: ValidationSchema },
      { name: UserDocument.name, schema: UserSchema },
    ]),
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
    ImageService,
  ],
  providers: [ValidationService, ImageService],
  controllers: [ValidationController],
  exports: [ValidationService],
})
export class ValidationModule {}
