import { ConflictException } from '@nestjs/common';

export const AlreadyParticipatedConflictError = new ConflictException({
  error: 'already_participated',
});
