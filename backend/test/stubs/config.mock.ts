import { searchURL, reverseURL } from '../test_data/openStreetMapApi.testData';

export class ConfigMock {
  get = jest.fn((value: string) => {
    switch (value) {
      case 'NOMINATIM_SEARCH_ENDPOINT':
        return searchURL;
      case 'NOMINATIM_REVERSE_ENDPOINT':
        return reverseURL;
      default:
        return '';
    }
  });
}
