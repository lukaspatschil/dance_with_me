import { Test, TestingModule } from '@nestjs/testing';
import { ImageService } from './image.service';
import { getS3ConnectionToken, S3 } from 'nestjs-s3';
import { MockS3Instance } from '../../test/stubs/s3.mock';
import { ConfigService } from '@nestjs/config';
import { ConfigMock } from '../../test/stubs/config.mock';
import {
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
import { InternalServerErrorException } from '@nestjs/common';

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

  afterEach(async () => {
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
});
