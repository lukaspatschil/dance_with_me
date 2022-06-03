import { UserMapper } from '../../../../src/core/mapper/user.mapper';
import { UserEntity } from '../../../../src/core/entity/user.entity';
import {
  validObjectId,
  validUserDocument,
  validUserDto,
  validUserEntity,
} from '../../../test_data/user.testData';
import { UserDocument } from '../../../../src/core/schema/user.schema';

describe('UserMapper', () => {
  describe('mapEntityToDto', () => {
    it('should return correct Dto', () => {
      // Given
      const userEntity = validUserEntity;
      userEntity.id = validObjectId.toString();
      const userDto = validUserDto;
      userDto.id = validObjectId.toString();

      // When
      const result = UserMapper.mapEntityToDto(
        userEntity as Required<UserEntity>,
      );

      // Then
      expect(result).toEqual(validUserDto);
    });
  });

  describe('mapDocumentToEntity', () => {
    it('should return correct Entity', () => {
      // Given
      const userDocument = validUserDocument;
      userDocument._id = validObjectId.toString();
      const userEntity = validUserEntity;
      userEntity.id = validObjectId.toString();

      // When
      const result = UserMapper.mapDocumentToEntity(
        userDocument as UserDocument,
      );

      // Then
      expect(result).toEqual(userEntity);
    });
  });
});
