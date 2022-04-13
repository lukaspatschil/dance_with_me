import { Injectable, Logger } from '@nestjs/common';
import { GetObjectOutput } from 'aws-sdk/clients/s3';
import { AWSError } from 'aws-sdk/lib/error';
import { PromiseResult } from 'aws-sdk/lib/request';
import { InjectS3, S3 } from 'nestjs-s3';

@Injectable()
export class PictureService {
  private readonly logger = new Logger(PictureService.name);

  constructor(@InjectS3() private readonly s3: S3) {}

  getImage(): Promise<PromiseResult<GetObjectOutput, AWSError>> {
    return this.s3.getObject().promise();
  }
}
