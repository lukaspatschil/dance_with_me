import { searchURL, reverseURL } from '../test_data/openStreetMapApi.testData';
import {
  bucketName,
  bucketRegion,
  bucketStage,
  largeSize,
  mediumSize,
  smallSize,
  thumbnailSize,
} from '../test_data/image.testData';

export class ConfigMock {
  get = jest.fn((value: string) => {
    switch (value) {
      case 'NOMINATIM_SEARCH_ENDPOINT':
        return searchURL;
      case 'NOMINATIM_REVERSE_ENDPOINT':
        return reverseURL;
      case 'THUMBNAIL_SIZE_WIDTH':
        return thumbnailSize;
      case 'SMALL_SIZE_WIDTH':
        return smallSize;
      case 'MEDIUM_SIZE_WIDTH':
        return mediumSize;
      case 'LARGE_SIZE_WIDTH':
        return largeSize;
      case 'THUMBNAIL_SIZE_HEIGHT':
        return thumbnailSize;
      case 'SMALL_SIZE_HEIGHT':
        return smallSize;
      case 'MEDIUM_SIZE_HEIGHT':
        return mediumSize;
      case 'LARGE_SIZE_HEIGHT':
        return largeSize;
      case 'BUCKET_NAME_PREFIX':
        return bucketName;
      case 'STAGE':
        return bucketStage;
      case 'BUCKET_REGION':
        return bucketRegion;
      default:
        return '';
    }
  });
}
