import { createMock } from '@golevelup/nestjs-testing';
import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ALLOWED_ROLES_KEY, RoleGuard } from '../../../src/auth/role.guard';
import { AuthUser } from '../../../src/auth/interfaces';
import { RoleEnum } from '../../../src/core/schema/enum/role.enum';
import { MissingPermissionError } from '../../../src/core/error/missingPermission.error';

describe('RoleGuard', () => {
  let sut: RoleGuard;
  const mockReflector = createMock<Reflector>();
  const mockUser: AuthUser = {
    id: '1',
    displayName: 'John Doe',
    pictureUrl: 'https://example.com/picture.png',
    role: RoleEnum.USER,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    sut = module.get<RoleGuard>(RoleGuard);
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should use reflector to check allowed roles for route', () => {
    // Given
    const context = createMock<ExecutionContext>();
    context.switchToHttp().getRequest.mockReturnValue({
      user: mockUser,
    });
    mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.USER]);

    // When
    sut.canActivate(context);

    // Then
    expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
      ALLOWED_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
  });

  it('should throw error if no user is provided', () => {
    // Given
    const context = createMock<ExecutionContext>();
    context.switchToHttp().getRequest.mockReturnValue({});

    // Then
    expect(() => sut.canActivate(context)).toThrow();
  });

  it('should throw missing permission error if user does not have required role', () => {
    // Given
    const context = createMock<ExecutionContext>();
    context.switchToHttp().getRequest.mockReturnValue({
      user: mockUser,
    });
    mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.ORGANISER]);

    // Then
    expect(() => sut.canActivate(context)).toThrowError(MissingPermissionError);
  });

  it('should always allow admin to use route', () => {
    // Given
    const context = createMock<ExecutionContext>();
    context.switchToHttp().getRequest.mockReturnValue({
      user: { ...mockUser, role: RoleEnum.ADMIN },
    });
    mockReflector.getAllAndOverride.mockReturnValue([RoleEnum.ORGANISER]);

    // When
    const result = sut.canActivate(context);

    // Then
    expect(result).toBe(true);
  });
});
