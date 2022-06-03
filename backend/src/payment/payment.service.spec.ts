import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  let sut: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentService],
    }).compile();

    sut = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });
});
