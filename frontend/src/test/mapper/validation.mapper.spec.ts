import { UserMapper } from '../../app/mapper/user.mapper';
import { ValidationEnum } from '../../app/enums/validation.enum';
import { ValidationRequestDto } from '../../app/dto/validationRequest.dto';
import { ValidationRequestEntity } from '../../app/entities/validationRequestEntity';
import { ValidationMapper } from '../../app/mapper/validation.mapper';


describe('Validation Mapper', () => {
  describe('dtoToEntity', () => {
    it('should return correct entity', () => {
      // When
      const result = ValidationMapper.dtoToEntity(dto);

      // Then
      expect(result).toEqual(entity);
    });

    it('should return null on invalid dtos', () => {
      // Given
      const invalidDto = { ...dto, displayName: undefined };

      // When
      const result = UserMapper.dtoToEntity(invalidDto);

      // Then
      expect(result).toEqual(null);
    });
  });

  const dto: ValidationRequestDto = {
    id: 'test-1',
    userId: 'google:12345',
    displayName: 'Max1',
    firstName: 'Max',
    lastName: 'Hermannus',
    email: 'Mail@mail.com',
    status: ValidationEnum.PENDING
  };

  const entity: ValidationRequestEntity = {
    id: 'test-1',
    userId: 'google:12345',
    displayName: 'Max1',
    firstName: 'Max',
    lastName: 'Hermannus',
    email: 'Mail@mail.com',
    status: ValidationEnum.PENDING
  };
});
