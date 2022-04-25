import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Test } from '@nestjs/testing';
import { connect, Model, model, disconnect } from 'mongoose';
import { UserDocument, UserSchema } from '../src/core/schema/user.schema';
import { RoleEnum } from '../src/core/schema/enum/role.enum';
import {
  deleteResponse,
  notFoundResponse,
} from './test_data/httpResponse.testData';
import { nonExistingObjectId, validObjectId } from './test_data/user.testData';

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
    }).compile();

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
        .expect(404)
        .expect(notFoundResponse);
    });
  });
});
