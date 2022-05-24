import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { RecommendationServiceMock } from '../../test/stubs/recommendation.service.mock';
import { UserEntity } from '../core/entity/user.entity';
import { RoleEnum } from '../core/schema/enum/role.enum';

describe('RecommendationController', () => {
  let sut: RecommendationController;
  let recommendationService: RecommendationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: RecommendationService,
          useClass: RecommendationServiceMock,
        },
      ],
      controllers: [RecommendationController],
    }).compile();

    sut = module.get<RecommendationController>(RecommendationController);
    recommendationService = module.get<RecommendationService>(
      RecommendationService,
    );
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should call the recommendation service', async () => {
    //When
    await sut.getRecommendations({}, getDefaultUser());

    //Then
    expect(recommendationService.getRecommendation).toHaveBeenCalled();
  });

  it('should call the recommendation service with the correct query', async () => {
    //Given
    const query = { take: 1, skip: 0, longitude: 1, latitude: 1, radius: 1 };

    //When
    await sut.getRecommendations(query, getDefaultUser());

    //Then
    expect(recommendationService.getRecommendation).toBeCalledWith(
      query,
      getDefaultUser(),
    );
  });

  function getDefaultUser(): UserEntity {
    return {
      id: '1',
      email: 'john.doe@example.com',
      displayName: 'John Doe',
      emailVerified: true,
      role: RoleEnum.USER,
    };
  }
});
