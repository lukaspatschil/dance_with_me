import { NotFoundException } from '@nestjs/common';

export const NotFoundError = new NotFoundException({
  error: 'not_found',
});
