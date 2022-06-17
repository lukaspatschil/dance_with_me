import { ConflictException } from '@nestjs/common';

export const ValidationRequestAlreadyExistsError = new ConflictException({
  error: 'validation_request_already_exists',
});
