import {
  bufferMock,
  validFileEntityResponse,
} from '../test_data/image.testData';
import { FileEntity } from '../../src/core/entity/file.entity';

export class ImageServiceMock {
  getImage = jest.fn(() => {
    return {
      body: bufferMock,
      contentType: 'image/png',
    };
  });

  getImageWithSize = jest.fn(() => {
    return bufferMock;
  });

  uploadImage = jest.fn((): Promise<FileEntity> => {
    return Promise.resolve(validFileEntityResponse());
  });
}
