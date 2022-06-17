import { ValidationDocument } from '../schema/validation.schema';
import { ValidationEntity } from '../entity/validation.entity';
import { ValidationResponseDto } from '../dto/validationResponse.dto';
import { UserMapper } from './user.mapper';
import { UserEntity } from '../entity/user.entity';

export class ValidationMapper {
  static mapDocumentToEntity(
    validityDocument: ValidationDocument,
  ): ValidationEntity {
    const entity = new ValidationEntity(
      validityDocument._id,
      validityDocument.status,
      validityDocument.user
        ? UserMapper.mapDocumentToEntity(validityDocument.user)
        : new UserEntity(),
    );
    entity.comment = validityDocument.comment;
    return entity;
  }

  static mapEntityToDto(
    validationEntity: ValidationEntity,
  ): ValidationResponseDto {
    const dto = new ValidationResponseDto();
    dto.id = validationEntity.id;
    dto.status = validationEntity.status;
    dto.comment = validationEntity.comment;
    dto.userId = validationEntity.user.id;
    dto.displayName = validationEntity.user.displayName;
    dto.email = validationEntity.user.email;
    dto.firstName = validationEntity.user.firstName;
    dto.lastName = validationEntity.user.lastName;
    return dto;
  }
}
