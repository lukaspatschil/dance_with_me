import { ValidationEnum } from '../enums/validation.enum';

export class ValidationRequestEntity {
  id: string;

  userId: string;

  email: string;

  displayName: string;

  firstName?: string;

  lastName?: string;

  status: ValidationEnum;

  comment?: string;

  image?: string;

  constructor(id: string, userId: string, email: string, displayName: string, status: ValidationEnum, firstName?: string, lastName?: string, comment?: string) {
    this.id = id;
    this.userId = userId;
    this.email = email;
    this.displayName = displayName;
    this.firstName = firstName;
    this.lastName = lastName;
    this.status = status;
    this.comment = comment;
  }
}
