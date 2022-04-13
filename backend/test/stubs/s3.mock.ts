import S3 from 'aws-sdk/clients/s3';

// Add your mock functions in this object as needed
export class MockS3Instance implements Partial<S3> {
  copyObject = jest.fn().mockReturnThis();

  getObject = jest.fn().mockReturnThis();

  promise = jest.fn().mockReturnThis();

  catch = jest.fn();
}
