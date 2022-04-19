import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Test } from '@nestjs/testing';

describe('EventController (e2e)', () => {
  let app: INestApplication;

  let testDatabaseStub: MongoMemoryServer;

  beforeEach(async () => {
    testDatabaseStub = await MongoMemoryServer.create();
    process.env['MONGODB_URI'] = testDatabaseStub.getUri();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  afterEach(async () => {
    await testDatabaseStub.stop();
    await app.close();
  });

  it('/event (GET)', () => {
    return request(app.getHttpServer())
      .get('/event')
      .expect(200)
      .expect('Hello Event');
  });

  describe('/event (Post)', () => {
    it('should return 201', () => {
      const dto = getDefaultCreateEventDTO();

      return request(app.getHttpServer())
        .post('/event')
        .send(dto)
        .expect(201)
        .expect((res) => {
          // replace id with id from result
          const expectedValue = getDefaultEventDTO();
          expectedValue.id = res.body.id;
          expect(res.body).toEqual(expectedValue);
        });
    });

    it('should return 400 (empty object)', () => {
      return request(app.getHttpServer()).post('/event').send({}).expect(400);
    });

    it('should return 400 (name missing)', () => {
      const dto = getDefaultCreateEventDTO();
      dto.name = '';

      return request(app.getHttpServer())
        .post('/event')
        .send(dto)
        .expect(400)
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
        .expect(400)
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
        .expect(400)
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
        .expect(400)
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
        .expect(400)
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
        .expect(400)
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
        .expect(400)
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
        .expect(400)
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
        .expect(400)
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
        .expect(400)
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
        .expect(400)
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
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('category should not be empty');
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
        longitude: -171.23794,
        latitude: 8.54529,
      },
      price: 12.5,
      isPublic: true,
      imageId: '1',
      organizerId: '1',
      category: 'Jazz',
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
        longitude: -171.23794,
        latitude: 8.54529,
      },
      price: 12.5,
      isPublic: true,
      imageId: '1',
      organizerId: '1',
      category: 'Jazz',
    };
  }
});
