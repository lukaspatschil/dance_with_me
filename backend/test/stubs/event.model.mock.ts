import { GeolocationEnum } from '../../src/core/schema/enum/geolocation.enum';
import { EventEntity } from '../../src/core/entity/event.entity';
import {
  validEventDocument,
  invalidObjectId,
  nonExistingObjectId,
} from '../test_data/event.testData';
import {
  validAddress,
  validLatitude,
  validLongitude,
} from '../test_data/openStreetMapApi.testData';

/* eslint @typescript-eslint/no-magic-numbers: 0 */
/* eslint @typescript-eslint/naming-convention: 0 */

export const NotFoundErrorId = '-1';
export const DBErrorId = '-2';
export const ParticipationAlreadyStored = '-3';
export const ParticipationNotAlreadyStored = '-4';

function execWrap<T>(val: T) {
  return {
    exec: jest.fn(() => {
      if (val instanceof Error) {
        throw val;
      }
      return val;
    }),
  };
}

export class EventModelMock {
  create = jest.fn((eventEntity: EventEntity) => {
    if (eventEntity.id === '-2') {
      return execWrap(new Error('Random DB Error'));
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
      participants: [],
      paid: false,
    };
    return Promise.resolve(eventDocument);
  });

  findById = jest.fn((id) => {
    if (id === '-1') {
      return execWrap(null);
    }
    if (id === '-2') {
      return execWrap(new Error('Random DB Error'));
    }
    return execWrap(Promise.resolve(createEventDocument()));
  });

  aggregate = jest.fn((pipeline) => {
    const skip = pipeline[pipeline.length - 2].$skip;
    const limit = pipeline[pipeline.length - 1].$limit;

    if (skip === 2 && limit === 2) {
      throw new Error('Random DB Error');
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

    return execWrap(Promise.resolve(value));
  });

  findOneAndDelete = jest.fn(({ _id, organizerId }) => {
    const event = { ...validEventDocument };
    if (
      _id === invalidObjectId.toString() ||
      _id === nonExistingObjectId.toString() ||
      organizerId === validEventDocument.organizerId
    ) {
      return execWrap(null);
    } else if (_id === '-2') {
      return execWrap(new Error('Random DB Error'));
    }
    event._id = _id;
    return execWrap(Promise.resolve(event));
  });

  findByIdAndUpdate = jest.fn((id: string, update: any) => {
    if (id === NotFoundErrorId) {
      return execWrap(null);
    }
    if (id === DBErrorId) {
      return execWrap(new Error('Random DB error'));
    }

    if (update.$addToSet) {
      const userId: string = update.$addToSet.participants;

      if (id == ParticipationAlreadyStored) {
        // the user already set the participation in the event
        const eventDocument = createEventDocument();
        eventDocument.participants.push(userId);
        return execWrap(eventDocument);
      } else {
        return execWrap(createEventDocument());
      }
    } else if (update.$pull) {
      const userId: string = update.$pull.participants;

      if (id == ParticipationAlreadyStored) {
        const eventDocument = createEventDocument();
        eventDocument.participants.push(userId);
        return execWrap(eventDocument);
      } else {
        return execWrap(createEventDocument());
      }
    } else {
      return execWrap(createEventDocument());
    }
  });

  updateMany = jest.fn((filter) => {
    if (filter.participants === invalidObjectId.toString()) {
      return execWrap(new Error('Random Exception'));
    }
    return execWrap(Promise.resolve());
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
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      coordinates: [validLongitude, validLatitude],
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
    paid: true,
  };
}
