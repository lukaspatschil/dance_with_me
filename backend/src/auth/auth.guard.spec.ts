import { createMock } from '@golevelup/nestjs-testing';
import { ExecutionContext } from '@nestjs/common';
import { AccessTokenGuard, IS_PUBLIC_KEY } from './auth.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import passport, { Strategy } from 'passport';
import { AuthGuard } from '@nestjs/passport';

describe('AccessTokenGuard', () => {
  let sut: AccessTokenGuard;
  const mockReflector = createMock<Reflector>();

  class MockStrategy extends Strategy {
    constructor(private readonly shouldSucceed: boolean) {
      super();
    }

    public override authenticate() {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      this.shouldSucceed ? this.success({}) : this.error(false);
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessTokenGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    sut = module.get<AccessTokenGuard>(AccessTokenGuard);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should use reflector to check if route is public', async () => {
    // Given
    const context = createMock<ExecutionContext>();

    // When
    await sut.canActivate(context);

    // Then
    expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
  });

  it('should defer to parent AuthGuard if route is not public', async () => {
    // Given
    const context = createMock<ExecutionContext>();
    passport.use('accessToken', new MockStrategy(true));
    const authGuard = AuthGuard('accessToken').prototype;
    jest.spyOn(authGuard, 'canActivate');
    mockReflector.getAllAndOverride.mockReturnValue(false);

    // When
    await sut.canActivate(context);

    // Then
    expect(authGuard.canActivate).toHaveBeenCalledWith(context);
  });
});
