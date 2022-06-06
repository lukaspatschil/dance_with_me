import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Test } from '@nestjs/testing';
import { AccessTokenGuard } from '../src/auth/auth.guard';
import { AuthGuardMock } from './stubs/auth.guard.mock';
import { Neo4jService } from 'nest-neo4j/dist';

describe('PaymentController (e2e)', () => {
  let app: INestApplication;
  let neo4J: Neo4jService;

  let testDatabaseStub: MongoMemoryServer;

  beforeEach(async () => {
    testDatabaseStub = await MongoMemoryServer.create();
    process.env['MONGODB_URI'] = testDatabaseStub.getUri();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AccessTokenGuard)
      .useClass(AuthGuardMock)
      .compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    neo4J = app.get(Neo4jService);
    await neo4J.write('MATCH (n) DETACH DELETE (n)');
    await neo4J.write('MATCH (n) DELETE (n)');
  });

  afterEach(async () => {
    await testDatabaseStub.stop();
    await neo4J.write('MATCH (n) DETACH DELETE (n)');
    await neo4J.write('MATCH (n) DELETE (n)');
    await app.close();
  });

  it('/event (GET)', () => {
    return request(app.getHttpServer())
      .get('/payment')
      .expect(HttpStatus.OK)
      .expect('payment service is live');
  });
});
