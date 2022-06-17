import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ValidationStatusEnum } from '../schema/enum/validationStatus.enum';

export class UpdateValidationDto {
  @IsNotEmpty()
  @IsEnum(ValidationStatusEnum)
  status!: ValidationStatusEnum;

  @IsOptional()
  comment?: string;
}
