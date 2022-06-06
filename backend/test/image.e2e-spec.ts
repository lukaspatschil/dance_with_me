import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { AccessTokenGuard } from '../src/auth/auth.guard';
import { AuthGuardMock, mockedAuthHeader } from './stubs/auth.guard.mock';
import { PutObjectRequest } from 'aws-sdk/clients/s3';
import { ImageSizeEnum } from '../src/core/schema/enum/imageSize.enum';
import request from 'supertest';
import {
  bufferMock,
  e2eValidFilename,
  getDefaultUserImageTest,
  imageBuffer,
  validFileDtoAnyIdAndTimeStamps,
  validMimeType,
  validOriginalFileName,
} from './test_data/image.testData';
import { validObjectId1 } from './test_data/event.testData';
import { RoleEnum } from '../src/core/schema/enum/role.enum';
import * as AWS from 'aws-sdk';
import { Neo4jService } from 'nest-neo4j/dist';

/* eslint @typescript-eslint/naming-convention: 0 */

describe('ImageController (e2e)', () => {
  let app: INestApplication;
  let testDatabaseStub: MongoMemoryServer;
  let s3: AWS.S3;
  let neo4J: Neo4jService;

  beforeEach(async () => {
    testDatabaseStub = await MongoMemoryServer.create();
    process.env['MONGODB_URI'] = testDatabaseStub.getUri();

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
  });

  afterEach(async () => {
    await testDatabaseStub.stop();
    await neo4J.write('MATCH (n) DETACH DELETE (n)');
    await app.close();
  });

  describe('/image (Post)', () => {
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

    afterAll(async () => {
      await resetAllBuckets();
    });

    it('should return 201', () => {
      return request(app.getHttpServer())
        .post('/image')
        .set(...organizerAuthHeader(getDefaultUserImageTest().id))
        .attach('file', imageBuffer(), {
          filename: validOriginalFileName,
          contentType: validMimeType,
        })
        .set('Content-Type', 'multipart/form-data')
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body).toEqual(validFileDtoAnyIdAndTimeStamps());
        });
    });

    it('should return 400 due to file format', () => {
      return request(app.getHttpServer())
        .post('/image')
        .set(...organizerAuthHeader())
        .attach('file', imageBuffer(), {
          filename: validOriginalFileName,
          contentType: 'image/gif',
        })
        .set('Content-Type', 'multipart/form-data')
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 500 due to empty buffer', () => {
      return request(app.getHttpServer())
        .post('/image')
        .set(...organizerAuthHeader())
        .attach('file', Buffer.from([]), {
          filename: validOriginalFileName,
          contentType: validMimeType,
        })
        .set('Content-Type', 'multipart/form-data')
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should return 400 due to false form-data propertie set', () => {
      return request(app.getHttpServer())
        .post('/image')
        .set(...organizerAuthHeader())
        .attach('files', imageBuffer(), {
          filename: validOriginalFileName,
          contentType: validMimeType,
        })
        .set('Content-Type', 'multipart/form-data')
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('/image (Get)', () => {
    afterAll(async () => {
      await resetAllBuckets();
    });

    it('should return 200', async () => {
      const bucket =
        (process.env['BUCKET_NAME_PREFIX'] ?? '') +
        (process.env['STAGE'] ?? '');
      const config: PutObjectRequest = {
        Bucket: bucket,
        Key: ImageSizeEnum.ORIGINAL.toLowerCase() + '/' + e2eValidFilename,
        Body: bufferMock(),
        ContentType: 'image/jpg',
      };
      await s3.putObject(config).promise();
      return request(app.getHttpServer())
        .get('/image/5d6ede6a0ba62570afcedd3a.jpg?size=original')
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(res.body).toEqual(bufferMock());
          expect(res.headers['content-type']).toEqual('image/*');
        });
    });
    it('should return 400 invalid size', async () => {
      return request(app.getHttpServer())
        .get('/image/5d6ede6a0ba62570afcedd3a.jpg?size=biggest')
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should return 404 the key does not exist', async () => {
      return request(app.getHttpServer())
        .get('/image/5d6ede6a0ba62570afcedd.jpg?size=original')
        .expect(HttpStatus.NOT_FOUND);
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
