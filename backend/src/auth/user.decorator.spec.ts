import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { User } from './user.decorator';
import { createMock } from '@golevelup/nestjs-testing';
import { ExecutionContext } from '@nestjs/common';
import { AuthUser } from './interfaces';
import { RoleEnum } from '../core/schema/enum/role.enum';

describe('User decorator', function () {
  const mockUser: AuthUser = {
    id: '1',
    displayName: 'John Doe',
    pictureUrl: 'https://example.com/picture.png',
    role: RoleEnum.USER,
  };

  function getParamDecoratorFactory(decorator: () => ParameterDecorator) {
    class Test {
      public test(@decorator() value: any) {
        return value;
      }
    }

    const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
    return Object.values<any>(args)[0]?.factory;
  }

  it('should be defined', () => {
    expect(User).toBeDefined();
  });

  it('should return the provided user', () => {
    // Given
    const context = createMock<ExecutionContext>();
    context.switchToHttp().getRequest.mockReturnValue({
      user: mockUser,
    });
    const factory = getParamDecoratorFactory(User);

    // When
    const result = factory(null, context);

    // Then
    expect(result).toBe(mockUser);
  });

  it('should return provided user attribute', () => {
    // Given
    const context = createMock<ExecutionContext>();
    context.switchToHttp().getRequest.mockReturnValue({
      user: mockUser,
    });
    const factory = getParamDecoratorFactory(User);

    // When
    const result = factory('id', context);

    // Then
    expect(result).toBe(mockUser.id);
  });

  it('should throw error if user does not exist', () => {
    // Given
    const context = createMock<ExecutionContext>();
    context.switchToHttp().getRequest.mockReturnValue({});
    const factory = getParamDecoratorFactory(User);

    // Then
    expect(() => factory(null, context)).toThrow();
  });
});
