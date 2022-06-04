import { UserDto } from '../../app/dto/user.dto';
import { RoleEnum } from '../../app/enums/role.enum';
import { UserEntity } from '../../app/entities/user.entity';
import { UserMapper } from '../../app/mapper/user.mapper';


describe('UserMapper', () => {
  describe('dtoToEntity', () => {
    it('should return correct entity', () => {
      // When
      const result = UserMapper.dtoToEntity(userDto);

      // Then
      expect(result).toEqual(userEntity);
    });

    it('should return null on invalid dtos', () => {
      // Given
      const invalidDto = { ...userDto, displayName: undefined };

      // When
      const result = UserMapper.dtoToEntity(invalidDto);

      // Then
      expect(result).toEqual(null);
    });
  });

  const userDto: UserDto = {
    id: 'google:12345',
    displayName: 'Max1',
    firstName: 'Max',
    lastName: 'Hermannus',
    email: 'Mail@mail.com',
    emailVerified: true,
    role: RoleEnum.USER
  };

  const userEntity: UserEntity = {
    id: 'google:12345',
    displayName: 'Max1',
    firstName: 'Max',
    lastName: 'Hermannus',
    email: 'Mail@mail.com',
    emailVerified: true,
    role: RoleEnum.USER
  };
});
