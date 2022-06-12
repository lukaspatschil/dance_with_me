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
import { validObjectId2 } from './test_data/event.testData';
import { Neo4jService } from 'nest-neo4j/dist';

/* eslint @typescript-eslint/naming-convention: 0 */

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let neo4J: Neo4jService;
  let testDatabaseStub: MongoMemoryServer;
  const userModel: Model<UserDocument> = model<UserDocument>(
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
    neo4J = moduleRef.get(Neo4jService);

    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  afterEach(async () => {
    await disconnect();
    await testDatabaseStub.stop();
    await neo4J.write('MATCH (n) DETACH DELETE (n)');
    await app.close();
  });

  describe('/user (DELETE)', () => {
    it('should return 204 if user is deleting their own user resource', async () => {
      //Given
      const userId = validObjectId.toString();
      const user = new userModel({
        _id: userId,
        displayName: 'Bill',
        email: 'bill@initech.com',
        role: RoleEnum.USER,
      });
      const authHeader = mockedAuthHeader({
        id: userId,
        displayName: user.displayName,
        role: user.role,
      });

      await user.save();

      return request(app.getHttpServer())
        .delete(`/user/${userId}`)
        .set('Authorization', authHeader)
        .send()
        .expect(HttpStatus.NO_CONTENT)
        .expect(deleteResponse);
    });

    it('should return 403 if user is trying to delete another user', async () => {
      //Given
      const user = new userModel({
        _id: validObjectId.toString(),
        displayName: 'Bill',
        email: 'bill@initech.com',
        role: RoleEnum.USER,
      });
      const authHeader = mockedAuthHeader({
        id: validObjectId2.toString(),
        displayName: user.displayName,
        role: user.role,
      });

      await user.save();

      return request(app.getHttpServer())
        .delete(`/user/${validObjectId.toString()}`)
        .set('Authorization', authHeader)
        .send()
        .expect(HttpStatus.FORBIDDEN)
        .expect({ error: 'missing_permission' });
    });

    it('should allow admins to delete users', async () => {
      //Given
      const user = new userModel({
        _id: validObjectId.toString(),
        displayName: 'Bill',
        email: 'bill@initech.com',
        role: RoleEnum.USER,
      });
      const authHeader = mockedAuthHeader({
        id: validObjectId2.toString(),
        displayName: 'Some Admin',
        role: RoleEnum.ADMIN,
      });

      await user.save();

      return request(app.getHttpServer())
        .delete(`/user/${validObjectId.toString()}`)
        .set('Authorization', authHeader)
        .send()
        .expect(HttpStatus.NO_CONTENT)
        .expect(deleteResponse);
    });

    it('should return 404 if user does not exist', () => {
      const authHeader = mockedAuthHeader({
        id: validObjectId2.toString(),
        displayName: 'Some Admin',
        role: RoleEnum.ADMIN,
      });

      return request(app.getHttpServer())
        .delete(`/user/${nonExistingObjectId}`)
        .set('Authorization', authHeader)
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

        const user = new userModel({
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
          emailVerified: false,
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

        const user = new userModel({
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

        const user = new userModel({
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
          emailVerified: false,
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
