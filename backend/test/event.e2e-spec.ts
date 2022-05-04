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
  nonExistingObjectId,
  validObjectId1,
  validObjectId2,
  validObjectId3,
  validEventEntity,
  invalidObjectId,
} from './test_data/event.testData';
import { deleteResponse } from './test_data/httpResponse.testData';
import {
  validAddress,
  validAddressDTO,
} from './test_data/openStreetMapApi.testData';
import { RoleEnum } from '../src/core/schema/enum/role.enum';
import { validObjectId } from './test_data/user.testData';
import { UserDocument, UserSchema } from '../src/core/schema/user.schema';
import { Neo4jService } from 'nest-neo4j/dist';

/* eslint @typescript-eslint/no-magic-numbers: 0 */
/* eslint @typescript-eslint/naming-convention: 0 */

describe('EventController (e2e)', () => {
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

    neo4J = app.get(Neo4jService);

    await app.init();
  });

  afterEach(async () => {
    await disconnect();
    await testDatabaseStub.stop();
    await neo4J.write('MATCH (n) DETACH DELETE n');
    await app.close();
  });

  describe('/event (Post)', () => {
    const organizerAuthHeader = (
      organizerId?: string,
    ): ['Authorization', string] => [
      'Authorization',
      mockedAuthHeader({
        id: organizerId ?? validObjectId1.toString(),
        displayName: 'Oscar Organized',
        role: RoleEnum.ORGANISER,
      }),
    ];

    it('should return 201', () => {
      const dto = getDefaultCreateEventDTO();

      return request(app.getHttpServer())
        .post('/event')
        .set(...organizerAuthHeader(getDefaultEventDTO().organizerId))
        .send(dto)
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          // replace id with id from result
          const expectedValue = getDefaultEventDTO();
          expectedValue.id = res.body.id;
          expect(res.body).toEqual(expectedValue);
        });
    });

    it('should return 400 (empty object)', () => {
      return request(app.getHttpServer())
        .post('/event')
        .set(...organizerAuthHeader())
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 (name missing)', () => {
      const dto = getDefaultCreateEventDTO();
      dto.name = '';

      return request(app.getHttpServer())
        .post('/event')
        .set(...organizerAuthHeader())
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toContain('name should not be empty');
        });
    });

    it('should return 400 (description missing)', () => {
      const dto = getDefaultCreateEventDTO();
      dto.description = '';

      return request(app.getHttpServer())
        .post('/event')
        .set(...organizerAuthHeader())
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toContain('description should not be empty');
        });
    });

    it('should return 400 (startDateTime missing)', () => {
      const dto = getDefaultCreateEventDTO();
      dto.startDateTime = '';

      return request(app.getHttpServer())
        .post('/event')
        .set(...organizerAuthHeader())
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toContain(
            'startDateTime must be before the endDateTime',
          );
          expect(res.body.message[1]).toMatch(
            'minimal allowed date for startDateTime is',
          );
          expect(res.body.message).toContain(
            'startDateTime must be a Date instance',
          );
        });
    });

    it('should return 400 (endDateTime missing)', () => {
      const dto = getDefaultCreateEventDTO();
      dto.endDateTime = '';

      return request(app.getHttpServer())
        .post('/event')
        .set(...organizerAuthHeader())
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toContain(
            'endDateTime must be past the startDateTime',
          );
          expect(res.body.message[2]).toMatch(
            'minimal allowed date for endDateTime is',
          );
          expect(res.body.message).toContain(
            'endDateTime must be a Date instance',
          );
          expect(res.body.message).toContain(
            'startDateTime must be before the endDateTime',
          );
        });
    });

    it('should return 400 (longitude out of bounds)', () => {
      const dto = getDefaultCreateEventDTO();
      dto.location.longitude = -400;

      return request(app.getHttpServer())
        .post('/event')
        .set(...organizerAuthHeader())
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toContain(
            'location.longitude must be a longitude string or number',
          );
        });
    });

    it('should return 400 (latitude out of bounds)', () => {
      const dto = getDefaultCreateEventDTO();
      dto.location.latitude = -400;

      return request(app.getHttpServer())
        .post('/event')
        .set(...organizerAuthHeader())
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toContain(
            'location.latitude must be a latitude string or number',
          );
        });
    });

    it('should return 400 (price out of bounds)', () => {
      const dto = getDefaultCreateEventDTO();
      dto.price = -1234;

      return request(app.getHttpServer())
        .post('/event')
        .set(...organizerAuthHeader())
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toContain('price must not be less than 0');
        });
    });

    it('should return 400 (category empty)', () => {
      const dto = getDefaultCreateEventDTO();
      dto.category = [];

      return request(app.getHttpServer())
        .post('/event')
        .set(...organizerAuthHeader())
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toContain(
            'category must contain at least 1 elements',
          );
        });
    });

    it('should return 400 (category not CategoryEnum)', () => {
      const dto = getDefaultCreateEventDTO();
      dto.category = ['Jazz'];

      return request(app.getHttpServer())
        .post('/event')
        .set(...organizerAuthHeader())
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toContain(
            'each value in category must be a valid enum value',
          );
        });
    });

    it('should return 400', () => {
      const dto = getDefaultCreateEventDTO();
      dto.name = '';

      return request(app.getHttpServer())
        .post('/event')
        .set(...organizerAuthHeader())
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 403 if user is not organizer', () => {
      const dto = getDefaultCreateEventDTO();
      const userAuthHeader = mockedAuthHeader({
        id: validObjectId1.toString(),
        displayName: 'user1',
        role: RoleEnum.USER,
      });

      return request(app.getHttpServer())
        .post('/event')
        .set('Authorization', userAuthHeader)
        .send(dto)
        .expect(HttpStatus.FORBIDDEN)
        .expect((res) => {
          expect(res.body).toEqual(
            expect.objectContaining({ error: 'missing_permission' }),
          );
        });
    });
  });

  describe('/event (Get)', () => {
    it('should return 200 and an empty array because there is no data in the database', () => {
      return request(app.getHttpServer())
        .get('/event')
        .expect(HttpStatus.OK)
        .expect((res) => {
          // replace id with id from result
          expect(res.body.length).toEqual(0);
          expect(res.body).toEqual([]);
        });
    });

    describe('using the take parameter', () => {
      it('should return 200 and one element because the query parameter take=1 is used and one element is in the database', async () => {
        const event = new eventModel({
          _id: validObjectId1.toString(),
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
          participants: [],
          category: getCategory(),
          address: validAddress,
        });
        await event.save();
        const eventDto = {
          id: validObjectId1.toString(),
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
          participants: 0,
          userParticipates: false,
          category: getCategory(),
          address: validAddressDTO,
        };

        return request(app.getHttpServer())
          .get('/event')
          .query({ take: 1 })
          .expect(HttpStatus.OK)
          .expect((res) => {
            // replace id with id from result
            expect(res.body.length).toEqual(1);
            expect(res.body[0]).toEqual(eventDto);
          });
      });

      it('should return 200 and one element because the query parameter take=1 is used and two elements are in the database', async () => {
        const event1 = new eventModel({
          _id: validObjectId1.toString(),
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
          category: getCategory(),
          address: validAddress,
          participants: [],
        });
        await event1.save();
        const event1Dto = {
          id: validObjectId1.toString(),
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
          category: getCategory(),
          address: validAddressDTO,
          participants: 0,
          userParticipates: false,
        };

        const event2 = new eventModel({
          _id: validObjectId2.toString(),
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
          category: getCategory(),
          address: validAddress,
          participants: [],
        });
        await event2.save();

        return request(app.getHttpServer())
          .get('/event')
          .query({ take: 1 })
          .expect(HttpStatus.OK)
          .expect((res) => {
            // replace id with id from result
            expect(res.body.length).toEqual(1);
            expect(res.body[0]).toEqual(event1Dto);
          });
      });
    });

    describe('using the skip parameter', () => {
      it('should return 200 and no element because the query parameter skip=1 is used and no element is in the database', async () => {
        return request(app.getHttpServer())
          .get('/event')
          .query({ skip: 1 })
          .expect(HttpStatus.OK)
          .expect((res) => {
            // replace id with id from result
            expect(res.body.length).toEqual(0);
            expect(res.body).toEqual([]);
          });
      });

      it('should return 200 and no element because the query parameter skip=1 is used and one element is in the database', async () => {
        const event1 = new eventModel({
          _id: validObjectId1.toString(),
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
          category: getCategory(),
          address: validAddress,
          participants: [],
        });
        await event1.save();

        return request(app.getHttpServer())
          .get('/event')
          .query({ skip: 1 })
          .expect(HttpStatus.OK)
          .expect((res) => {
            expect(res.body.length).toEqual(0);
            expect(res.body).toEqual([]);
          });
      });

      it('should return 200 and one element because the query parameter skip=1 is used and two elements are in the database', async () => {
        const event1 = new eventModel({
          _id: validObjectId1.toString(),
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
          category: getCategory(),
          address: validAddress,
          participants: [],
        });
        await event1.save();

        const event2 = new eventModel({
          _id: validObjectId2.toString(),
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
          category: getCategory(),
          address: validAddress,
          participants: [],
        });
        await event2.save();
        const event2Dto = {
          id: validObjectId2.toString(),
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
          category: getCategory(),
          address: validAddressDTO,
          participants: 0,
          userParticipates: false,
        };

        return request(app.getHttpServer())
          .get('/event')
          .query({ skip: 1 })
          .expect(HttpStatus.OK)
          .expect((res) => {
            expect(res.body.length).toEqual(1);
            expect(res.body[0]).toEqual(event2Dto);
          });
      });
    });

    describe('using the skip and take parameter', () => {
      it('should return 200 and no element because the query parameter skip=1 and take=1 is used and no element is in the database', async () => {
        return request(app.getHttpServer())
          .get('/event')
          .query({ skip: 1, take: 1 })
          .expect(HttpStatus.OK)
          .expect((res) => {
            // replace id with id from result
            expect(res.body.length).toEqual(0);
            expect(res.body).toEqual([]);
          });
      });

      it('should return 200 and no element because the query parameter skip=1 and take=1 is used and one element is in the database', async () => {
        const event1 = new eventModel({
          _id: validObjectId1.toString(),
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
          category: getCategory(),
          address: validAddress,
          participants: [],
        });
        await event1.save();

        return request(app.getHttpServer())
          .get('/event')
          .query({ skip: 1, take: 1 })
          .expect(HttpStatus.OK)
          .expect((res) => {
            // replace id with id from result
            expect(res.body.length).toEqual(0);
            expect(res.body).toEqual([]);
          });
      });

      it('should return 200 and one element because the query parameter skip=1 and take=1 is used and two elements are in the database', async () => {
        const event1 = new eventModel({
          _id: validObjectId1.toString(),
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
          category: getCategory(),
          address: validAddress,
          participants: [],
        });
        await event1.save();

        const event2 = new eventModel({
          _id: validObjectId2.toString(),
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
          category: getCategory(),
          address: validAddress,
          participants: [],
        });
        await event2.save();
        const event2Dto = {
          id: validObjectId2.toString(),
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
          category: getCategory(),
          address: validAddressDTO,
          participants: 0,
          userParticipates: false,
        };

        return request(app.getHttpServer())
          .get('/event')
          .query({ skip: 1, take: 1 })
          .expect(HttpStatus.OK)
          .expect((res) => {
            // replace id with id from result
            expect(res.body.length).toEqual(1);
            expect(res.body[0]).toEqual(event2Dto);
          });
      });

      it('should return 200 and two elements because the query parameter skip=1 and take=2 is used and three elements are in the database', async () => {
        const event1 = new eventModel({
          _id: validObjectId1.toString(),
          name: 'test1',
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
          category: getCategory(),
          address: validAddress,
          participants: [],
        });
        await event1.save();

        const event2 = new eventModel({
          _id: validObjectId2.toString(),
          name: 'test2',
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
          category: getCategory(),
          address: validAddress,
          participants: [],
        });
        await event2.save();
        const event2Dto = {
          id: validObjectId2.toString(),
          name: 'test2',
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
          category: getCategory(),
          address: validAddressDTO,
          participants: 0,
          userParticipates: false,
        };

        const event3 = new eventModel({
          _id: validObjectId3.toString(),
          name: 'test3',
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
          category: getCategory(),
          address: validAddress,
          participants: [],
        });
        await event3.save();
        const event3Dto = {
          id: validObjectId3.toString(),
          name: 'test3',
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
          category: getCategory(),
          address: validAddressDTO,
          participants: 0,
          userParticipates: false,
        };

        return request(app.getHttpServer())
          .get('/event')
          .query({ skip: 1, take: 2 })
          .expect(HttpStatus.OK)
          .expect((res) => {
            expect(res.body.length).toEqual(2);
            expect(res.body[0]).toEqual(event2Dto);
            expect(res.body[1]).toEqual(event3Dto);
          });
      });
    });

    it('should return two elements because two elements are in the database and should be sorted by name', async () => {
      const event1 = new eventModel({
        _id: validObjectId1.toString(),
        name: 'test1',
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
        category: getCategory(),
        address: validAddress,
        participants: [],
      });
      await event1.save();
      const event1Dto = {
        id: validObjectId1.toString(),
        name: 'test1',
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
        category: getCategory(),
        address: validAddressDTO,
        participants: 0,
        userParticipates: false,
      };

      const event2 = new eventModel({
        _id: validObjectId2.toString(),
        name: 'test2',
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
        category: getCategory(),
        address: validAddress,
        participants: [],
      });
      await event2.save();
      const event2Dto = {
        id: validObjectId2.toString(),
        name: 'test2',
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
        category: getCategory(),
        address: validAddressDTO,
        participants: 0,
        userParticipates: false,
      };

      return request(app.getHttpServer())
        .get('/event')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.length).toEqual(2);
          expect(res.body[0]).toEqual(event1Dto);
          expect(res.body[1]).toEqual(event2Dto);
        });
    });

    it('should return two elements because two elements are in the database and should be sorted by startDateTime', async () => {
      const event1 = new eventModel({
        _id: validObjectId1.toString(),
        name: 'test1',
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
        category: getCategory(),
        address: validAddress,
        participants: [],
      });
      await event1.save();
      const event1Dto = {
        id: validObjectId1.toString(),
        name: 'test1',
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
        category: getCategory(),
        address: validAddressDTO,
        participants: 0,
        userParticipates: false,
      };

      const event2 = new eventModel({
        _id: validObjectId2.toString(),
        name: 'test2',
        description: 'Test Event Description',
        startDateTime: new Date('2023-01-02 12:00:00'),
        endDateTime: new Date('2023-01-02 14:00:00'),
        location: {
          type: GeolocationEnum.POINT,
          coordinates: [0, 0],
        },
        price: 12.5,
        public: true,
        imageId: '1',
        organizerId: '1',
        category: getCategory(),
        address: validAddress,
        participants: [],
      });
      await event2.save();
      const event2Dto = {
        id: validObjectId2.toString(),
        name: 'test2',
        description: 'Test Event Description',
        startDateTime: new Date('2023-01-02 12:00:00').toISOString(),
        endDateTime: new Date('2023-01-02 14:00:00').toISOString(),
        location: {
          longitude: 0,
          latitude: 0,
        },
        price: 12.5,
        public: true,
        imageId: '1',
        organizerId: '1',
        category: getCategory(),
        address: validAddressDTO,
        participants: 0,
        userParticipates: false,
      };

      return request(app.getHttpServer())
        .get('/event')
        .expect(HttpStatus.OK)
        .expect((res) => {
          // replace id with id from result
          expect(res.body.length).toEqual(2);
          expect(res.body[0]).toEqual(event1Dto);
          expect(res.body[1]).toEqual(event2Dto);
        });
    });

    it('should return one element because two elements are in the database and one is in the past and one is in the future', async () => {
      const event1 = new eventModel({
        _id: validObjectId1.toString(),
        name: 'test1',
        description: 'Test Event Description',
        startDateTime: new Date('2023-01-01 10:00:00'),
        endDateTime: new Date('2023-01-01 12:00:00'),
        location: {
          type: GeolocationEnum.POINT,
          coordinates: [0, 0],
        },
        address: validAddress,
        price: 12.5,
        public: true,
        imageId: '1',
        organizerId: '1',
        category: getCategory(),
        participants: [],
      });
      await event1.save();
      const event1Dto = {
        id: validObjectId1.toString(),
        name: 'test1',
        description: 'Test Event Description',
        startDateTime: new Date('2023-01-01 10:00:00').toISOString(),
        endDateTime: new Date('2023-01-01 12:00:00').toISOString(),
        location: {
          longitude: 0,
          latitude: 0,
        },
        address: validAddressDTO,
        price: 12.5,
        public: true,
        imageId: '1',
        organizerId: '1',
        category: getCategory(),
        participants: 0,
        userParticipates: false,
      };

      const event2 = new eventModel({
        _id: validObjectId2.toString(),
        name: 'test1',
        description: 'Test Event Description',
        startDateTime: new Date('2021-01-01 10:00:00'),
        endDateTime: new Date('2021-01-01 12:00:00'),
        location: {
          type: GeolocationEnum.POINT,
          coordinates: [0, 0],
        },
        address: validAddress,
        price: 12.5,
        public: true,
        imageId: '1',
        organizerId: '1',
        category: getCategory(),
        participants: [],
      });
      await event2.save();

      return request(app.getHttpServer())
        .get('/event')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.length).toEqual(1);
          expect(res.body[0]).toEqual(event1Dto);
        });
    });

    it('should return one element because two elements are in the database and one is in the past and one is in the future given a timestamp', async () => {
      const event1 = new eventModel({
        _id: validObjectId1.toString(),
        name: 'test1',
        description: 'Test Event Description',
        startDateTime: new Date('2024-02-01 10:00:00'),
        endDateTime: new Date('2024-02-01 12:00:00'),
        location: {
          type: GeolocationEnum.POINT,
          coordinates: [0, 0],
        },
        address: validAddress,
        price: 12.5,
        public: true,
        imageId: '1',
        organizerId: '1',
        category: getCategory(),
        participants: [],
      });
      await event1.save();
      const event1Dto = {
        id: validObjectId1.toString(),
        name: 'test1',
        description: 'Test Event Description',
        startDateTime: new Date('2024-02-01 10:00:00').toISOString(),
        endDateTime: new Date('2024-02-01 12:00:00').toISOString(),
        location: {
          longitude: 0,
          latitude: 0,
        },
        address: validAddressDTO,
        price: 12.5,
        public: true,
        imageId: '1',
        organizerId: '1',
        category: getCategory(),
        participants: 0,
        userParticipates: false,
      };

      const event2 = new eventModel({
        _id: validObjectId2.toString(),
        name: 'test1',
        description: 'Test Event Description',
        startDateTime: new Date('2023-01-01 10:00:00'),
        endDateTime: new Date('2023-01-01 12:00:00'),
        location: {
          type: GeolocationEnum.POINT,
          coordinates: [0, 0],
        },
        address: validAddress,
        price: 12.5,
        public: true,
        imageId: '1',
        organizerId: '1',
        category: getCategory(),
        participants: [],
      });
      await event2.save();

      return request(app.getHttpServer())
        .get('/event')
        .query({ startDate: new Date('2024-01-01 00:00:00').toISOString() })
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body.length).toEqual(1);
          expect(res.body[0]).toEqual(event1Dto);
        });
    });

    describe('find by location', () => {
      it('should return one elements because one element is in the database', async () => {
        const event1 = new eventModel({
          _id: validObjectId1.toString(),
          name: 'test1',
          description: 'Test Event Description',
          startDateTime: new Date('2023-01-01 10:00:00'),
          endDateTime: new Date('2023-01-01 12:00:00'),
          location: {
            type: GeolocationEnum.POINT,
            coordinates: [0, 0],
          },
          address: validAddress,
          price: 12.5,
          public: true,
          imageId: '1',
          organizerId: '1',
          category: getCategory(),
          participants: [],
        });
        await event1.save();
        const event1Dto = {
          id: validObjectId1.toString(),
          name: 'test1',
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
          category: getCategory(),
          address: validAddressDTO,
          participants: 0,
          userParticipates: false,
        };

        const body = {
          latitude: 0,
          longitude: 0,
        };

        return request(app.getHttpServer())
          .get('/event')
          .query(body)
          .expect(HttpStatus.OK)
          .expect((res) => {
            expect(res.body).toEqual([event1Dto]);
          });
      });

      it('should return two elements sorted by distance because two elements are in the database', async () => {
        const event1 = new eventModel({
          _id: validObjectId1.toString(),
          name: 'test1',
          description: 'Test Event Description',
          startDateTime: new Date('2023-01-01 10:00:00'),
          endDateTime: new Date('2023-01-01 12:00:00'),
          location: {
            type: GeolocationEnum.POINT,
            coordinates: [1, 1],
          },
          price: 12.5,
          public: true,
          imageId: '1',
          organizerId: '1',
          category: getCategory(),
          address: validAddress,
          participants: [],
        });
        await event1.save();
        const event1Dto = {
          id: validObjectId1.toString(),
          name: 'test1',
          description: 'Test Event Description',
          startDateTime: new Date('2023-01-01 10:00:00').toISOString(),
          endDateTime: new Date('2023-01-01 12:00:00').toISOString(),
          location: {
            longitude: 1,
            latitude: 1,
          },
          price: 12.5,
          public: true,
          imageId: '1',
          organizerId: '1',
          participants: 0,
          category: getCategory(),
          address: validAddressDTO,
          userParticipates: false,
        };

        const event2 = new eventModel({
          _id: validObjectId2.toString(),
          name: 'test2',
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
          category: getCategory(),
          address: validAddress,
          participants: [],
        });
        await event2.save();
        const event2Dto = {
          id: validObjectId2.toString(),
          name: 'test2',
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
          category: getCategory(),
          address: validAddressDTO,
          participants: 0,
          userParticipates: false,
        };

        const query = {
          latitude: 0,
          longitude: 0,
          radius: 500000,
        };

        return request(app.getHttpServer())
          .get('/event')
          .query(query)
          .expect(HttpStatus.OK)
          .expect((res) => {
            expect(res.body.length).toEqual(2);
            expect(res.body).toEqual([event2Dto, event1Dto]);
            expect(res.body[0]).toEqual(event2Dto);
            expect(res.body[1]).toEqual(event1Dto);
          });
      });

      it('should return two elements sorted by date because two elements are in the database and have the same distance', async () => {
        const event1 = new eventModel({
          _id: validObjectId1.toString(),
          name: 'test1',
          description: 'Test Event Description',
          startDateTime: new Date('2023-01-01 10:00:00'),
          endDateTime: new Date('2023-01-01 12:00:00'),
          location: {
            type: GeolocationEnum.POINT,
            coordinates: [1, 1],
          },
          price: 12.5,
          public: true,
          imageId: '1',
          organizerId: '1',
          category: getCategory(),
          address: validAddress,
          participants: [],
        });
        await event1.save();
        const event1Dto = {
          id: validObjectId1.toString(),
          name: 'test1',
          description: 'Test Event Description',
          startDateTime: new Date('2023-01-01 10:00:00').toISOString(),
          endDateTime: new Date('2023-01-01 12:00:00').toISOString(),
          location: {
            longitude: 1,
            latitude: 1,
          },
          price: 12.5,
          public: true,
          imageId: '1',
          organizerId: '1',
          category: getCategory(),
          address: validAddressDTO,
          participants: 0,
          userParticipates: false,
        };

        const event2 = new eventModel({
          _id: validObjectId2.toString(),
          name: 'test2',
          description: 'Test Event Description',
          startDateTime: new Date('2023-01-02 10:00:00'),
          endDateTime: new Date('2023-01-02 12:00:00'),
          location: {
            type: GeolocationEnum.POINT,
            coordinates: [1, 1],
          },
          price: 12.5,
          public: true,
          imageId: '1',
          organizerId: '1',
          category: getCategory(),
          address: validAddress,
          participants: [],
        });
        await event2.save();
        const event2Dto = {
          id: validObjectId2.toString(),
          name: 'test2',
          description: 'Test Event Description',
          startDateTime: new Date('2023-01-02 10:00:00').toISOString(),
          endDateTime: new Date('2023-01-02 12:00:00').toISOString(),
          location: {
            longitude: 1,
            latitude: 1,
          },
          price: 12.5,
          public: true,
          imageId: '1',
          organizerId: '1',
          category: getCategory(),
          address: validAddressDTO,
          participants: 0,
          userParticipates: false,
        };

        const body = {
          latitude: 1,
          longitude: 1,
        };

        return request(app.getHttpServer())
          .get('/event')
          .send(body)
          .expect(HttpStatus.OK)
          .expect((res) => {
            expect(res.body).toEqual([event1Dto, event2Dto]);
          });
      });
    });
  });

  describe('/event/id (Get)', () => {
    it('should return 404 because the database is empty', () => {
      return request(app.getHttpServer())
        .get('/event/' + nonExistingObjectId)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return the correct element', async () => {
      const event1 = new eventModel({
        _id: validObjectId1.toString(),
        name: 'test1',
        description: 'Test Event Description',
        startDateTime: new Date('2023-01-01 10:00:00'),
        endDateTime: new Date('2023-01-01 12:00:00'),
        location: {
          type: GeolocationEnum.POINT,
          coordinates: [1, 2],
        },
        price: 12.5,
        public: true,
        imageId: '1',
        organizerId: '1',
        category: getCategory(),
        address: validAddress,
        participants: [],
      });
      await event1.save();
      const event1Dto = {
        id: validObjectId1.toString(),
        name: 'test1',
        description: 'Test Event Description',
        startDateTime: new Date('2023-01-01 10:00:00').toISOString(),
        endDateTime: new Date('2023-01-01 12:00:00').toISOString(),
        location: {
          longitude: 1,
          latitude: 2,
        },
        price: 12.5,
        public: true,
        imageId: '1',
        organizerId: '1',
        category: getCategory(),
        address: validAddressDTO,
        participants: 0,
        userParticipates: false,
      };

      return request(app.getHttpServer())
        .get('/event/' + validObjectId1)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toEqual(event1Dto);
        });
    });
  });

  describe('/event (Delete)', () => {
    it('should return 204', async () => {
      const event = new eventModel({
        _id: validObjectId1.toString(),
        name: 'test1',
        description: 'Test Event Description',
        startDateTime: new Date('2023-01-01 10:00:00'),
        endDateTime: new Date('2023-01-01 12:00:00'),
        location: {
          type: GeolocationEnum.POINT,
          coordinates: [1, 2],
        },
        price: 12.5,
        public: true,
        imageId: '1',
        organizerId: '1',
        category: getCategory(),
        address: validAddress,
      });
      await event.save();

      return request(app.getHttpServer())
        .delete(`/event/${event._id}`)
        .send()
        .expect(HttpStatus.NO_CONTENT)
        .expect(deleteResponse);
    });

    it('should return 404', async () => {
      return request(app.getHttpServer())
        .delete(`/event/${nonExistingObjectId.toString()}`)
        .send()
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('/event/:eventid/participate (Post)', () => {
    it('should add participation at event', async () => {
      const event = new eventModel({
        _id: validObjectId1.toString(),
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
        category: getCategory(),
        address: validAddress,
      });
      await event.save();

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
        .post('/event/' + validObjectId1.toString() + '/participation')
        .set('Authorization', authHeader)
        .expect(HttpStatus.NO_CONTENT);
    });
  });

  describe('/event/:eventid/participate (Delete)', () => {
    it('should delete the participation at a non existing event and throw a not found error', async () => {
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
        .delete('/event/' + validObjectId1.toString() + '/participation')
        .set('Authorization', authHeader)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should delete participation at an event where the user did not participate and throw a conflict exception', async () => {
      const event = new eventModel({
        _id: validObjectId1.toString(),
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
        category: getCategory(),
        address: validAddress,
        participants: [],
      });
      await event.save();

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
        .delete('/event/' + validObjectId1.toString() + '/participation')
        .set('Authorization', authHeader)
        .expect(HttpStatus.CONFLICT);
    });

    it('should delete participation at an existing event where the user participated and return the status code 204', async () => {
      const event = new eventModel({
        _id: validObjectId1.toString(),
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
        category: getCategory(),
        address: validAddress,
        participants: [validObjectId.toString()],
      });
      await event.save();

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
        .delete('/event/' + validObjectId1.toString() + '/participation')
        .set('Authorization', authHeader)
        .expect(HttpStatus.NO_CONTENT);
    });
  });

  it('delete User should remove all future participations', async () => {
    // event 1
    const startDate1 = new Date(addMinutes(new Date(), -30).toISOString());
    const endDate1 = new Date(addMinutes(new Date(), -10).toISOString());
    const event1 = new eventModel({
      _id: validObjectId1.toString(),
      name: 'test1',
      description: 'Test Event Description',
      startDateTime: startDate1,
      endDateTime: endDate1,
      location: {
        type: GeolocationEnum.POINT,
        coordinates: [1, 2],
      },
      price: 12.5,
      public: true,
      imageId: '1',
      organizerId: '1',
      category: getCategory(),
      address: validAddress,
      participants: [],
    });
    await event1.save();
    const event1Dto = {
      id: validObjectId1.toString(),
      name: 'test1',
      description: 'Test Event Description',
      startDateTime: startDate1.toISOString(),
      endDateTime: endDate1.toISOString(),
      location: {
        longitude: 1,
        latitude: 2,
      },
      price: 12.5,
      public: true,
      imageId: '1',
      organizerId: '1',
      category: getCategory(),
      address: validAddressDTO,
      participants: 1,
      userParticipates: true,
    };

    // event 2
    const startDate2 = new Date(addMinutes(new Date(), 10).toISOString());
    const endDate2 = new Date(addMinutes(new Date(), 30).toISOString());
    const event2 = new eventModel({
      _id: validObjectId2.toString(),
      name: 'test1',
      description: 'Test Event Description',
      startDateTime: startDate2,
      endDateTime: endDate2,
      location: {
        type: GeolocationEnum.POINT,
        coordinates: [1, 2],
      },
      price: 12.5,
      public: true,
      imageId: '1',
      organizerId: '1',
      category: getCategory(),
      address: validAddress,
      participants: [],
    });
    await event2.save();
    const event2Dto = {
      id: validObjectId2.toString(),
      name: 'test1',
      description: 'Test Event Description',
      startDateTime: startDate2.toISOString(),
      endDateTime: endDate2.toISOString(),
      location: {
        longitude: 1,
        latitude: 2,
      },
      price: 12.5,
      public: true,
      imageId: '1',
      organizerId: '1',
      category: getCategory(),
      address: validAddressDTO,
      participants: 0,
      userParticipates: false,
    };

    //save user
    const userId = validObjectId.toString();
    const user = new userModel({
      _id: userId,
      displayName: 'Bill',
      email: 'bill@initech.com',
      role: RoleEnum.USER,
    });
    await user.save();

    const authHeader = mockedAuthHeader({
      id: userId,
      displayName: user.displayName,
      role: user.role,
    });

    // add participation
    await request(app.getHttpServer())
      .post('/event/' + validObjectId1.toString() + '/participation')
      .set('Authorization', authHeader)
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .post('/event/' + validObjectId2.toString() + '/participation')
      .set('Authorization', authHeader)
      .expect(HttpStatus.NO_CONTENT);

    // delete user
    await request(app.getHttpServer())
      .delete('/user/' + userId)
      .set('Authorization', authHeader)
      .expect(HttpStatus.NO_CONTENT);

    // check participation
    await request(app.getHttpServer())
      .get('/event/' + validObjectId1.toString())
      .set('Authorization', authHeader)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toEqual(event1Dto);
      });

    await request(app.getHttpServer())
      .get('/event/' + validObjectId2.toString())
      .set('Authorization', authHeader)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toEqual(event2Dto);
      });

    //TODO: Why is this working?
  });

  describe('/event (PATCH)', () => {
    it('should return 200 (change name of event)', async () => {
      // Give
      const validEvent = validEventDocument();
      const event = new Event(validEvent);
      await event.save();

      const eventUpdateDto: UpdateEventDto = new UpdateEventDto();
      eventUpdateDto.name = 'EventNameNeu';

      const resp = await request(app.getHttpServer())
        .get(`/event/${validEventId.toString()}`)
        .send();

      return request(app.getHttpServer())
        .patch(`/event/${validEventId.toString()}`)
        .send(eventUpdateDto)
        .expect(200)
        .expect((res) => {
          const expectedValue = validEventDto();
          expectedValue.id = res.body.id;
          expectedValue.name = 'EventNameNeu';
          expect(res.body).toEqual(expectedValue);
        });
    });

    it('should return 404', async () => {
      return request(app.getHttpServer())
        .patch(`/event/${nonExistingEventId.toString()}`)
        .send()
        .expect(404)
        .expect(notFoundResponse);
    });
  });

  function getDefaultEventDTO() {
    return {
      id: '1',
      name: 'Test name',
      description: 'Test description',
      startDateTime: new Date('2023-01-01 10:00').toISOString(),
      endDateTime: new Date('2023-01-01 12:00').toISOString(),
      location: {
        longitude: 16.373819,
        latitude: 48.208176,
      },
      price: 12.5,
      public: true,
      imageId: '1',
      organizerId: '1',
      category: getCategory(),
      participants: 0,
      userParticipates: false,
      address: {
        country: 'Österreich',
        city: 'Wien',
        postalcode: '1010',
        street: 'Stephansplatz',
        housenumber: '4',
      },
    };
  }

  function getDefaultCreateEventDTO() {
    return {
      name: 'Test name',
      description: 'Test description',
      startDateTime: new Date('2023-01-01 10:00').toISOString(),
      endDateTime: new Date('2023-01-01 12:00').toISOString(),
      location: {
        longitude: 16.373819,
        latitude: 48.208176,
      },
      price: 12.5,
      public: true,
      imageId: '1',
      category: getCategory(),
    };
  }

  function getCategory(): string[] {
    return ['Salsa', 'Zouk'];
  }

  function addMinutes(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60000);
  }
});
