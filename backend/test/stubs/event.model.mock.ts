import { GeolocationEnum } from '../../src/core/schema/enum/geolocation.enum';
import { EventEntity } from '../../src/core/entity/event.entity';
import {
  validObjectId1,
  validEventDocument,
  invalidObjectId,
  nonExistingObjectId,
} from '../test_data/event.testData';
import { validAddress } from '../test_data/openStreetMapApi.testData';

export class EventModelMock {
  create = jest.fn((eventEntity: EventEntity) => {
    if (eventEntity.id === '-2') {
      throw new Error('Random DB Error');
    }

    const eventDocument = {
      _id: '1',
      name: eventEntity.name,
      description: eventEntity.description,
      location: {
        type: GeolocationEnum.POINT,
        coordinates: [
          eventEntity.location?.coordinates[0],
          eventEntity.location?.coordinates[1],
        ],
      },
      price: eventEntity.price,
      organizerId: '1',
      imageId: eventEntity.imageId,
      startDateTime: eventEntity.startDateTime,
      endDateTime: eventEntity.endDateTime,
      category: eventEntity.category,
      public: eventEntity.public,
      address: eventEntity.address,
    };
    return Promise.resolve(eventDocument);
  });

  findById = jest.fn((id) => {
    if (id === '-1') {
      return null;
    }
    if (id === '-2') {
      throw new Error('Random DB Error');
    }
    return Promise.resolve(createEventDocument());
  });

  aggregate = jest.fn((pipeline) => {
    const dateQuery = pipeline[pipeline.length - 4].$match;
    const sort = pipeline[pipeline.length - 3].$sort;
    const skip = pipeline[pipeline.length - 2].$skip;
    const limit = pipeline[pipeline.length - 1].$limit;
    if (pipeline.length === 5) {
      const near = pipeline[0].$geoNear;
      if (
        Object.keys(near).length === 0 ||
        Object.keys(near.near).length === 0 ||
        near.spherical != true ||
        near.near.coordinates.length != 2
      ) {
        throw new Error('Invalid pipeline');
      }
    }

    if (
      dateQuery === undefined ||
      dateQuery.$and === undefined ||
      dateQuery.$and.length !== 1 ||
      dateQuery.$and[0].startDateTime === undefined ||
      Object.keys(dateQuery.$and[0].startDateTime).length === 0
    ) {
      throw new Error('Invalid pipeline');
    }

    if (skip === 2 && limit === 2) {
      throw new Error('Random DB Error');
    }

    if (limit === undefined) {
      throw new Error('pipeline must contain limit');
    }
    if (skip === undefined) {
      throw new Error('pipeline must contain skip');
    }
    if (sort === undefined || Object.keys(sort).length === 0) {
      throw new Error('pipeline must contain skip');
    }

    const value = [];
    if (pipeline[pipeline.length - 1].$limit === 1) {
      value.push(createEventDocument());
    } else if (pipeline[pipeline.length - 2].$skip === 2) {
      const item1 = createEventDocument();
      item1._id = '3';
      value.push(item1);
      const item2 = createEventDocument();
      item2._id = '4';
      value.push(item2);
      const item3 = createEventDocument();
      item3._id = '5';
      value.push(item3);
    }

    return Promise.resolve(value);
  });

  findByIdAndDelete = jest.fn((id: string) => {
    if (
      id === invalidObjectId.toString() ||
      id === nonExistingObjectId.toString()
    ) {
      return Promise.resolve(null);
    } else if (id === '-2') {
      throw new Error('Random DB Error');
    }
    const event = validEventDocument;
    event._id = id;
    return Promise.resolve(event);
  });
}

export class EventModelMockSkip {
  sort = jest.fn(() => {
    const item1 = createEventDocument();
    item1._id = '3';
    const item2 = createEventDocument();
    item2._id = '4';
    const item3 = createEventDocument();
    item3._id = '5';
    return Promise.resolve([item1, item2, item3]);
  });
}

function createEventDocument() {
  return {
    _id: '1',
    name: 'Test name',
    description: 'Test description',
    location: {
      type: GeolocationEnum.POINT,
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
  };
}
