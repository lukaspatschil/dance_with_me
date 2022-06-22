import mongoose from 'mongoose';

export const eventId1 = new mongoose.Types.ObjectId().toString();
export const eventId2 = new mongoose.Types.ObjectId().toString();
export const eventId3 = new mongoose.Types.ObjectId().toString();

export class RecommendationNeo4jServiceMock {
  write = jest.fn(() => {
    let result: { records: ResultObject[] };
    // eslint-disable-next-line prefer-const
    result = {
      records: [
        new ResultObject([eventId1, eventId2]),
        new ResultObject([eventId2, eventId3]),
      ],
    };

    return Promise.resolve(result);
  });
}

class ResultObject {
  private readonly data: string[];

  constructor(data: string[]) {
    this.data = data;
  }

  public get = jest.fn(() => {
    return this.data;
  });
}
