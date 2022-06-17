import { ValidationEnum } from '../enums/validation.enum';

export class ValidationResponseDto {
  status: ValidationEnum;

  comment?: string;

  constructor(status: ValidationEnum, comment?: string) {
    this.status = status;
    this.comment = comment;
  }
}
