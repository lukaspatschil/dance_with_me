import { IdentityProviderGuard } from '../../../src/auth/social.guard';
import { createMock } from '@golevelup/nestjs-testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import passport, { Strategy } from 'passport';
import { AuthGuard } from '@nestjs/passport';

describe('IdentityProviderGuard', () => {
  let guard: IdentityProviderGuard;

  class MockStrategy extends Strategy {
    constructor(private shouldSucceed: boolean) {
      super();
    }
    public override authenticate() {
      return this.shouldSucceed ? this.success({}) : this.error(false);
    }
  }

  beforeEach(() => {
    guard = new IdentityProviderGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw ForbiddenException if provider is not supported', () => {
    // Given
    const context = createMock<ExecutionContext>();

    context.switchToHttp().getRequest.mockReturnValue({
      params: {
        provider: 'foo',
      },
    });

    // Then
    expect(() => guard.canActivate(context)).toThrowError(ForbiddenException);
  });

  it('should pass on to provider guard', () => {
    // Given
    const context = createMock<ExecutionContext>();
    passport.use('facebook', new MockStrategy(true));
    const providerGuard = AuthGuard('facebook').prototype;
    jest.spyOn(providerGuard, 'canActivate');

    context.switchToHttp().getRequest.mockReturnValue({
      params: {
        provider: 'facebook',
      },
    });

    // When
    guard.canActivate(context);

    // Then
    expect(providerGuard.canActivate).toHaveBeenCalledWith(context);
  });

  it("should return true if provider guard's canActivate returns true", () => {
    // Given
    const context = createMock<ExecutionContext>();
    passport.use('google', new MockStrategy(true));
    const providerGuard = AuthGuard('google').prototype;
    jest.spyOn(providerGuard, 'canActivate');

    context.switchToHttp().getRequest.mockReturnValue({
      params: {
        provider: 'google',
      },
    });

    // When
    const res = guard.canActivate(context);

    // Then
    expect(res).toEqual(providerGuard.canActivate(context));
  });
});
