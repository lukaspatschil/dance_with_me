export class Neo4JRecommendationServiceMock {
  write = jest.fn(() => {
    return Promise.resolve();
  });
}
