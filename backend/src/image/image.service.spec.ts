import { Test, TestingModule } from '@nestjs/testing';
import { ImageService } from './image.service';
import { getS3ConnectionToken, S3 } from 'nestjs-s3';
import { MockS3Instance } from '../../test/stubs/s3.mock';
import { ImageSizeEnum } from '../core/schema/enum/imageSize.enum';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigMock } from '../../test/stubs/config.mock';
import {
  bufferMock,
  invalidFilenameJPG,
  invalidFilenamePDF,
  notFoundFilenamePNG,
  stringAWSBinaryImageResponse,
  validFilenamePNG,
  validFilenamePNGReadable,
  validFilenamePNGString,
  validFileConfigLarge,
  validFileConfigMedium,
  validFileConfigOriginal,
  validFileConfigSmall,
  validFileConfigThumbnail,
  validFileEntity,
  validFileEntityResponse,
  validFileKey,
} from '../../test/test_data/image.testData';
import mongoose from 'mongoose';

describe('ImageService', () => {
  let sut: ImageService;
  let s3: S3;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getS3ConnectionToken('default'),
          useClass: MockS3Instance,
        },
        {
          provide: ConfigService,
          useClass: ConfigMock,
        },
        ImageService,
      ],
    }).compile();

    sut = module.get<ImageService>(ImageService);
    s3 = module.get<S3>(getS3ConnectionToken('default'));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('onApplicationBootstrap', () => {
    it('should call the s3 instance, bucket exists and no new bucket is created', async () => {
      //When
      await sut.onApplicationBootstrap();

      //Then
      expect(s3.headBucket).toBeCalledTimes(1);
      expect(s3.createBucket).toBeCalledTimes(0);
    });

    it('should call the s3 instance, bucket does not exists, new bucket is created', async () => {
      //Given
      s3.headBucket = jest.fn(() => {
        throw new Error();
      });

      //When
      await sut.onApplicationBootstrap();

      //Then
      expect(s3.headBucket).toBeCalledTimes(1);
      expect(s3.createBucket).toBeCalledTimes(1);
    });
  });

  describe('uploadImage', () => {
    it('should call the s3 instance and create correct response', async () => {
      //Given
      const validFile = validFileEntity();
      jest.spyOn(mongoose.Types, 'ObjectId').mockImplementation(() => {
        return validFileKey;
      });

      //When
      const response = await sut.uploadImage(validFile);

      //Then
      expect(response).toEqual(validFileEntityResponse());
    });

    it('should call the s3 instance and call the service five times for each size', async () => {
      //Given
      const validFile = validFileEntity();
      jest.spyOn(mongoose.Types, 'ObjectId').mockImplementation(() => {
        return validFileKey;
      });

      //When
      await sut.uploadImage(validFile);

      //Then
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      expect(s3.putObject).toBeCalledTimes(5);
    });

    it('should call the s3 instance and call the service with thumbnail config', async () => {
      //Given
      const validFile = validFileEntity();
      jest.spyOn(mongoose.Types, 'ObjectId').mockImplementation(() => {
        return validFileKey;
      });

      //When
      await sut.uploadImage(validFile);

      //Then
      expect(s3.putObject).toBeCalledWith(
        expect.objectContaining(validFileConfigThumbnail()),
      );
    });

    it('should call the s3 instance and call the service with small config', async () => {
      //Given
      const validFile = validFileEntity();
      jest.spyOn(mongoose.Types, 'ObjectId').mockImplementation(() => {
        return validFileKey;
      });

      //When
      await sut.uploadImage(validFile);

      //Then
      expect(s3.putObject).toBeCalledWith(
        expect.objectContaining(validFileConfigSmall()),
      );
    });

    it('should call the s3 instance and call the service with medium config', async () => {
      //Given
      const validFile = validFileEntity();
      jest.spyOn(mongoose.Types, 'ObjectId').mockImplementation(() => {
        return validFileKey;
      });

      //When
      await sut.uploadImage(validFile);

      //Then
      expect(s3.putObject).toBeCalledWith(
        expect.objectContaining(validFileConfigMedium()),
      );
    });

    it('should call the s3 instance and call the service with large config', async () => {
      //Given
      const validFile = validFileEntity();
      jest.spyOn(mongoose.Types, 'ObjectId').mockImplementation(() => {
        return validFileKey;
      });

      //When
      await sut.uploadImage(validFile);

      //Then
      expect(s3.putObject).toBeCalledWith(
        expect.objectContaining(validFileConfigLarge()),
      );
    });

    it('should call the s3 instance and call the service with original config', async () => {
      //Given
      const validFile = validFileEntity();
      jest.spyOn(mongoose.Types, 'ObjectId').mockImplementation(() => {
        return validFileKey;
      });

      //When
      await sut.uploadImage(validFile);

      //Then
      expect(s3.putObject).toBeCalledWith(
        expect.objectContaining(validFileConfigOriginal()),
      );
    });

    it('should call the s3 instance and throw an InternalServerErrorException from s3 putObject', async () => {
      //Given
      const validFile = validFileEntity();

      //When
      const result = async () => await sut.uploadImage(validFile);
      //Then
      await expect(result).rejects.toThrow(new InternalServerErrorException());
    });
  });
  describe('getImageWithSize', () => {
    it('should call the getObject on S3', async () => {
      // When
      await sut.getImageWithSize(validFilenamePNG, ImageSizeEnum.MEDIUM);

      // Then
      expect(s3.getObject).toHaveBeenCalled();
    });

    it('should call the getObject on S3 and return a buffer', async () => {
      // When
      const readable = await sut.getImageWithSize(
        validFilenamePNG,
        ImageSizeEnum.MEDIUM,
      );
      const result = readable.read();

      // Then
      expect(result).toEqual(bufferMock());
    });

    it('should call the getObject on S3 and return a readable', async () => {
      // When
      const readable = await sut.getImageWithSize(
        validFilenamePNGReadable,
        ImageSizeEnum.MEDIUM,
      );
      const result = readable.read();

      // Then
      expect(result).toEqual(bufferMock());
    });

    it('should call the getObject on S3 and return a string', async () => {
      // When
      const readable = await sut.getImageWithSize(
        validFilenamePNGString,
        ImageSizeEnum.MEDIUM,
      );
      const result = readable.read();

      // Then
      expect(result).toEqual(stringAWSBinaryImageResponse());
    });

    it('should call the service and throw a NotFoundException', async () => {
      // When
      const result = async () =>
        await sut.getImageWithSize(notFoundFilenamePNG, ImageSizeEnum.MEDIUM);

      // Then
      await expect(result).rejects.toThrow(NotFoundException);
    });

    it('should call the service and throw an InternalServerErrorException', async () => {
      // When
      const result = async () =>
        await sut.getImageWithSize(invalidFilenameJPG, ImageSizeEnum.MEDIUM);

      // Then
      await expect(result).rejects.toThrow(new InternalServerErrorException());
    });

    it('should call the service and throw an InternalServerErrorException due s3 wrong type', async () => {
      // When
      const result = async () =>
        await sut.getImageWithSize(invalidFilenamePDF, ImageSizeEnum.MEDIUM);

      // Then
      await expect(result).rejects.toThrow(new InternalServerErrorException());
    });
  });
});
