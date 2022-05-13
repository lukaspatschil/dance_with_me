import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Test } from '@nestjs/testing';
import { AccessTokenGuard } from '../src/auth/auth.guard';
import { AuthGuardMock } from './stubs/auth.guard.mock';
import { connect, disconnect, model, Model } from 'mongoose';
import { EventDocument, EventSchema } from '../src/core/schema/event.schema';
import { GeolocationEnum } from '../src/core/schema/enum/geolocation.enum';
import {
  nonExistingObjectId,
  validObjectId1,
  validObjectId2,
  validObjectId3,
} from './test_data/event.testData';
import {
  validAddress,
  validAddressDTO,
} from './test_data/openStreetMapApi.testData';

describe('EventController (e2e)', () => {
  let app: INestApplication;

  let testDatabaseStub: MongoMemoryServer;
  const Event: Model<EventDocument> = model<EventDocument>(
    'eventdocuments',
    EventSchema,
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

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();
  });

  afterEach(async () => {
    await disconnect();
    await testDatabaseStub.stop();
    await app.close();
  });

  describe('/event (Post)', () => {
    it('should return 201', () => {
      const dto = getDefaultCreateEventDTO();

      return request(app.getHttpServer())
        .post('/event')
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
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 (name missing)', () => {
      const dto = getDefaultCreateEventDTO();
      dto.name = '';

      return request(app.getHttpServer())
        .post('/event')
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
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toContain('description should not be empty');
        });
    });

    it('should return 400 (startTime missing)', () => {
      const dto = getDefaultCreateEventDTO();
      dto.startTime = '';

      return request(app.getHttpServer())
        .post('/event')
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toContain(
            'startTime must be before the endTime',
          );
          expect(res.body.message[1]).toMatch(
            'minimal allowed date for startTime is',
          );
          expect(res.body.message).toContain(
            'startTime must be a Date instance',
          );
        });
    });

    it('should return 400 (endTime missing)', () => {
      const dto = getDefaultCreateEventDTO();
      dto.endTime = '';

      return request(app.getHttpServer())
        .post('/event')
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toContain(
            'endTime must be past the startTime',
          );
          expect(res.body.message[2]).toMatch(
            'minimal allowed date for endTime is',
          );
          expect(res.body.message).toContain('endTime must be a Date instance');
          expect(res.body.message).toContain(
            'startTime must be before the endTime',
          );
        });
    });

    it('should return 400 (date missing)', () => {
      const dto = getDefaultCreateEventDTO();
      dto.date = '';

      return request(app.getHttpServer())
        .post('/event')
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message[0]).toMatch(
            'minimal allowed date for date is',
          );
          expect(res.body.message[1]).toEqual('date must be a Date instance');
        });
    });

    it('should return 400 (date in the past)', () => {
      const dto = getDefaultCreateEventDTO();
      dto.date = new Date('2000-01-01').toISOString();

      return request(app.getHttpServer())
        .post('/event')
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message[0]).toMatch(
            'minimal allowed date for date is',
          );
        });
    });

    it('should return 400 (longitude out of bounds)', () => {
      const dto = getDefaultCreateEventDTO();
      dto.location.longitude = -400;

      return request(app.getHttpServer())
        .post('/event')
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
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toContain('price must not be less than 0');
        });
    });

    it('should return 400 (imageId missing)', () => {
      const dto = getDefaultCreateEventDTO();
      dto.imageId = '';

      return request(app.getHttpServer())
        .post('/event')
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toContain('imageId should not be empty');
        });
    });

    it('should return 400 (organizerId missing)', () => {
      const dto = getDefaultCreateEventDTO();
      dto.organizerId = '';

      return request(app.getHttpServer())
        .post('/event')
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toContain('organizerId should not be empty');
        });
    });

    it('should return 400 (category missing)', () => {
      const dto = getDefaultCreateEventDTO();
      dto.category = '';

      return request(app.getHttpServer())
        .post('/event')
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((res) => {
          expect(res.body.message).toContain('category should not be empty');
        });
    });

    it('should return 400', () => {
      const dto = getDefaultCreateEventDTO();
      dto.name = '';

      return request(app.getHttpServer())
        .post('/event')
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST);
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
        const event = new Event({
          _id: validObjectId1.toString(),
          name: 'Test Event',
          description: 'Test Event Description',
          date: new Date('2023-01-01 00:00:00'),
          startTime: new Date('2023-01-01 10:00:00'),
          endTime: new Date('2023-01-01 12:00:00'),
          location: {
            type: GeolocationEnum.POINT,
            coordinates: [0, 0],
          },
          price: 12.5,
          isPublic: true,
          imageId: '1',
          organizerId: '1',
          category: 'Jazz',
          address: validAddress,
        });
        await event.save();
        const eventDto = {
          id: validObjectId1.toString(),
          name: 'Test Event',
          description: 'Test Event Description',
          date: new Date('2023-01-01 00:00:00').toISOString(),
          startTime: new Date('2023-01-01 10:00:00').toISOString(),
          endTime: new Date('2023-01-01 12:00:00').toISOString(),
          location: {
            longitude: 0,
            latitude: 0,
          },
          price: 12.5,
          isPublic: true,
          imageId: '1',
          organizerId: '1',
          category: 'Jazz',
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
        const event1 = new Event({
          _id: validObjectId1.toString(),
          name: 'Test Event',
          description: 'Test Event Description',
          date: new Date('2023-01-01 00:00:00'),
          startTime: new Date('2023-01-01 10:00:00'),
          endTime: new Date('2023-01-01 12:00:00'),
          location: {
            type: GeolocationEnum.POINT,
            coordinates: [0, 0],
          },
          price: 12.5,
          isPublic: true,
          imageId: '1',
          organizerId: '1',
          category: 'Jazz',
          address: validAddress,
        });
        await event1.save();
        const event1Dto = {
          id: validObjectId1.toString(),
          name: 'Test Event',
          description: 'Test Event Description',
          date: new Date('2023-01-01 00:00:00').toISOString(),
          startTime: new Date('2023-01-01 10:00:00').toISOString(),
          endTime: new Date('2023-01-01 12:00:00').toISOString(),
          location: {
            longitude: 0,
            latitude: 0,
          },
          price: 12.5,
          isPublic: true,
          imageId: '1',
          organizerId: '1',
          category: 'Jazz',
          address: validAddressDTO,
        };

        const event2 = new Event({
          _id: validObjectId2.toString(),
          name: 'Test Event',
          description: 'Test Event Description',
          date: new Date('2023-01-01 00:00:00'),
          startTime: new Date('2023-01-01 10:00:00'),
          endTime: new Date('2023-01-01 12:00:00'),
          location: {
            type: GeolocationEnum.POINT,
            coordinates: [0, 0],
          },
          price: 12.5,
          isPublic: true,
          imageId: '1',
          organizerId: '1',
          category: 'Jazz',
          address: validAddress,
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
        const event1 = new Event({
          _id: validObjectId1.toString(),
          name: 'Test Event',
          description: 'Test Event Description',
          date: new Date('2023-01-01 00:00:00'),
          startTime: new Date('2023-01-01 10:00:00'),
          endTime: new Date('2023-01-01 12:00:00'),
          location: {
            type: GeolocationEnum.POINT,
            coordinates: [0, 0],
          },
          price: 12.5,
          isPublic: true,
          imageId: '1',
          organizerId: '1',
          category: 'Jazz',
          address: validAddress,
        });
        await event1.save();
        validObjectId1.toString();
        new Date('2023-01-01 00:00:00').toISOString();
        new Date('2023-01-01 10:00:00').toISOString();
        new Date('2023-01-01 12:00:00').toISOString();
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
        const event1 = new Event({
          _id: validObjectId1.toString(),
          name: 'Test Event',
          description: 'Test Event Description',
          date: new Date('2023-01-01 00:00:00'),
          startTime: new Date('2023-01-01 10:00:00'),
          endTime: new Date('2023-01-01 12:00:00'),
          location: {
            type: GeolocationEnum.POINT,
            coordinates: [0, 0],
          },
          price: 12.5,
          isPublic: true,
          imageId: '1',
          organizerId: '1',
          category: 'Jazz',
          address: validAddress,
        });
        await event1.save();

        const event2 = new Event({
          _id: validObjectId2.toString(),
          name: 'Test Event',
          description: 'Test Event Description',
          date: new Date('2023-01-01 00:00:00'),
          startTime: new Date('2023-01-01 10:00:00'),
          endTime: new Date('2023-01-01 12:00:00'),
          location: {
            type: GeolocationEnum.POINT,
            coordinates: [0, 0],
          },
          price: 12.5,
          isPublic: true,
          imageId: '1',
          organizerId: '1',
          category: 'Jazz',
          address: validAddress,
        });
        await event2.save();
        const event2Dto = {
          id: validObjectId2.toString(),
          name: 'Test Event',
          description: 'Test Event Description',
          date: new Date('2023-01-01 00:00:00').toISOString(),
          startTime: new Date('2023-01-01 10:00:00').toISOString(),
          endTime: new Date('2023-01-01 12:00:00').toISOString(),
          location: {
            longitude: 0,
            latitude: 0,
          },
          price: 12.5,
          isPublic: true,
          imageId: '1',
          organizerId: '1',
          category: 'Jazz',
          address: validAddressDTO,
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
        const event1 = new Event({
          _id: validObjectId1.toString(),
          name: 'Test Event',
          description: 'Test Event Description',
          date: new Date('2023-01-01 00:00:00'),
          startTime: new Date('2023-01-01 10:00:00'),
          endTime: new Date('2023-01-01 12:00:00'),
          location: {
            type: GeolocationEnum.POINT,
            coordinates: [0, 0],
          },
          price: 12.5,
          isPublic: true,
          imageId: '1',
          organizerId: '1',
          category: 'Jazz',
          address: validAddress,
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
        const event1 = new Event({
          _id: validObjectId1.toString(),
          name: 'Test Event',
          description: 'Test Event Description',
          date: new Date('2023-01-01 00:00:00'),
          startTime: new Date('2023-01-01 10:00:00'),
          endTime: new Date('2023-01-01 12:00:00'),
          location: {
            type: GeolocationEnum.POINT,
            coordinates: [0, 0],
          },
          price: 12.5,
          isPublic: true,
          imageId: '1',
          organizerId: '1',
          category: 'Jazz',
          address: validAddress,
        });
        await event1.save();

        const event2 = new Event({
          _id: validObjectId2.toString(),
          name: 'Test Event',
          description: 'Test Event Description',
          date: new Date('2023-01-01 00:00:00'),
          startTime: new Date('2023-01-01 10:00:00'),
          endTime: new Date('2023-01-01 12:00:00'),
          location: {
            type: GeolocationEnum.POINT,
            coordinates: [0, 0],
          },
          price: 12.5,
          isPublic: true,
          imageId: '1',
          organizerId: '1',
          category: 'Jazz',
          address: validAddress,
        });
        await event2.save();
        const event2Dto = {
          id: validObjectId2.toString(),
          name: 'Test Event',
          description: 'Test Event Description',
          date: new Date('2023-01-01 00:00:00').toISOString(),
          startTime: new Date('2023-01-01 10:00:00').toISOString(),
          endTime: new Date('2023-01-01 12:00:00').toISOString(),
          location: {
            longitude: 0,
            latitude: 0,
          },
          price: 12.5,
          isPublic: true,
          imageId: '1',
          organizerId: '1',
          category: 'Jazz',
          address: validAddressDTO,
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
        const event1 = new Event({
          _id: validObjectId1.toString(),
          name: 'test1',
          description: 'Test Event Description',
          date: new Date('2023-01-01 00:00:00'),
          startTime: new Date('2023-01-01 10:00:00'),
          endTime: new Date('2023-01-01 12:00:00'),
          location: {
            type: GeolocationEnum.POINT,
            coordinates: [0, 0],
          },
          price: 12.5,
          isPublic: true,
          imageId: '1',
          organizerId: '1',
          category: 'Jazz',
          address: validAddress,
        });
        await event1.save();
        validObjectId1.toString();
        new Date('2023-01-01 00:00:00').toISOString();
        new Date('2023-01-01 10:00:00').toISOString();
        new Date('2023-01-01 12:00:00').toISOString();
        const event2 = new Event({
          _id: validObjectId2.toString(),
          name: 'test2',
          description: 'Test Event Description',
          date: new Date('2023-01-01 00:00:00'),
          startTime: new Date('2023-01-01 10:00:00'),
          endTime: new Date('2023-01-01 12:00:00'),
          location: {
            type: GeolocationEnum.POINT,
            coordinates: [0, 0],
          },
          price: 12.5,
          isPublic: true,
          imageId: '1',
          organizerId: '1',
          category: 'Jazz',
          address: validAddress,
        });
        await event2.save();
        const event2Dto = {
          id: validObjectId2.toString(),
          name: 'test2',
          description: 'Test Event Description',
          date: new Date('2023-01-01 00:00:00').toISOString(),
          startTime: new Date('2023-01-01 10:00:00').toISOString(),
          endTime: new Date('2023-01-01 12:00:00').toISOString(),
          location: {
            longitude: 0,
            latitude: 0,
          },
          price: 12.5,
          isPublic: true,
          imageId: '1',
          organizerId: '1',
          category: 'Jazz',
          address: validAddressDTO,
        };

        const event3 = new Event({
          _id: validObjectId3.toString(),
          name: 'test3',
          description: 'Test Event Description',
          date: new Date('2023-01-01 00:00:00'),
          startTime: new Date('2023-01-01 10:00:00'),
          endTime: new Date('2023-01-01 12:00:00'),
          location: {
            type: GeolocationEnum.POINT,
            coordinates: [0, 0],
          },
          price: 12.5,
          isPublic: true,
          imageId: '1',
          organizerId: '1',
          category: 'Jazz',
          address: validAddress,
        });
        await event3.save();
        const event3Dto = {
          id: validObjectId3.toString(),
          name: 'test3',
          description: 'Test Event Description',
          date: new Date('2023-01-01 00:00:00').toISOString(),
          startTime: new Date('2023-01-01 10:00:00').toISOString(),
          endTime: new Date('2023-01-01 12:00:00').toISOString(),
          location: {
            longitude: 0,
            latitude: 0,
          },
          price: 12.5,
          isPublic: true,
          imageId: '1',
          organizerId: '1',
          category: 'Jazz',
          address: validAddressDTO,
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
      const event1 = new Event({
        _id: validObjectId1.toString(),
        name: 'test1',
        description: 'Test Event Description',
        date: new Date('2023-01-01 00:00:00'),
        startTime: new Date('2023-01-01 10:00:00'),
        endTime: new Date('2023-01-01 12:00:00'),
        location: {
          type: GeolocationEnum.POINT,
          coordinates: [0, 0],
        },
        price: 12.5,
        isPublic: true,
        imageId: '1',
        organizerId: '1',
        category: 'Jazz',
        address: validAddress,
      });
      await event1.save();
      const event1Dto = {
        id: validObjectId1.toString(),
        name: 'test1',
        description: 'Test Event Description',
        date: new Date('2023-01-01 00:00:00').toISOString(),
        startTime: new Date('2023-01-01 10:00:00').toISOString(),
        endTime: new Date('2023-01-01 12:00:00').toISOString(),
        location: {
          longitude: 0,
          latitude: 0,
        },
        price: 12.5,
        isPublic: true,
        imageId: '1',
        organizerId: '1',
        category: 'Jazz',
        address: validAddressDTO,
      };

      const event2 = new Event({
        _id: validObjectId2.toString(),
        name: 'test2',
        description: 'Test Event Description',
        date: new Date('2023-01-01 00:00:00'),
        startTime: new Date('2023-01-01 10:00:00'),
        endTime: new Date('2023-01-01 12:00:00'),
        location: {
          type: GeolocationEnum.POINT,
          coordinates: [0, 0],
        },
        price: 12.5,
        isPublic: true,
        imageId: '1',
        organizerId: '1',
        category: 'Jazz',
        address: validAddress,
      });
      await event2.save();
      const event2Dto = {
        id: validObjectId2.toString(),
        name: 'test2',
        description: 'Test Event Description',
        date: new Date('2023-01-01 00:00:00').toISOString(),
        startTime: new Date('2023-01-01 10:00:00').toISOString(),
        endTime: new Date('2023-01-01 12:00:00').toISOString(),
        location: {
          longitude: 0,
          latitude: 0,
        },
        price: 12.5,
        isPublic: true,
        imageId: '1',
        organizerId: '1',
        category: 'Jazz',
        address: validAddressDTO,
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

    it('should return two elements because two elements are in the database and should be sorted by date', async () => {
      const event1 = new Event({
        _id: validObjectId1.toString(),
        name: 'test1',
        description: 'Test Event Description',
        date: new Date('2023-01-01 00:00:00'),
        startTime: new Date('2023-01-01 10:00:00'),
        endTime: new Date('2023-01-01 12:00:00'),
        location: {
          type: GeolocationEnum.POINT,
          coordinates: [0, 0],
        },
        price: 12.5,
        isPublic: true,
        imageId: '1',
        organizerId: '1',
        category: 'Jazz',
        address: validAddress,
      });
      await event1.save();
      const event1Dto = {
        id: validObjectId1.toString(),
        name: 'test1',
        description: 'Test Event Description',
        date: new Date('2023-01-01 00:00:00').toISOString(),
        startTime: new Date('2023-01-01 10:00:00').toISOString(),
        endTime: new Date('2023-01-01 12:00:00').toISOString(),
        location: {
          longitude: 0,
          latitude: 0,
        },
        price: 12.5,
        isPublic: true,
        imageId: '1',
        organizerId: '1',
        category: 'Jazz',
        address: validAddressDTO,
      };

      const event2 = new Event({
        _id: validObjectId2.toString(),
        name: 'test2',
        description: 'Test Event Description',
        date: new Date('2022-12-31 00:00'),
        startTime: new Date('2023-01-01 10:00:00'),
        endTime: new Date('2023-01-01 12:00:00'),
        location: {
          type: GeolocationEnum.POINT,
          coordinates: [0, 0],
        },
        price: 12.5,
        isPublic: true,
        imageId: '1',
        organizerId: '1',
        category: 'Jazz',
        address: validAddress,
      });
      await event2.save();
      const event2Dto = {
        id: validObjectId2.toString(),
        name: 'test2',
        description: 'Test Event Description',
        date: new Date('2022-12-31 00:00:00').toISOString(),
        startTime: new Date('2023-01-01 10:00:00').toISOString(),
        endTime: new Date('2023-01-01 12:00:00').toISOString(),
        location: {
          longitude: 0,
          latitude: 0,
        },
        price: 12.5,
        isPublic: true,
        imageId: '1',
        organizerId: '1',
        category: 'Jazz',
        address: validAddressDTO,
      };

      return request(app.getHttpServer())
        .get('/event')
        .expect(HttpStatus.OK)
        .expect((res) => {
          // replace id with id from result
          expect(res.body.length).toEqual(2);
          expect(res.body[0]).toEqual(event2Dto);
          expect(res.body[1]).toEqual(event1Dto);
        });
    });

    it('should return one element because two elements are in the database and one is in the past and one is in the future', async () => {
      const event1 = new Event({
        _id: validObjectId1.toString(),
        name: 'test1',
        description: 'Test Event Description',
        date: new Date('2023-01-01 00:00:00'),
        startTime: new Date('2023-01-01 10:00:00'),
        endTime: new Date('2023-01-01 12:00:00'),
        location: {
          type: GeolocationEnum.POINT,
          coordinates: [0, 0],
        },
        address: validAddress,
        price: 12.5,
        isPublic: true,
        imageId: '1',
        organizerId: '1',
        category: 'Jazz',
      });
      await event1.save();
      const event1Dto = {
        id: validObjectId1.toString(),
        name: 'test1',
        description: 'Test Event Description',
        date: new Date('2023-01-01 00:00:00').toISOString(),
        startTime: new Date('2023-01-01 10:00:00').toISOString(),
        endTime: new Date('2023-01-01 12:00:00').toISOString(),
        location: {
          longitude: 0,
          latitude: 0,
        },
        address: validAddressDTO,
        price: 12.5,
        isPublic: true,
        imageId: '1',
        organizerId: '1',
        category: 'Jazz',
      };

      const event2 = new Event({
        _id: validObjectId2.toString(),
        name: 'test1',
        description: 'Test Event Description',
        date: new Date('2021-01-01 00:00:00'),
        startTime: new Date('2021-01-01 10:00:00'),
        endTime: new Date('2021-01-01 12:00:00'),
        location: {
          type: GeolocationEnum.POINT,
          coordinates: [0, 0],
        },
        address: validAddress,
        price: 12.5,
        isPublic: true,
        imageId: '1',
        organizerId: '1',
        category: 'Jazz',
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
      const event1 = new Event({
        _id: validObjectId1.toString(),
        name: 'test1',
        description: 'Test Event Description',
        date: new Date('2024-02-01 00:00:00'),
        startTime: new Date('2024-02-01 10:00:00'),
        endTime: new Date('2024-02-01 12:00:00'),
        location: {
          type: GeolocationEnum.POINT,
          coordinates: [0, 0],
        },
        address: validAddress,
        price: 12.5,
        isPublic: true,
        imageId: '1',
        organizerId: '1',
        category: 'Jazz',
      });
      await event1.save();
      const event1Dto = {
        id: validObjectId1.toString(),
        name: 'test1',
        description: 'Test Event Description',
        date: new Date('2024-02-01 00:00:00').toISOString(),
        startTime: new Date('2024-02-01 10:00:00').toISOString(),
        endTime: new Date('2024-02-01 12:00:00').toISOString(),
        location: {
          longitude: 0,
          latitude: 0,
        },
        address: validAddressDTO,
        price: 12.5,
        isPublic: true,
        imageId: '1',
        organizerId: '1',
        category: 'Jazz',
      };

      const event2 = new Event({
        _id: validObjectId2.toString(),
        name: 'test1',
        description: 'Test Event Description',
        date: new Date('2023-01-01 00:00:00'),
        startTime: new Date('2023-01-01 10:00:00'),
        endTime: new Date('2023-01-01 12:00:00'),
        location: {
          type: GeolocationEnum.POINT,
          coordinates: [0, 0],
        },
        address: validAddress,
        price: 12.5,
        isPublic: true,
        imageId: '1',
        organizerId: '1',
        category: 'Jazz',
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
        const event1 = new Event({
          _id: validObjectId1.toString(),
          name: 'test1',
          description: 'Test Event Description',
          date: new Date('2023-01-01 00:00:00'),
          startTime: new Date('2023-01-01 10:00:00'),
          endTime: new Date('2023-01-01 12:00:00'),
          location: {
            type: GeolocationEnum.POINT,
            coordinates: [0, 0],
          },
          address: validAddress,
          price: 12.5,
          isPublic: true,
          imageId: '1',
          organizerId: '1',
          category: 'Jazz',
        });
        await event1.save();
        const event1Dto = {
          id: validObjectId1.toString(),
          name: 'test1',
          description: 'Test Event Description',
          date: new Date('2023-01-01 00:00:00').toISOString(),
          startTime: new Date('2023-01-01 10:00:00').toISOString(),
          endTime: new Date('2023-01-01 12:00:00').toISOString(),
          location: {
            longitude: 0,
            latitude: 0,
          },
          price: 12.5,
          isPublic: true,
          imageId: '1',
          organizerId: '1',
          category: 'Jazz',
          address: validAddressDTO,
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
            expect(res.body).toEqual([event1Dto]);
          });
      });

      it('should return two elements sorted by distance because two elements are in the database', async () => {
        const event1 = new Event({
          _id: validObjectId1.toString(),
          name: 'test1',
          description: 'Test Event Description',
          date: new Date('2023-01-01 00:00:00'),
          startTime: new Date('2023-01-01 10:00:00'),
          endTime: new Date('2023-01-01 12:00:00'),
          location: {
            type: GeolocationEnum.POINT,
            coordinates: [1, 1],
          },
          price: 12.5,
          isPublic: true,
          imageId: '1',
          organizerId: '1',
          category: 'Jazz',
          address: validAddress,
        });
        await event1.save();
        const event1Dto = {
          id: validObjectId1.toString(),
          name: 'test1',
          description: 'Test Event Description',
          date: new Date('2023-01-01 00:00:00').toISOString(),
          startTime: new Date('2023-01-01 10:00:00').toISOString(),
          endTime: new Date('2023-01-01 12:00:00').toISOString(),
          location: {
            longitude: 1,
            latitude: 1,
          },
          price: 12.5,
          isPublic: true,
          imageId: '1',
          organizerId: '1',
          category: 'Jazz',
          address: validAddressDTO,
        };

        const event2 = new Event({
          _id: validObjectId2.toString(),
          name: 'test2',
          description: 'Test Event Description',
          date: new Date('2023-01-01 00:00:00'),
          startTime: new Date('2023-01-01 10:00:00'),
          endTime: new Date('2023-01-01 12:00:00'),
          location: {
            type: GeolocationEnum.POINT,
            coordinates: [0, 0],
          },
          price: 12.5,
          isPublic: true,
          imageId: '1',
          organizerId: '1',
          category: 'Jazz',
          address: validAddress,
        });
        await event2.save();
        const event2Dto = {
          id: validObjectId2.toString(),
          name: 'test2',
          description: 'Test Event Description',
          date: new Date('2023-01-01 00:00:00').toISOString(),
          startTime: new Date('2023-01-01 10:00:00').toISOString(),
          endTime: new Date('2023-01-01 12:00:00').toISOString(),
          location: {
            longitude: 0,
            latitude: 0,
          },
          price: 12.5,
          isPublic: true,
          imageId: '1',
          organizerId: '1',
          category: 'Jazz',
          address: validAddressDTO,
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
        const dto1 = getDefaultCreateEventDTO();
        const res1 = await request(app.getHttpServer())
          .post('/event')
          .send(dto1)
          .expect(HttpStatus.CREATED);
        const createdElement1 = res1.body;

        const dto2 = getDefaultCreateEventDTO();
        dto2.date = new Date('2022-12-31 00:00').toISOString();
        const res2 = await request(app.getHttpServer())
          .post('/event')
          .send(dto2)
          .expect(HttpStatus.CREATED);
        const createdElement2 = res2.body;

        const body = {
          latitude: 1,
          longitude: 1,
        };

        return request(app.getHttpServer())
          .get('/event')
          .send(body)
          .expect(HttpStatus.OK)
          .expect((res) => {
            expect(res.body).toEqual([createdElement2, createdElement1]);
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
      const event1 = new Event({
        _id: validObjectId1.toString(),
        name: 'test1',
        description: 'Test Event Description',
        date: new Date('2023-01-01 00:00:00'),
        startTime: new Date('2023-01-01 10:00:00'),
        endTime: new Date('2023-01-01 12:00:00'),
        location: {
          type: GeolocationEnum.POINT,
          coordinates: [1, 2],
        },
        price: 12.5,
        isPublic: true,
        imageId: '1',
        organizerId: '1',
        category: 'Jazz',
        address: validAddress,
      });
      await event1.save();
      const event1Dto = {
        id: validObjectId1.toString(),
        name: 'test1',
        description: 'Test Event Description',
        date: new Date('2023-01-01 00:00:00').toISOString(),
        startTime: new Date('2023-01-01 10:00:00').toISOString(),
        endTime: new Date('2023-01-01 12:00:00').toISOString(),
        location: {
          longitude: 1,
          latitude: 2,
        },
        price: 12.5,
        isPublic: true,
        imageId: '1',
        organizerId: '1',
        category: 'Jazz',
        address: validAddressDTO,
      };

      return request(app.getHttpServer())
        .get('/event/' + validObjectId1)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toEqual(event1Dto);
        });
    });
  });

  function getDefaultEventDTO() {
    return {
      id: '1',
      name: 'Test name',
      description: 'Test description',
      date: new Date('2023-01-01 00:00').toISOString(),
      startTime: new Date('2023-01-01 10:00').toISOString(),
      endTime: new Date('2023-01-01 12:00').toISOString(),
      location: {
        longitude: 16.373819,
        latitude: 48.208176,
      },
      price: 12.5,
      isPublic: true,
      imageId: '1',
      organizerId: '1',
      category: 'Jazz',
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
      date: new Date('2023-01-01 00:00').toISOString(),
      startTime: new Date('2023-01-01 10:00').toISOString(),
      endTime: new Date('2023-01-01 12:00').toISOString(),
      location: {
        longitude: 16.373819,
        latitude: 48.208176,
      },
      price: 12.5,
      isPublic: true,
      imageId: '1',
      organizerId: '1',
      category: 'Jazz',
    };
  }
});
