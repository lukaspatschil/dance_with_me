import { PipelineStage } from 'mongoose';
import { GeolocationEnum } from '../../src/core/schema/enum/geolocation.enum';
import { validAddress } from '../test_data/openStreetMapApi.testData';
import { eventId1, eventId2 } from './recommendation.neo4j.service.mock';

export class RecommendationModelMock {
  aggregate = jest.fn((pipe) => {
    const geoStage = pipe[0];
    const matchStage = pipe[1];
    const skipStage: PipelineStage.Skip = pipe[2];
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const limitStage: PipelineStage.Limit = pipe[3];

    const near = geoStage.$geoNear;
    if (
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      Object.keys(near).length != 4 ||
      Object.keys(near.near).length != 2 ||
      near.spherical != true
    ) {
      throw new Error('not correctly formed');
    }
    if (
      Object.keys(matchStage).length === 0 ||
      Object.keys(matchStage.$match).length === 0 ||
      matchStage.$match.$and.length === 0 ||
      Object.keys(matchStage.$match.$and[0].startDateTime).length === 0 ||
      Object.keys(matchStage.$match.$and[0]._id).length === 0
    ) {
      throw new Error('not correctly formed');
    }
    if (Object.keys(skipStage).length === 0) {
      throw new Error('not correctly formed');
    }
    if (Object.keys(limitStage).length === 0) {
      throw new Error('not correctly formed');
    }

    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    if (skipStage.$skip === -99) {
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      throw new Error('random DB error');
    }

    const item1 = createEventDocument();
    item1._id = eventId1;
    const item2 = createEventDocument();
    item2._id = eventId2;

    return [item1, item2];
  });
}

function createEventDocument() {
  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _id: '1',
    name: 'Test name',
    description: 'Test description',
    location: {
      type: GeolocationEnum.POINT,
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      coordinates: [-171.23794, 8.54529],
    },
    price: 12.5,
    organizerId: '1',
    imageId: '1',
    category: ['Salsa', 'Zouk'],
    startDateTime: new Date('2020-01-01 00:10:00'),
    endDateTime: new Date('2020-01-01 00:12:00'),
    public: true,
    address: validAddress,
    participants: [] as string[],
  };
}
