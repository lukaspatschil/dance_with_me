import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationService } from './recommendation.service';
import { getModelToken } from '@nestjs/mongoose';
import { UserDocument } from '../core/schema/user.schema';
import { EventDocument } from '../core/schema/event.schema';
import { EventRecommendationModelMock } from '../../test/stubs/event.recommendation.model.mock';
import { UserRecommendationModelMock } from '../../test/stubs/user.recommendation.model.mock';
import { Neo4jService } from 'nest-neo4j';
import { Neo4JRecommendationServiceMock } from '../../test/stubs/neo4j.recommendation.service.mock';

describe('RecommendationService', () => {
  let service: RecommendationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationService,
        {
          provide: getModelToken(UserDocument.name),
          useClass: UserRecommendationModelMock,
        },
        {
          provide: getModelToken(EventDocument.name),
          useClass: EventRecommendationModelMock,
        },
        {
          provide: Neo4jService,
          useClass: Neo4JRecommendationServiceMock,
        },
      ],
    }).compile();

    service = module.get<RecommendationService>(RecommendationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
