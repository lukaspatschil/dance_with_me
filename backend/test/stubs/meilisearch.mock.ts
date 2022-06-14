export class MeiliSearchMock {
  index = jest.fn().mockReturnValue({
    addDocuments: jest.fn().mockReturnValue(Promise.resolve()),
  });
}
