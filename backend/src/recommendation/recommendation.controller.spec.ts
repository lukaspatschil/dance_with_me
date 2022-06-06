import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { RecommendationServiceMock } from '../../test/stubs/recommendation.service.mock';
import { UserEntity } from '../core/entity/user.entity';
import { RoleEnum } from '../core/schema/enum/role.enum';
import { EventDto } from '../core/dto/event.dto';
import { CategoryEnum } from '../core/schema/enum/category.enum';

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

  it('should call the recommendation service with the correct query and return a single event', async () => {
    //Given
    const query = { take: 2, skip: 0, longitude: 2, latitude: 2, radius: 2 };

    //When
    const result = await sut.getRecommendations(query, getDefaultUser());

    //Then
    expect(result).toEqual([getDefaultEvent()]);
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

  function getDefaultEvent(): EventDto {
    return {
      id: '1',
      name: 'Event 1',
      description: 'Event 1 description',
      startDateTime: new Date('2023-01-01 10:00'),
      endDateTime: new Date('2023-01-01 12:00'),
      location: {
        longitude: 1,
        latitude: 1,
      },
      address: {
        street: 'Street 1',
        city: 'City 1',
        country: 'Country 1',
        postalcode: 'Postal Code 1',
        housenumber: 'House Number 1',
        addition: 'Addition 1',
      },
      price: 10,
      public: true,
      organizerId: '1',
      category: [CategoryEnum.SALSA],
      participants: 1,
      userParticipates: false,
    };
  }
});
