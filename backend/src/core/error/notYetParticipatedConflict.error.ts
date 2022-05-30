import { ConflictException } from '@nestjs/common';

export const NotYetParticipatedConflictError = new ConflictException({
  error: 'not_yet_participated',
});
