import { AxiosResponse } from 'axios';
import { HttpStatus } from '@nestjs/common';

export const notFoundResponse = { error: 'not_found' };
export const deleteResponse = {};
export const badRequestResponse = {
  statusCode: HttpStatus.BAD_REQUEST,
  message: 'Bad Request',
};
export function axiosResponse200(url: string) {
  const resp = {
    headers: {},
    config: { url: url },
    status: HttpStatus.OK,
    statusText: 'OK',
  } as AxiosResponse;
  return resp;
}
export function axiosResponse401(url: string) {
  const resp = {
    headers: {},
    config: { url: url },
    status: HttpStatus.UNAUTHORIZED,
    statusText: 'Unauthorized',
  } as AxiosResponse;
  return resp;
}
