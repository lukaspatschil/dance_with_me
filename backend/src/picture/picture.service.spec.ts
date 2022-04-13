import { Test, TestingModule } from '@nestjs/testing';
import { PictureService } from './picture.service';
import { getS3ConnectionToken, S3 } from 'nestjs-s3';
import { MockS3Instance } from '../../test/stubs/s3.mock';

describe('PictureService', () => {
  let sut: PictureService;
  let s3: S3;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getS3ConnectionToken('default'),
          useClass: MockS3Instance,
        },
        PictureService,
      ],
    }).compile();

    sut = module.get<PictureService>(PictureService);
    s3 = module.get<S3>(getS3ConnectionToken('default'));
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('getImage', () => {
    it('should call the getObject on S3', () => {
      // When
      sut.getImage();

      // Then
      expect(s3.getObject).toHaveBeenCalled();
    });
  });
});
