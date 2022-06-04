import { Test, TestingModule } from '@nestjs/testing';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import {
  getDefaultUserImageTest,
  validCreated,
  validFileDto,
  validFileMulter,
  validFilenameJPG,
} from '../../test/test_data/image.testData';
import { ImageServiceMock } from '../../test/stubs/image.service.mock';
import { ImageSizeEnum } from '../core/schema/enum/imageSize.enum';
import { StreamableFile } from '@nestjs/common';

describe('ImageController', () => {
  let sut: ImageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ImageService,
          useClass: ImageServiceMock,
        },
      ],
      controllers: [ImageController],
    }).compile();

    sut = module.get<ImageController>(ImageController);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should call uploadImage and return file', async () => {
      //Given
      Date.now = jest.fn(() => validCreated);

      //When
      const response = await sut.uploadFile(
        validFileMulter(),
        getDefaultUserImageTest(),
      );

      //Then
      expect(response).toEqual(validFileDto());
    });
  });

  describe('getImageById', () => {
    it('should return a StreamableFile', async () => {
      // When
      const result = await sut.getImageById(validFilenameJPG, {
        size: ImageSizeEnum.MEDIUM,
      });

      // Then
      expect(result).toBeInstanceOf(StreamableFile);
    });
  });
});
