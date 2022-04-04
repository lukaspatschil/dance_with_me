import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let sut: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    sut = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect(sut.getHello()).toBe('Hello World!');
    });
  });
});
