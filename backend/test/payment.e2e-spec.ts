import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Test } from '@nestjs/testing';
import { AccessTokenGuard } from '../src/auth/auth.guard';
import { AuthGuardMock, mockedAuthHeader } from './stubs/auth.guard.mock';
import { Neo4jService } from 'nest-neo4j/dist';
import { RoleEnum } from '../src/core/schema/enum/role.enum';
import { connect, disconnect, model, Model } from 'mongoose';
import { EventDocument, EventSchema } from '../src/core/schema/event.schema';
import { GeolocationEnum } from '../src/core/schema/enum/geolocation.enum';
import { validAddress } from './test_data/openStreetMapApi.testData';
import nodemailer from 'nodemailer';
import { UserDocument, UserSchema } from '../src/core/schema/user.schema';

describe('PaymentController (e2e)', () => {
  let app: INestApplication;
  let neo4J: Neo4jService;

  let testDatabaseStub: MongoMemoryServer;
  const eventModel: Model<EventDocument> = model<EventDocument>(
    'eventdocuments',
    EventSchema,
  );
  const userModel: Model<UserDocument> = model<UserDocument>(
    'userdocuments',
    UserSchema,
  );

  beforeEach(async () => {
    const etherealAccount = await nodemailer.createTestAccount();
    process.env['MAIL_HOST'] = etherealAccount.smtp.host;
    process.env['MAIL_PORT'] = etherealAccount.smtp.port.toString();
    process.env['MAIL_USER'] = etherealAccount.user;
    process.env['MAIL_PASSWORD'] = etherealAccount.pass;
    process.env['MAIL_FROM'] = `No Reply <${etherealAccount.user}>`;

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

    neo4J = app.get(Neo4jService);
    await neo4J.write('MATCH (n) DETACH DELETE (n)');
    await neo4J.write('MATCH (n) DELETE (n)');
  });

  afterEach(async () => {
    await disconnect();
    await testDatabaseStub.stop();
    await neo4J.write('MATCH (n) DETACH DELETE (n)');
    await neo4J.write('MATCH (n) DELETE (n)');
    await app.close();
  });

  describe('/payment (POST)', () => {
    it('should mark event as paid after successful payment', async () => {
      const user = new userModel({
        _id: 'google:123456',
        role: RoleEnum.ORGANISER,
        displayName: 'Oscar Organized',
        email: 'oscar@example.com',
        emailVerified: true,
      });
      await user.save();

      const event = new eventModel({
        name: 'Test Event',
        description: 'Test Event Description',
        startDateTime: new Date('2023-01-01 10:00:00'),
        endDateTime: new Date('2023-01-01 12:00:00'),
        location: {
          type: GeolocationEnum.POINT,
          coordinates: [0, 0],
        },
        price: 12.5,
        public: true,
        imageId: '1',
        organizerId: user.id,
        organizerName: user.displayName,
        participants: [],
        category: ['Salsa', 'Zouk'],
        address: validAddress,
        paid: false,
      });
      await event.save();

      const organizerAuthHeader = mockedAuthHeader({
        id: user.id,
        displayName: user.displayName,
        role: user.role,
      });

      await request(app.getHttpServer())
        .post('/payment')
        .set('Authorization', organizerAuthHeader)
        .send({
          eventId: event.id,
          paymentMethodId: 'pm_card_visa',
        })
        .expect(HttpStatus.NO_CONTENT);

      const eventAfterPayment = await eventModel.findById(event.id);
      expect(eventAfterPayment?.paid).toBe(true);
    });
  });
});
