import { ValidationRequestDto } from '../dto/validationRequest.dto';
import { ValidationRequestEntity } from '../entities/validationRequestEntity';

export class ValidationMapper {
  static dtoToEntity(entry: ValidationRequestDto): ValidationRequestEntity | null {
    if (entry.id &&
      entry.userId &&
      entry.email &&
      entry.displayName &&
      entry.status) {
      return new ValidationRequestEntity(
        entry.id,
        entry.userId,
        entry.email,
        entry.displayName,
        entry.status,
        entry.firstName,
        entry.lastName,
        entry.comment);
    } else {
      return null;
    }
  }
}
