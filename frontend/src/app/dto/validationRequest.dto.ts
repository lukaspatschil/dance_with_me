import { ValidationEnum } from '../enums/validation.enum';

export class ValidationRequestDto {
  id?: string;

  userId?: string;

  email?: string;

  displayName?: string;

  firstName?: string;

  lastName?: string;

  status?: ValidationEnum;

  comment?: string;
}
