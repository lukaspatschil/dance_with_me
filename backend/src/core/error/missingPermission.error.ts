import { ForbiddenException } from '@nestjs/common';

export const MissingPermissionError = new ForbiddenException({
  error: 'missing_permission',
});
