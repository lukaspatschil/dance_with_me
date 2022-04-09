import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { NestApplicationBuilder } from '@jbiskur/nestjs-test-utilities';

describe('PaymentController (e2e)', () => {
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

  it('/event (GET)', () => {
    return request(app.getHttpServer())
      .get('/payment')
      .expect(200)
      .expect('payment service is live');
  });
});
