import { Test, TestingModule } from '@nestjs/testing';
import { PictureController } from './picture.controller';
import { PictureService } from './picture.service';

describe('PictureController', () => {
  let sut: PictureController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PictureService,
          useValue: {},
        },
      ],
      controllers: [PictureController],
    }).compile();

    sut = module.get<PictureController>(PictureController);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('getHello', () => {
    it('should return "Hello Picture!"', () => {
      // When
      const result = sut.getHello();

      // Then
      expect(result).toBe('Hello Picture!');
    });
  });
});
