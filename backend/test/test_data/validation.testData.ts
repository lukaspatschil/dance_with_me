import { ValidationEntity } from '../../src/core/entity/validation.entity';
import mongoose from 'mongoose';
import { ValidationStatusEnum } from '../../src/core/schema/enum/validationStatus.enum';
import { UserEntity } from '../../src/core/entity/user.entity';
import { RoleEnum } from '../../src/core/schema/enum/role.enum';
import { ValidationResponseDto } from '../../src/core/dto/validationResponse.dto';
import { UpdateValidationDto } from '../../src/core/dto/updateValidation.dto';

export const validationId1 = new mongoose.Types.ObjectId().toString();
export const validationId2 = new mongoose.Types.ObjectId().toString();
export const invalidValidationId = new mongoose.Types.ObjectId().toString();
export const invalidValidationIdPopulate =
  new mongoose.Types.ObjectId().toString();
export const notFoundValidationId = new mongoose.Types.ObjectId().toString();
export const notFoundValidationIdPopulate =
  new mongoose.Types.ObjectId().toString();

export const userId1 = new mongoose.Types.ObjectId().toString();
export const userId2 = new mongoose.Types.ObjectId().toString();

export const invalidUserId1 = new mongoose.Types.ObjectId().toString();

export function getDefaultUserValidationTest1(): UserEntity {
  return {
    id: userId1,
    email: 'john.doe@example.com',
    displayName: 'John Doe',
    emailVerified: true,
    role: RoleEnum.USER,
  };
}
export function validUserDocumentValidation1() {
  return {
    _id: userId1,
    role: RoleEnum.USER,
    displayName: 'Testo1',
    firstName: 'Tester',
    lastName: 'Tester',
    email: 'test@test.com',
    emailVerified: false,
    pictureUrl: 'http://test.com/image.png',
  };
}

export function getDefaultUserValidationTest2(): UserEntity {
  return {
    id: userId2,
    email: 'crispy@chicken.com',
    displayName: 'Crispy Chicken',
    emailVerified: true,
    role: RoleEnum.USER,
  };
}

export function validValidationEntity1() {
  const val1 = new ValidationEntity(
    validationId1,
    ValidationStatusEnum.PENDING,
    getDefaultUserValidationTest1(),
  );
  val1.comment = 'Not you, you stink';
  return val1;
}

export function validValidationDto1(): ValidationResponseDto {
  return {
    id: validationId1,
    userId: userId1,
    email: getDefaultUserValidationTest1().email,
    displayName: getDefaultUserValidationTest1().displayName,
    firstName: getDefaultUserValidationTest1().firstName,
    lastName: getDefaultUserValidationTest1().lastName,
    status: validValidationEntity1().status,
    comment: validValidationEntity1().comment,
  };
}

export function validUpdateValidationDtoApproved(): UpdateValidationDto {
  return {
    status: ValidationStatusEnum.APPROVED,
    comment: 'When fear hurts you, conquer it and defeat it!',
  };
}

export function validUpdateValidationDtoRejected(): UpdateValidationDto {
  return {
    status: ValidationStatusEnum.REJECTED,
    comment: 'You can make your own happiness.',
  };
}

export function validValidationEntity2() {
  return new ValidationEntity(
    validationId2,
    ValidationStatusEnum.PENDING,
    getDefaultUserValidationTest2(),
  );
}

export function validValidationDto2(): ValidationResponseDto {
  return {
    id: validationId2,
    userId: userId2,
    email: getDefaultUserValidationTest2().email,
    displayName: getDefaultUserValidationTest2().displayName,
    firstName: getDefaultUserValidationTest2().firstName,
    lastName: getDefaultUserValidationTest2().lastName,
    status: validValidationEntity2().status,
    comment: validValidationEntity2().comment,
  };
}

export function validValidationDocumentList() {
  return [validValidationDocument1(), validValidationDocument2()];
}

export function validValidationEntityList() {
  return [validValidationEntity1(), validValidationEntity2()];
}

export function validValidationDtoList() {
  return [validValidationDto1(), validValidationDto2()];
}

export function validValidationDocument1() {
  return {
    _id: validationId1,
    status: ValidationStatusEnum.PENDING,
    comment: '',
    user: validUserDocumentValidation1(),
  };
}

export function validValidationDocument2() {
  return {
    _id: validationId2,
    status: ValidationStatusEnum.PENDING,
    comment: '',
    user: validUserDocumentValidation1(),
  };
}

export function invalidValidationDocument() {
  return {
    _id: invalidValidationId,
    status: ValidationStatusEnum.REJECTED,
    comment: '',
    user: validUserDocumentValidation1(),
  };
}
