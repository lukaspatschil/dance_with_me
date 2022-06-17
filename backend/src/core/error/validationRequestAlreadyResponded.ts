import { ConflictException } from '@nestjs/common';

export const ValidationRequestAlreadyResponded = new ConflictException({
  error: 'validation_request_already_responded',
});
