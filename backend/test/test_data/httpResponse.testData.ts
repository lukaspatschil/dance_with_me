import { AxiosResponse } from 'axios';
import { HttpStatus } from '@nestjs/common';

export const notFoundResponse = { error: 'not_found' };
export const deleteResponse = {};
export const badRequestResponse = {
  statusCode: HttpStatus.BAD_REQUEST,
  message: 'Bad Request',
};
export function axiosResponse200(url: string) {
  return {
    headers: {},
    config: { url: url },
    status: HttpStatus.OK,
    statusText: 'OK',
  } as AxiosResponse;
}
export function axiosResponse401(url: string) {
  return {
    headers: {},
    config: { url: url },
    status: HttpStatus.UNAUTHORIZED,
    statusText: 'Unauthorized',
  } as AxiosResponse;
}
export const internalErrorResponse = {
  statusCode: 500,
  message: 'Internal Server Error',
};
