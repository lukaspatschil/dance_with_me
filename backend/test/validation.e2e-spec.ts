import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AccessTokenGuard } from '../src/auth/auth.guard';
import { AuthGuardMock, mockedAuthHeader } from './stubs/auth.guard.mock';
import request from 'supertest';
import {
  imageBuffer,
  validMimeType,
  validOriginalFileName,
} from './test_data/image.testData';
import {
  validObjectId1,
  validObjectId2,
  validObjectId3,
} from './test_data/event.testData';
import { RoleEnum } from '../src/core/schema/enum/role.enum';
import * as AWS from 'aws-sdk';
import { Neo4jService } from 'nest-neo4j/dist';
import { ValidationStatusEnum } from '../src/core/schema/enum/validationStatus.enum';
import { connect, disconnect, model, Model } from 'mongoose';
import { UserDocument, UserSchema } from '../src/core/schema/user.schema';
import { validUserDocument } from './test_data/user.testData';

/* eslint @typescript-eslint/naming-convention: 0 */

describe('ValidationController (e2e)', () => {
  let app: INestApplication;
  let testDatabaseStub: MongoMemoryServer;
  let s3: AWS.S3;
  let neo4J: Neo4jService;

  const userModel: Model<UserDocument> = model<UserDocument>(
    UserDocument.name,
    UserSchema,
  );
  let user: UserDocument;

  const userAuthHeader = (userId?: string): ['Authorization', string] => [
    'Authorization',
    mockedAuthHeader({
      id: userId ?? validObjectId1.toString(),
      displayName: 'Test User',
      role: RoleEnum.USER,
    }),
  ];

  const organizerAuthHeader = (
    organizerId?: string,
  ): ['Authorization', string] => [
    'Authorization',
    mockedAuthHeader({
      id: organizerId ?? validObjectId2.toString(),
      displayName: 'Oscar Organized',
      role: RoleEnum.ORGANISER,
    }),
  ];

  const adminAuthHeader: [string, string] = [
    'Authorization',
    mockedAuthHeader({
      id: validObjectId3.toString(),
      displayName: 'Test Admin',
      role: RoleEnum.ADMIN,
    }),
  ];

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

    const credentials = new AWS.Credentials(
      process.env['AWS_ACCESS_KEY_ID'] ?? '',
      process.env['AWS_SECRET_ACCESS_KEY'] ?? '',
    );
    const config = {
      endpoint: process.env['AWS_ENDPOINT'],
      credentials: credentials,
      region: process.env['BUCKET_REGION'],
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    };
    s3 = new AWS.S3(config);
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    neo4J = app.get(Neo4jService);
    await neo4J.write('MATCH (n) DETACH DELETE (n)');

    await app.init();

    user = await userModel.create({
      ...validUserDocument,
      _id: 'mockUserId',
    });
  });

  afterEach(async () => {
    await disconnect();
    await testDatabaseStub.stop();
    await neo4J.write('MATCH (n) DETACH DELETE (n)');
    await app.close();
  });

  describe('/validationrequest', () => {
    afterAll(async () => {
      await resetAllBuckets();
    });

    it('should return 403 on POST if user is already organizer', () => {
      return request(app.getHttpServer())
        .post('/validationrequest')
        .set(...organizerAuthHeader())
        .attach('file', imageBuffer(), {
          filename: validOriginalFileName,
          contentType: validMimeType,
        })
        .set('Content-Type', 'multipart/form-data')
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should return 409 on POST if user attempts to submit twice', async () => {
      await request(app.getHttpServer())
        .post('/validationrequest')
        .set(...userAuthHeader())
        .attach('file', imageBuffer(), {
          filename: validOriginalFileName,
          contentType: validMimeType,
        })
        .set('Content-Type', 'multipart/form-data')
        .expect(HttpStatus.CREATED);

      return request(app.getHttpServer())
        .post('/validationrequest')
        .set(...userAuthHeader())
        .attach('file', imageBuffer(), {
          filename: validOriginalFileName,
          contentType: validMimeType,
        })
        .set('Content-Type', 'multipart/form-data')
        .expect(HttpStatus.CONFLICT)
        .expect({ error: 'validation_request_already_exists' });
    });

    it('should return 201 on POST with id that can be used to check status with GET', async () => {
      const userId = user._id;

      const response = await request(app.getHttpServer())
        .post('/validationrequest')
        .set(...userAuthHeader(userId))
        .attach('file', imageBuffer(), {
          filename: validOriginalFileName,
          contentType: validMimeType,
        })
        .set('Content-Type', 'multipart/form-data')
        .expect(HttpStatus.CREATED);

      const { id } = response.body;

      return request(app.getHttpServer())
        .get(`/validationrequest`)
        .set(...userAuthHeader(userId))
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toContainEqual(
            expect.objectContaining({
              id,
              status: ValidationStatusEnum.PENDING,
              userId,
            }),
          );
        });
    });

    it("should not return other users' validation requests", async () => {
      const userId = user._id;

      const response = await request(app.getHttpServer())
        .post('/validationrequest')
        .set(...userAuthHeader(userId))
        .attach('file', imageBuffer(), {
          filename: validOriginalFileName,
          contentType: validMimeType,
        })
        .set('Content-Type', 'multipart/form-data')
        .expect(HttpStatus.CREATED);

      const { id } = response.body;

      return request(app.getHttpServer())
        .get(`/validationrequest`)
        .set(...organizerAuthHeader())
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).not.toContainEqual(
            expect.objectContaining({
              id,
              userId,
            }),
          );
        });
    });

    it("should return other users' validation requests if requested by admin", async () => {
      const userId = user._id;

      const response = await request(app.getHttpServer())
        .post('/validationrequest')
        .set(...userAuthHeader(userId))
        .attach('file', imageBuffer(), {
          filename: validOriginalFileName,
          contentType: validMimeType,
        })
        .set('Content-Type', 'multipart/form-data')
        .expect(HttpStatus.CREATED);

      const { id } = response.body;

      return request(app.getHttpServer())
        .get(`/validationrequest`)
        .set(...adminAuthHeader)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toContainEqual(
            expect.objectContaining({
              id,
              userId,
            }),
          );
        });
    });
  });

  describe('/validationrequest/:id', () => {
    afterAll(async () => {
      await resetAllBuckets();
    });

    it('should allow admin to update validation with PATCH', async () => {
      const response = await request(app.getHttpServer())
        .post('/validationrequest')
        .set(...userAuthHeader())
        .attach('file', imageBuffer(), {
          filename: validOriginalFileName,
          contentType: validMimeType,
        })
        .set('Content-Type', 'multipart/form-data')
        .expect(HttpStatus.CREATED);

      const { id } = response.body;

      await request(app.getHttpServer())
        .patch(`/validationrequest/${id}`)
        .set(...adminAuthHeader)
        .send({ status: ValidationStatusEnum.APPROVED })
        .expect(HttpStatus.OK)
        .expect({
          id,
          status: ValidationStatusEnum.APPROVED,
        });

      return request(app.getHttpServer())
        .get(`/validationrequest`)
        .set(...userAuthHeader())
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toContainEqual(
            expect.objectContaining({
              id,
              status: ValidationStatusEnum.APPROVED,
            }),
          );
        });
    });

    it('should return 409 if admin tries to approve rejected request', async () => {
      const response = await request(app.getHttpServer())
        .post('/validationrequest')
        .set(...userAuthHeader())
        .attach('file', imageBuffer(), {
          filename: validOriginalFileName,
          contentType: validMimeType,
        })
        .set('Content-Type', 'multipart/form-data')
        .expect(HttpStatus.CREATED);

      const { id } = response.body;

      await request(app.getHttpServer())
        .patch(`/validationrequest/${id}`)
        .set(...adminAuthHeader)
        .send({ status: ValidationStatusEnum.REJECTED })
        .expect(HttpStatus.OK)
        .expect({
          id,
          status: ValidationStatusEnum.REJECTED,
        });

      return request(app.getHttpServer())
        .patch(`/validationrequest/${id}`)
        .set(...adminAuthHeader)
        .send({ status: ValidationStatusEnum.APPROVED })
        .expect(HttpStatus.CONFLICT)
        .expect({ error: 'validation_request_already_responded' });
    });

    it('should return 409 if admin tries to reject approved request', async () => {
      const response = await request(app.getHttpServer())
        .post('/validationrequest')
        .set(...userAuthHeader())
        .attach('file', imageBuffer(), {
          filename: validOriginalFileName,
          contentType: validMimeType,
        })
        .set('Content-Type', 'multipart/form-data')
        .expect(HttpStatus.CREATED);

      const { id } = response.body;

      await request(app.getHttpServer())
        .patch(`/validationrequest/${id}`)
        .set(...adminAuthHeader)
        .send({ status: ValidationStatusEnum.APPROVED })
        .expect(HttpStatus.OK)
        .expect({
          id,
          status: ValidationStatusEnum.APPROVED,
        });

      return request(app.getHttpServer())
        .patch(`/validationrequest/${id}`)
        .set(...adminAuthHeader)
        .send({ status: ValidationStatusEnum.REJECTED })
        .expect(HttpStatus.CONFLICT)
        .expect({ error: 'validation_request_already_responded' });
    });

    it('should return 409 if admin tries to approve already approved request', async () => {
      const response = await request(app.getHttpServer())
        .post('/validationrequest')
        .set(...userAuthHeader())
        .attach('file', imageBuffer(), {
          filename: validOriginalFileName,
          contentType: validMimeType,
        })
        .set('Content-Type', 'multipart/form-data')
        .expect(HttpStatus.CREATED);

      const { id } = response.body;

      await request(app.getHttpServer())
        .patch(`/validationrequest/${id}`)
        .set(...adminAuthHeader)
        .send({ status: ValidationStatusEnum.APPROVED })
        .expect(HttpStatus.OK)
        .expect({
          id,
          status: ValidationStatusEnum.APPROVED,
        });

      return request(app.getHttpServer())
        .patch(`/validationrequest/${id}`)
        .set(...adminAuthHeader)
        .send({ status: ValidationStatusEnum.APPROVED })
        .expect(HttpStatus.CONFLICT)
        .expect({ error: 'validation_request_already_responded' });
    });

    it('should not allow user to update validation with PATCH', async () => {
      const response = await request(app.getHttpServer())
        .post('/validationrequest')
        .set(...userAuthHeader())
        .attach('file', imageBuffer(), {
          filename: validOriginalFileName,
          contentType: validMimeType,
        })
        .set('Content-Type', 'multipart/form-data')
        .expect(HttpStatus.CREATED);

      const { id } = response.body;

      return request(app.getHttpServer())
        .patch(`/validationrequest/${id}`)
        .set(...userAuthHeader())
        .send({ status: ValidationStatusEnum.APPROVED })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should not allow user to delete their own request', async () => {
      const response = await request(app.getHttpServer())
        .post('/validationrequest')
        .set(...userAuthHeader())
        .attach('file', imageBuffer(), {
          filename: validOriginalFileName,
          contentType: validMimeType,
        })
        .set('Content-Type', 'multipart/form-data')
        .expect(HttpStatus.CREATED);

      const { id } = response.body;

      return request(app.getHttpServer())
        .delete(`/validationrequest/${id}`)
        .set(...userAuthHeader())
        .send({ status: ValidationStatusEnum.APPROVED })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should allow admin to delete a request', async () => {
      const response = await request(app.getHttpServer())
        .post('/validationrequest')
        .set(...userAuthHeader())
        .attach('file', imageBuffer(), {
          filename: validOriginalFileName,
          contentType: validMimeType,
        })
        .set('Content-Type', 'multipart/form-data')
        .expect(HttpStatus.CREATED);

      const { id } = response.body;

      return request(app.getHttpServer())
        .delete(`/validationrequest/${id}`)
        .set(...adminAuthHeader)
        .expect(HttpStatus.NO_CONTENT);
    });
  });

  async function resetAllBuckets() {
    try {
      const bucket =
        (process.env['BUCKET_NAME_PREFIX'] ?? '') +
        (process.env['STAGE'] ?? '');
      const enumObjects = await s3.listObjectsV2({ Bucket: bucket }).promise();
      if (enumObjects.Contents) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (
          let content = 0;
          content < enumObjects.Contents.length;
          content++
        ) {
          const typedContent: any & { Key: string } =
            enumObjects.Contents[content];
          await s3
            .deleteObject({ Bucket: bucket, Key: typedContent.Key })
            .promise();
        }
      }
      await s3.deleteBucket({ Bucket: bucket }).promise();
    } catch (error) {
      console.error(error);
    }
  }
});
