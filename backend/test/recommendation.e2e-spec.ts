import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Test } from '@nestjs/testing';
import { AccessTokenGuard } from '../src/auth/auth.guard';
import { AuthGuardMock, mockedAuthHeader } from './stubs/auth.guard.mock';
import { connect, disconnect, model, Model } from 'mongoose';
import { EventDocument, EventSchema } from '../src/core/schema/event.schema';
import { GeolocationEnum } from '../src/core/schema/enum/geolocation.enum';
import {
  validAddress,
  validAddressDTO,
} from './test_data/openStreetMapApi.testData';
import { RoleEnum } from '../src/core/schema/enum/role.enum';
import { UserDocument, UserSchema } from '../src/core/schema/user.schema';
import { Neo4jService } from 'nest-neo4j/dist';
import { AuthUser } from '../src/auth/interfaces';
import {
  eventId1,
  eventId2,
  eventId3,
  eventId4,
  userId1,
  userId2,
  userId3,
} from './test_data/recommendation.testData';

/* eslint @typescript-eslint/no-magic-numbers: 0 */
/* eslint @typescript-eslint/naming-convention: 0 */

describe('Recommendation (e2e)', () => {
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
    testDatabaseStub = await MongoMemoryServer.create();
    process.env['MONGODB_URI'] = testDatabaseStub.getUri();
    await connect(testDatabaseStub.getUri());

    await eventModel.ensureIndexes();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AccessTokenGuard)
      .useClass(AuthGuardMock)
      .compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();

    neo4J = app.get(Neo4jService);
    await neo4J.write('MATCH (n) DETACH DELETE (n)');
  });

  afterEach(async () => {
    await disconnect();
    await testDatabaseStub.stop();
    await neo4J.write('MATCH (n) DETACH DELETE (n)');
    await app.close();
  });

  describe('/recommendation (Get)', () => {
    describe('Bad requests', () => {
      it('should return 400 if no longitude is provided', async () => {
        const authUserId = userId1;
        const authUser: AuthUser = {
          id: authUserId.toString(),
          displayName: 'Testo1',
          pictureUrl: 'http://test.com/image.png',
          role: RoleEnum.USER,
        };

        await addUser(userId1);

        return request(app.getHttpServer())
          .get('/recommendation')
          .set('Authorization', mockedAuthHeader(authUser))
          .query({ latitude: 1, radius: 100000000000 })
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should return 400 if no latitude is provided', async () => {
        const authUserId = userId1;
        const authUser: AuthUser = {
          id: authUserId.toString(),
          displayName: 'Testo1',
          pictureUrl: 'http://test.com/image.png',
          role: RoleEnum.USER,
        };

        await addUser(userId1);

        return request(app.getHttpServer())
          .get('/recommendation')
          .set('Authorization', mockedAuthHeader(authUser))
          .query({ longitude: 1, radius: 100000000000 })
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should return 400 if no radius is provided', async () => {
        const authUserId = userId1;
        const authUser: AuthUser = {
          id: authUserId.toString(),
          displayName: 'Testo1',
          pictureUrl: 'http://test.com/image.png',
          role: RoleEnum.USER,
        };

        await addUser(userId1);

        return request(app.getHttpServer())
          .get('/recommendation')
          .set('Authorization', mockedAuthHeader(authUser))
          .query({ longitude: 1, latitude: 1 })
          .expect(HttpStatus.BAD_REQUEST);
      });
    });

    it('should return 200 and an empty array because there the radius is too small', async () => {
      const authUserId = userId1;
      const authUser: AuthUser = {
        id: authUserId.toString(),
        displayName: 'Testo1',
        pictureUrl: 'http://test.com/image.png',
        role: RoleEnum.USER,
      };

      await addUser(userId1);
      await addUser(userId2);
      await addEvent(eventId1);
      await addEvent(eventId2);

      await addParticipationToEvents(userId1, eventId1);
      await addParticipationToEvents(userId2, eventId1);
      await addParticipationToEvents(userId2, eventId2);

      return request(app.getHttpServer())
        .get('/recommendation')
        .set('Authorization', mockedAuthHeader(authUser))
        .query({ longitude: 1, latitude: 1, radius: 1 })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toEqual([]);
        });
    });

    it('should return 200 and an array containing one event', async () => {
      const authUserId = userId1;
      const authUser: AuthUser = {
        id: authUserId.toString(),
        displayName: 'Testo1',
        pictureUrl: 'http://test.com/image.png',
        role: RoleEnum.USER,
      };

      await addUser(userId1);
      await addUser(userId2);
      await addEvent(eventId1);
      const dto = await addEvent(eventId2);

      await addParticipationToEvents(userId1, eventId1);
      await addParticipationToEvents(userId2, eventId1);
      await addParticipationToEvents(userId2, eventId2);

      return request(app.getHttpServer())
        .get('/recommendation')
        .set('Authorization', mockedAuthHeader(authUser))
        .query({ longitude: 1, latitude: 1, radius: 10000000 })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toEqual([dto]);
        });
    });

    it('should return 200 and an array containing two events', async () => {
      const authUserId = userId1;
      const authUser: AuthUser = {
        id: authUserId.toString(),
        displayName: 'Testo1',
        pictureUrl: 'http://test.com/image.png',
        role: RoleEnum.USER,
      };

      await addUser(userId1);
      await addUser(userId2);
      await addUser(userId3);

      await addEvent(eventId1);
      const dto2 = await addEvent(eventId2);
      const dto3 = await addEvent(eventId3);

      await addParticipationToEvents(userId1, eventId1);
      await addParticipationToEvents(userId2, eventId1);
      await addParticipationToEvents(userId2, eventId2);
      await addParticipationToEvents(userId3, eventId1);
      await addParticipationToEvents(userId3, eventId3);

      return request(app.getHttpServer())
        .get('/recommendation')
        .set('Authorization', mockedAuthHeader(authUser))
        .query({ longitude: 1, latitude: 1, radius: 100000000 })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toEqual([dto2, dto3]);
        });
    });

    it('should return 200 and an array containing two events ordered by the jaccard index', async () => {
      const authUserId = userId1;
      const authUser: AuthUser = {
        id: authUserId.toString(),
        displayName: 'Testo1',
        pictureUrl: 'http://test.com/image.png',
        role: RoleEnum.USER,
      };

      await addUser(userId1);
      await addUser(userId2);
      await addUser(userId3);

      await addEvent(eventId1);
      await addEvent(eventId2);
      const dto3 = await addEvent(eventId3);
      const dto4 = await addEvent(eventId4);

      await addParticipationToEvents(userId1, eventId1);
      await addParticipationToEvents(userId1, eventId2);
      await addParticipationToEvents(userId2, eventId1);
      await addParticipationToEvents(userId2, eventId2);
      await addParticipationToEvents(userId3, eventId1);
      await addParticipationToEvents(userId2, eventId3);
      await addParticipationToEvents(userId3, eventId4);

      return request(app.getHttpServer())
        .get('/recommendation')
        .set('Authorization', mockedAuthHeader(authUser))
        .query({ longitude: 1, latitude: 1, radius: 1000000 })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toEqual([dto3, dto4]);
        });
    });
  });

  async function addUser(userId: string) {
    // create user in neo4j
    await neo4J.write(`CREATE (u:User { id: '${userId.toString()}' })`);

    // create user in mongo
    const user = new userModel({
      _id: userId,
      role: RoleEnum.USER,
      displayName: 'Testo1',
      firstName: 'Tester',
      lastName: 'Tester',
      email: 'test@test.com',
      emailVerified: false,
      pictureUrl: 'http://test.com/image.png',
    });
    await user.save();
    return {
      id: userId.toString(),
      role: RoleEnum.USER,
      displayName: 'Testo1',
      firstName: 'Tester',
      lastName: 'Tester',
      email: 'test@test.com',
      pictureUrl: 'http://test.com/image.png',
    };
  }

  async function addEvent(eventId: string) {
    // create event in neo4j
    await neo4J.write(`CREATE (e:Event {id: '${eventId.toString()}'})`);

    // create event in mongo
    const event = new eventModel({
      _id: eventId,
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
      organizerId: '1',
      organizerName: 'Smitty Werben',
      participants: [],
      category: getCategory(),
      address: validAddress,
      paid: true,
    });
    await event.save();
    return {
      id: eventId.toString(),
      name: 'Test Event',
      description: 'Test Event Description',
      startDateTime: new Date('2023-01-01 10:00:00').toISOString(),
      endDateTime: new Date('2023-01-01 12:00:00').toISOString(),
      location: {
        longitude: 0,
        latitude: 0,
      },
      price: 12.5,
      public: true,
      imageId: '1',
      organizerId: '1',
      organizerName: 'Smitty Werben',
      participants: 0,
      userParticipates: false,
      category: getCategory(),
      address: validAddressDTO,
    };
  }

  async function addParticipationToEvents(userId: string, eventId: string) {
    // create participation in neo4j
    await neo4J.write(
      `MATCH (u:User {id: '${userId.toString()}'}) MATCH (e:Event {id: '${eventId.toString()}'}) CREATE (u)-[:PARTICIPATES]->(e)`,
    );
  }

  function getCategory() {
    return ['Salsa', 'Zouk'];
  }
});
