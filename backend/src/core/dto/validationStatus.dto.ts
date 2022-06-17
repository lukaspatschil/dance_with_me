import { IsEnum } from 'class-validator';
import { ValidationStatusEnum } from '../schema/enum/validationStatus.enum';

export class ValidationStatusDto {
  @IsEnum(ValidationStatusEnum)
  status: ValidationStatusEnum = ValidationStatusEnum.PENDING;
}
