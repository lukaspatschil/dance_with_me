import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ValidationStatusEnum } from '../schema/enum/validationStatus.enum';

export class ValidationResponseDto {
  @IsNotEmpty()
  id!: string;

  @IsNotEmpty()
  userId!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  displayName!: string;

  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsNotEmpty()
  @IsEnum(ValidationStatusEnum)
  status!: ValidationStatusEnum;

  @IsOptional()
  comment?: string;
}
