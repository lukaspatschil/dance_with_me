import { Observable, of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { axiosResponse200 } from '../test_data/httpResponse.testData';
import {
  searchURL,
  invalidAddress,
  invalidAddressResponseData,
  noCountryLatitude,
  noCountryLongitude,
  noCountryResponseData,
  reverseURL,
  validAddress,
  validLatitude,
  validLongitude,
  validOpenStreetMapEntity,
} from '../test_data/openStreetMapApi.testData';
import { OpenStreetMapEntity } from '../../src/core/entity/openStreetMap.entity';

export class OpenStreetMapApiAxiosMock {
  get = jest.fn(
    (url: string): Observable<AxiosResponse<OpenStreetMapEntity>> => {
      if (url.includes(reverseURL)) {
        if (
          url.includes(validLongitude.toString()) &&
          url.includes(validLatitude.toString())
        ) {
          const axiosResponse = axiosResponse200(url);
          axiosResponse.data = validOpenStreetMapEntity();
          return of(axiosResponse);
        } else if (
          url.includes(noCountryLatitude.toString()) &&
          url.includes(noCountryLongitude.toString())
        ) {
          const axiosResponse = axiosResponse200(url);
          axiosResponse.data = noCountryResponseData();
          return of(axiosResponse);
        } else {
          throw new Error();
        }
      } else if (url.includes(searchURL)) {
        if (
          url.includes(validAddress.city) &&
          url.includes(validAddress.postalcode.toString()) &&
          url.includes(validAddress.street)
        ) {
          const axiosResponse = axiosResponse200(url);
          axiosResponse.data = [validOpenStreetMapEntity()];
          return of(axiosResponse);
        } else if (
          url.includes(invalidAddress.city) &&
          url.includes(invalidAddress.postalcode.toString()) &&
          url.includes(invalidAddress.street)
        ) {
          const axiosResponse = axiosResponse200(url);
          axiosResponse.data = [invalidAddressResponseData()];
          return of(axiosResponse);
        } else {
          throw new Error();
        }
      }
      return of(axiosResponse200(url));
    },
  );
}
