import { createInterceptor, IsomorphicRequest } from '@mswjs/interceptors';
import nodeInterceptors from '@mswjs/interceptors/lib/presets/node';
import { HttpStatus } from '@nestjs/common';

export const interceptOauth = () => {
  const interceptor = createInterceptor({
    modules: nodeInterceptors,
    resolver(request: IsomorphicRequest): any {
      if (request.url.host === 'www.googleapis.com') {
        if (
          request.method === 'POST' &&
          request.url.pathname.match(/^\/oauth2[^?#]*token/)
        ) {
          return {
            status: HttpStatus.OK,
            statusText: 'OK',
            body: '{"access_token":"google-token-mock","expires_in":3599,"scope":"openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile","token_type":"Bearer","id_token":"eyJhbGciOiJSUzI1NiIsImtpZCI6ImZjYmQ3ZjQ4MWE4MjVkMTEzZTBkMDNkZDk0ZTYwYjY5ZmYxNjY1YTIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIyODg5MTg0Mjg4NzktcWdubzU0Nm9qOXNmdnVkNXU5cm9lb3V2OGQwYWZzbzcuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIyODg5MTg0Mjg4NzktcWdubzU0Nm9qOXNmdnVkNXU5cm9lb3V2OGQwYWZzbzcuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDk0ODczNjQ3NzY3MzgyMDQ1ODQiLCJlbWFpbCI6InRpbi5wZWNpcmVwQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiMWViMkV2WjVhWWxPbUYyOUtRNVo2USIsIm5hbWUiOiJUaW4gUGVjaXJlcCIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS0vQU9oMTRHaFFMb1Z1dDVjbDBPb0VWVTZ2c3o5WjZQcFJLVjM0MWVrcFpHY1dfUT1zOTYtYyIsImdpdmVuX25hbWUiOiJUaW4iLCJmYW1pbHlfbmFtZSI6IlBlY2lyZXAiLCJsb2NhbGUiOiJlbi1HQiIsImlhdCI6MTY1MTc4MDc0OSwiZXhwIjoxNjUxNzg0MzQ5fQ.Ka7FCsuA5_aJVMzcqJIgyaQM2LNcZxXqPsP07TElMS7HRHKglhr50i5_pIeVoK0IiAbaYUvtaEyYGF9eOZjqjYmwi2AdfyPuACCpjfUQGgWc66qD481ZM4xOA3-kN6-NHdOFNKbu_17LARd4ItE5ZZwzc1ekMNEYkCEa6eKsPfjLd8VXtq65w3tb1GIVyYgfMeHXejdJ6zaBW0ZYpG-tmjREMEjgALNTJcJ8ye4CyptxKGDdCZc4NVPb5sPur1nI2LjyGtimwEEv4hA54E_3W2rWgKPtnj51Lqakag8jJjig6df2lpFgq2stv8KGbn4t9Jt--lfyzyEQYb0Qfl0Olg"}',
          };
        } else if (
          request.method === 'GET' &&
          request.url.pathname.match(/^\/oauth2[^?#]*userinfo/)
        ) {
          return {
            status: HttpStatus.OK,
            statusText: 'OK',
            body: '{"sub":"109487364776738204584","name":"Tin Pecirep","given_name":"Tin","family_name":"Pecirep","picture":"https://lh3.googleusercontent.com/a-/AOh14GhQLoVut5cl0OoEVU6vsz9Z6PpRKV341ekpZGcW_Q=s96-c","email":"tin.pecirep@gmail.com","email_verified":true,"locale":"en-GB"}',
          };
        }
      } else if (request.url.host === 'graph.facebook.com') {
        if (
          request.method === 'POST' &&
          request.url.pathname.match(/^[^?#]*\/oauth\/access_token/)
        ) {
          return {
            status: HttpStatus.OK,
            statusText: 'OK',
            body: '{"access_token":"facebook-token-mock","token_type":"bearer","expires_in":5183999,"auth_type":"rerequest"}',
          };
        } else if (
          request.method === 'GET' &&
          request.url.pathname.match(/^[^?#]*\/me/)
        ) {
          return {
            status: HttpStatus.OK,
            statusText: 'OK',
            body: '{"id":"5010619715642412","name":"Tin Pecirep","picture":{"data":{"height":50,"is_silhouette":false,"url":"https:\\/\\/platform-lookaside.fbsbx.com\\/platform\\/profilepic\\/?asid=5010619715642412&height=50&width=50&ext=1654374500&hash=AeSdRv6dN9ekLHTqf6s","width":50}},"email":"tin.pecirep\u0040gmail.com","first_name":"Tin","last_name":"Pecirep"}',
          };
        }
      }
    },
  });
  interceptor.apply();
};
