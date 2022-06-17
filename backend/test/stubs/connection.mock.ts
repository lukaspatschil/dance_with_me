export class ConnectionMock {
  session = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  };

  startSession = jest.fn().mockReturnValue(this.session);
}
