import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Test } from '@nestjs/testing';
import { connect, disconnect, model, Model } from 'mongoose';
import { UserDocument, UserSchema } from '../src/core/schema/user.schema';
import { RoleEnum } from '../src/core/schema/enum/role.enum';
import {
  deleteResponse,
  notFoundResponse,
} from './test_data/httpResponse.testData';
import { nonExistingObjectId, validObjectId } from './test_data/user.testData';
import { AccessTokenGuard } from '../src/auth/auth.guard';
import { AuthGuardMock, mockedAuthHeader } from './stubs/auth.guard.mock';
import { AuthUser } from '../src/auth/interfaces';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  let testDatabaseStub: MongoMemoryServer;
  const User: Model<UserDocument> = model<UserDocument>(
    'userdocuments',
    UserSchema,
  );

  beforeEach(async () => {
    testDatabaseStub = await MongoMemoryServer.create();
    process.env['MONGODB_URI'] = testDatabaseStub.getUri();
    await connect(testDatabaseStub.getUri());

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AccessTokenGuard)
      .useClass(AuthGuardMock)
      .compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  afterEach(async () => {
    await disconnect();
    await testDatabaseStub.stop();
    await app.close();
  });

  describe('/user (DELETE)', () => {
    it('should return 204', async () => {
      //Given
      const user = new User({
        _id: validObjectId.toString(),
        displayName: 'Bill',
        email: 'bill@initech.com',
        role: RoleEnum.USER,
      });

      await user.save();

      return request(app.getHttpServer())
        .delete(`/user/${validObjectId.toString()}`)
        .send()
        .expect(204)
        .expect(deleteResponse);
    });

    it('should return 404', () => {
      return request(app.getHttpServer())
        .delete(`/user/${nonExistingObjectId}`)
        .send()
        .expect(HttpStatus.NOT_FOUND)
        .expect(notFoundResponse);
    });
  });

  describe('/user (GET)', () => {
    describe('when user has role user', () => {
      it('should return 200 when fetching their own userId', async () => {
        //Given
        const id = validObjectId.toString();

        const authUser: AuthUser = {
          id,
          displayName: 'Testo1',
          pictureUrl: 'http://test.com/image.png',
          role: RoleEnum.USER,
        };

        const user = new User({
          _id: id,
          role: RoleEnum.USER,
          displayName: 'Testo1',
          firstName: 'Tester',
          lastName: 'Tester',
          email: 'test@test.com',
          emailVerified: false,
          pictureUrl: 'http://test.com/image.png',
        });
        await user.save();
        const userDto = {
          id,
          role: RoleEnum.USER,
          displayName: 'Testo1',
          firstName: 'Tester',
          lastName: 'Tester',
          email: 'test@test.com',
          pictureUrl: 'http://test.com/image.png',
        };

        return request(app.getHttpServer())
          .get(`/user/${id}`)
          .set('Authorization', mockedAuthHeader(authUser))
          .send()
          .expect(HttpStatus.OK)
          .expect((res) => {
            expect(res.body).toEqual(userDto);
          });
      });

      it("should return 403 when fetching someone else's userId", async () => {
        //Given
        const id = validObjectId.toString();

        const authUser: AuthUser = {
          id: '0',
          displayName: 'Other User',
          pictureUrl: 'http://test.com/image.png',
          role: RoleEnum.USER,
        };

        const user = new User({
          _id: id,
          role: RoleEnum.USER,
          displayName: 'Testo1',
          firstName: 'Tester',
          lastName: 'Tester',
          email: 'test@test.com',
          emailVerified: false,
          pictureUrl: 'http://test.com/image.png',
        });
        await user.save();

        return request(app.getHttpServer())
          .get(`/user/${nonExistingObjectId}`)
          .set('Authorization', mockedAuthHeader(authUser))
          .send()
          .expect(HttpStatus.FORBIDDEN)
          .expect({ error: 'missing_permission' });
      });
    });

    describe('when user has role admin', () => {
      it('should return 200 if user exists', async () => {
        //Given
        const authUser: AuthUser = {
          id: '0',
          displayName: 'Some Admin',
          pictureUrl: 'http://test.com/image.png',
          role: RoleEnum.ADMIN,
        };

        const user = new User({
          _id: validObjectId.toString(),
          role: RoleEnum.USER,
          displayName: 'Testo1',
          firstName: 'Tester',
          lastName: 'Tester',
          email: 'test@test.com',
          emailVerified: false,
          pictureUrl: 'http://test.com/image.png',
        });
        await user.save();
        const userDto = {
          id: validObjectId.toString(),
          role: RoleEnum.USER,
          displayName: 'Testo1',
          firstName: 'Tester',
          lastName: 'Tester',
          email: 'test@test.com',
          pictureUrl: 'http://test.com/image.png',
        };

        return request(app.getHttpServer())
          .get(`/user/${validObjectId.toString()}`)
          .set('Authorization', mockedAuthHeader(authUser))
          .send()
          .expect(HttpStatus.OK)
          .expect((res) => {
            expect(res.body).toEqual(userDto);
          });
      });

      it('should return 404 if user does not exist', async () => {
        const authUser: AuthUser = {
          id: '1',
          displayName: 'Some Admin',
          pictureUrl: 'http://test.com/image.png',
          role: RoleEnum.ADMIN,
        };
        return request(app.getHttpServer())
          .get(`/user/${nonExistingObjectId}`)
          .set('Authorization', mockedAuthHeader(authUser))
          .send()
          .expect(HttpStatus.NOT_FOUND)
          .expect(notFoundResponse);
      });
    });
  });
});
