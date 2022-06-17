import { ValidationStatusEnum } from '../schema/enum/validationStatus.enum';
import { UserEntity } from './user.entity';

export class ValidationEntity {
  constructor(
    public id: string,
    public status: ValidationStatusEnum,
    public user: UserEntity,
  ) {}

  comment?: string;
}
