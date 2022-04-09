import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { UserDocument } from '../core/schema/user.schema';

describe('UserService', () => {
  let sut: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(UserDocument.name),
          useValue: {},
        },
      ],
    }).compile();

    sut = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });
});
