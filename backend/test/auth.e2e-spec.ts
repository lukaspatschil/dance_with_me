import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Test } from '@nestjs/testing';
import { connect, Model, model, disconnect } from 'mongoose';
import { UserDocument, UserSchema } from '../src/core/schema/user.schema';
import { validUserDocument } from './test_data/user.testData';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { interceptOauth } from './stubs/oauth.mock';
import { fingerPrintCookieName } from '../src/auth/constants';
import { AuthService } from '../src/auth/auth.service';
import { UserMapper } from '../src/core/mapper/user.mapper';

describe('AuthController (e2e)', () => {
  interceptOauth();
  let app: INestApplication;
  let configService: ConfigService;
  let authService: AuthService;

  let testDatabaseStub: MongoMemoryServer;
  const User: Model<UserDocument> = model<UserDocument>(
    'userdocuments',
    UserSchema,
  );
  let user: UserDocument;

  const state = 'testState';
  const code = 'testCode';
  const setFingerprintRegex =
    /^(?:__Secure-)?fingerprint=[\w\-]+; Max-Age=\d+; Path=\/; Expires=[\w\s,:]+; HttpOnly;/;
  const clearFingerprintRegex =
    /^(?:__Secure-)?fingerprint=; Path=\/; Expires=Thu, 01 Jan 1970 00:00:00 GMT/;

  beforeAll(async () => {
    testDatabaseStub = await MongoMemoryServer.create();
    process.env['MONGODB_URI'] = testDatabaseStub.getUri();
    await connect(testDatabaseStub.getUri());

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());
    app.use(cookieParser());

    await app.init();

    user = await User.create({
      ...validUserDocument,
      _id: 'mockUserId',
    });

    configService = app.get<ConfigService>(ConfigService);
    authService = app.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await disconnect();
    await testDatabaseStub.stop();
    await app.close();
  });

  describe('/auth/login_redirect/:provider', () => {
    it('should redirect to google login', () => {
      return request(app.getHttpServer())
        .get('/auth/login_redirect/google')
        .query({ state })
        .send()
        .expect((res) => {
          expect(res.redirect).toBe(true);
          expect(res.headers.location).toMatch(
            /^https:\/\/(?:[\w\-.]+\.)?google\.com/,
          );
          expect(res.headers.location).toContain(
            configService.get('GOOGLE_CLIENT_ID'),
          );
          expect(res.headers.location).toContain(state);
        });
    });

    it('should redirect to facebook login', () => {
      return request(app.getHttpServer())
        .get('/auth/login_redirect/facebook')
        .query({ state })
        .send()
        .expect((res) => {
          expect(res.redirect).toBe(true);
          expect(res.headers.location).toMatch(
            /^https:\/\/(?:[\w\-.]+\.)?facebook\.com/,
          );
          expect(res.headers.location).toContain(
            configService.get('FACEBOOK_CLIENT_ID'),
          );
          expect(res.headers.location).toContain(state);
        });
    });

    it('should return 403 if provider is not supported', () => {
      return request(app.getHttpServer())
        .get('/auth/login_redirect/foo')
        .send()
        .expect(403);
    });
  });

  describe('/auth/authorization_code/google', () => {
    it('should set cookie and redirect to frontend login callback with state and tokens', () => {
      const redirectUrl =
        configService.get('FRONTEND_URL') +
        configService.get('FRONTEND_LOGIN_CALLBACK');
      return request(app.getHttpServer())
        .get(`/auth/authorization_code/google`)
        .query({ code, state })
        .send()
        .expect('set-cookie', setFingerprintRegex)
        .expect((res) => {
          expect(res.redirect).toBe(true);
          expect(res.headers.location).toContain(redirectUrl);
          expect(res.headers.location).toContain(state);
          expect(res.headers.location).toMatch(/access_token=[\w.-]+/);
          expect(res.headers.location).toMatch(/refresh_token=[\w.-]+/);
          expect(res.headers.location).toMatch(/expires_at=\d+/);
        });
    });
  });

  describe('/auth/authorization_code/facebook', () => {
    it('should set cookie and redirect to frontend login callback with state and tokens', () => {
      const redirectUrl =
        configService.get('FRONTEND_URL') +
        configService.get('FRONTEND_LOGIN_CALLBACK');
      return request(app.getHttpServer())
        .get(`/auth/authorization_code/facebook`)
        .query({ code, state })
        .send()
        .expect('set-cookie', setFingerprintRegex)
        .expect((res) => {
          expect(res.redirect).toBe(true);
          expect(res.headers.location).toContain(redirectUrl);
          expect(res.headers.location).toContain(state);
          expect(res.headers.location).toMatch(/access_token=[\w.-]+/);
          expect(res.headers.location).toMatch(/refresh_token=[\w.-]+/);
          expect(res.headers.location).toMatch(/expires_at=\d+/);
        });
    });
  });

  const authenticate = async () => {
    return await authService.authenticateUser(
      UserMapper.mapDocumentToEntity(user),
    );
  };

  describe('/auth/refresh_token', () => {
    it('should set new cookie and return new tokens', async () => {
      const tokens = await authenticate();
      return request(app.getHttpServer())
        .post('/auth/refresh_token')
        .set('Cookie', [`${fingerPrintCookieName}=${tokens.fingerPrint}`])
        .send({ refreshToken: tokens.refreshToken })
        .expect(200)
        .expect('set-cookie', setFingerprintRegex)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.refreshToken).toBeDefined();
          expect(res.body.expiresAt).toBeDefined();
        });
    });

    it('should allow subsequent requests with updated refresh token and fingerprint', async () => {
      const tokens = await authenticate();
      const agent = request.agent(app.getHttpServer());
      const res = await agent
        .post('/auth/refresh_token')
        .set('Cookie', [`${fingerPrintCookieName}=${tokens.fingerPrint}`])
        .send({ refreshToken: tokens.refreshToken });
      return agent
        .post('/auth/refresh_token')
        .send({ refreshToken: res.body.refreshToken })
        .expect(200);
    });

    it('should not allow refresh token to be reused', async () => {
      const tokens = await authenticate();
      const agent = request.agent(app.getHttpServer());
      await agent
        .post('/auth/refresh_token')
        .set('Cookie', [`${fingerPrintCookieName}=${tokens.fingerPrint}`])
        .set('Authorization', `Bearer ${tokens.refreshToken}`)
        .send();
      return agent
        .post('/auth/refresh_token')
        .set('Authorization', `Bearer ${tokens.refreshToken}`)
        .send()
        .expect(401);
    });
  });

  describe('/auth/revoke', () => {
    it('should clear cookie', async () => {
      const tokens = await authenticate();
      return request(app.getHttpServer())
        .post('/auth/revoke')
        .set('Cookie', [`${fingerPrintCookieName}=${tokens.fingerPrint}`])
        .send({ refreshToken: tokens.refreshToken })
        .expect(204)
        .expect('set-cookie', clearFingerprintRegex);
    });

    it('should not allow refresh token to be reused', async () => {
      const tokens = await authenticate();
      const agent = request.agent(app.getHttpServer());
      await agent
        .post('/auth/revoke')
        .set('Cookie', [`${fingerPrintCookieName}=${tokens.fingerPrint}`])
        .set('Authorization', `Bearer ${tokens.refreshToken}`)
        .send();
      return agent
        .post('/auth/refresh_token')
        .set('Authorization', `Bearer ${tokens.refreshToken}`)
        .send()
        .expect(401);
    });
  });

  describe('/auth/force_logout', () => {
    it('should clear cookie', async () => {
      const tokens = await authenticate();
      return request(app.getHttpServer())
        .post('/auth/force_logout')
        .set('Cookie', [`${fingerPrintCookieName}=${tokens.fingerPrint}`])
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send()
        .expect(204)
        .expect('set-cookie', clearFingerprintRegex);
    });

    it('should not allow refresh token to be reused', async () => {
      const tokens = await authenticate();
      const agent = request.agent(app.getHttpServer());
      await agent
        .post('/auth/force_logout')
        .set('Cookie', [`${fingerPrintCookieName}=${tokens.fingerPrint}`])
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send();
      return agent
        .post('/auth/refresh_token')
        .set('Authorization', `Bearer ${tokens.refreshToken}`)
        .send()
        .expect(401);
    });
  });

  describe('full authentication flow and authorization', () => {
    it('should allow logging in with google, refreshing and then revoking the token', async () => {
      const agent = request.agent(app.getHttpServer());
      const authRes = await agent
        .get(`/auth/authorization_code/google`)
        .query({ code, state })
        .send()
        .expect((res) => res.redirect);
      const fragment = authRes.headers['location'].split('#')[1];
      const refreshToken = fragment.match(/refresh_token=(?<token>[^&]*)/)
        .groups.token;

      const refreshRes = await agent
        .post('/auth/refresh_token')
        .send({ refreshToken })
        .expect(200);

      await agent
        .post('/auth/revoke')
        .send({ refreshToken: refreshRes.body.refreshToken })
        .expect(204)
        .expect('set-cookie', clearFingerprintRegex);

      return agent
        .post('/auth/refresh_token')
        .send({ refreshToken: refreshRes.body.refreshToken })
        .expect(401);
    });

    it('should allow logging in with facebook and revoking all sessions', async () => {
      const agent = request.agent(app.getHttpServer());
      const authRes = await agent
        .get(`/auth/authorization_code/facebook`)
        .query({ code, state })
        .send()
        .expect((res) => res.redirect);
      const fragment = authRes.headers['location'].split('#')[1];
      const accessToken = fragment.match(/access_token=(?<token>[^&]*)/).groups
        .token;

      await agent
        .post('/auth/force_logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send()
        .expect(204);

      return agent
        .post('/auth/refresh_token')
        .send({ refreshToken: authRes.body.refreshToken })
        .expect(401);
    });
  });
});
