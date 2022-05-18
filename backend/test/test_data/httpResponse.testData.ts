import { AxiosResponse } from 'axios';

export const notFoundResponse = { error: 'not_found' };
export const deleteResponse = {};
export const badRequestResponse = {
  statusCode: 400,
  message: 'Bad Request',
};
export function axiosResponse200(url: string) {
  const resp = {
    headers: {},
    config: { url: url },
    status: 200,
    statusText: 'OK',
  } as AxiosResponse;
  return resp;
}
export function axiosResponse401(url: string) {
  const resp = {
    headers: {},
    config: { url: url },
    status: 401,
    statusText: 'Unauthorized',
  } as AxiosResponse;
  return resp;
}
