import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { NestApplicationBuilder } from '@jbiskur/nestjs-test-utilities';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  let testDatabaseStub: MongoMemoryServer;

  beforeEach(async () => {
    testDatabaseStub = await MongoMemoryServer.create();
    process.env['MONGODB_URI'] = testDatabaseStub.getUri();

    app = await new NestApplicationBuilder()
      .withTestModule((builder) => builder.withModule(AppModule))
      .build();
  });

  afterEach(async () => {
    await testDatabaseStub.stop();
    await app.close();
  });

  it('/user (GET)', () => {
    return request(app.getHttpServer())
      .get('/user')
      .expect(200)
      .expect('Hello User!');
  });
});
