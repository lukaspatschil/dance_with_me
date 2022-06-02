import { GetObjectRequest, PutObjectRequest } from 'aws-sdk/clients/s3';
import {
  bufferMock,
  invalidFilenamePDF,
  notFoundFilenamePNG,
  stringAWSBinaryImageResponse,
  validFileName,
  validFilenameJPG,
  validFilenamePNG,
  validFilenamePNGReadable,
  validFilenamePNGString,
} from '../test_data/image.testData';
import { Readable } from 'stream';

// Add your mock functions in this object as needed
export class MockS3Instance {
  _functionCalled = '';
  _buffer = false;
  _readable = false;
  _string = false;

  copyObject = jest.fn().mockReturnThis();

  getObject = jest.fn((getObjectRequest: any) => {
    this._functionCalled = 'getObject';
    const config: GetObjectRequest = getObjectRequest;
    if (
      config.Key.includes(validFilenamePNG) ||
      config.Key.includes(validFilenameJPG)
    ) {
      this._buffer = true;
      return this;
    } else if (config.Key.includes(validFilenamePNGReadable)) {
      this._readable = true;
      return this;
    } else if (config.Key.includes(validFilenamePNGString)) {
      this._string = true;
      return this;
    } else if (config.Key.includes(invalidFilenamePDF)) {
      this._buffer = false;
      this._readable = false;
      this._string = false;
      return this;
    } else if (config.Key.includes(notFoundFilenamePNG)) {
      const err = new Error();
      err.name = 'NoSuchKey';
      throw err;
    } else {
      throw new Error();
    }
  });
  putObject = jest.fn((putObjectRequest: any) => {
    this._functionCalled = 'putObject';
    const config: PutObjectRequest = putObjectRequest;
    if (config.Key.includes(validFileName)) {
      return this;
    } else {
      throw new Error();
    }
  });

  createBucket = jest.fn().mockReturnThis();

  headBucket = jest.fn().mockReturnThis();

  promise = jest.fn(() => {
    switch (this._functionCalled) {
      case 'getObject':
        if (this._buffer) {
          return new Promise((resolve) => {
            resolve({ Body: bufferMock() });
          });
        } else if (this._readable) {
          return new Promise((resolve) => {
            resolve({ Body: Readable.from(bufferMock()) });
          });
        } else if (this._string) {
          return new Promise((resolve) => {
            resolve({ Body: stringAWSBinaryImageResponse() });
          });
        } else {
          return new Promise((resolve) => {
            resolve({ Body: undefined });
          });
        }
      case 'putObject':
        return new Promise((resolve) => {
          resolve({ Body: bufferMock() });
        });
      default:
        return new Promise((resolve) => {
          resolve(undefined);
        });
    }
  });
}
