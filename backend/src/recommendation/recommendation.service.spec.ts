import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationService } from './recommendation.service';
import { getModelToken } from '@nestjs/mongoose';
import { EventDocument } from '../core/schema/event.schema';
import { RecommendationModelMock } from '../../test/stubs/recommendation.model.mock';
import { Neo4jService } from 'nest-neo4j';
import {
  eventId1,
  eventId2,
  RecommendationNeo4jServiceMock,
} from '../../test/stubs/recommendation.neo4j.service.mock';
import { UserEntity } from '../core/entity/user.entity';
import { RoleEnum } from '../core/schema/enum/role.enum';
import { InternalServerErrorException } from '@nestjs/common';
import { EventEntity } from '../core/entity/event.entity';
import { LocationEntity } from '../core/entity/location.entity';
import { GeolocationEnum } from '../core/schema/enum/geolocation.enum';
import { CategoryEnum } from '../core/schema/enum/category.enum';
import { validAddress } from '../../test/test_data/openStreetMapApi.testData';
import { AddressEntity } from '../core/entity/address.entity';

describe('RecommendationService', () => {
  let sut: RecommendationService;
  let neo4jService: Neo4jService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationService,
        {
          provide: getModelToken(EventDocument.name),
          useClass: RecommendationModelMock,
        },
        {
          provide: Neo4jService,
          useClass: RecommendationNeo4jServiceMock,
        },
      ],
    }).compile();

    sut = module.get<RecommendationService>(RecommendationService);
    neo4jService = module.get<Neo4jService>(Neo4jService);
  });
  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  it('should call the service with the correct parameters', async () => {
    //Given
    const query = {
      longitude: 1,
      latitude: 1,
      radius: 1,
    };

    //When
    await sut.getRecommendation(query, getDefaultUser());

    expect(neo4jService.write).toBeCalledWith(
      getMatchingQuery(getDefaultUser().id),
    );
  });

  it('should throw an internal exception', async () => {
    //Given
    const query = {
      take: 1,
      skip: -99,
      longitude: 1,
      latitude: 1,
      radius: 1,
    };

    //When
    const result = sut.getRecommendation(query, getDefaultUser());

    await expect(result).rejects.toThrow(new InternalServerErrorException());
  });

  it('should return 2 events', async () => {
    //Given
    const query = {
      take: 2,
      longitude: 1,
      latitude: 1,
      radius: 1,
    };

    //When
    const result = await sut.getRecommendation(query, getDefaultUser());

    const item1 = createEventEntity();
    item1.id = eventId1;
    const item2 = createEventEntity();
    item2.id = eventId2;

    expect(result).toEqual([item1, item2]);
  });
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

function getMatchingQuery(userId: string): string {
  const matchingQueryPart1 =
    "MATCH (u1:User)-[:PARTICIPATES]->(e:Event)<-[:PARTICIPATES]-(u2:User) WHERE u1 <> u2 AND u1.id = '";

  const matchingQueryPart2 =
    "'" +
    'WITH u1, u2, COUNT(DISTINCT e) as intersection ' +
    'MATCH (u:User)-[:PARTICIPATES]->(e:Event) ' +
    'WHERE u in [u1, u2] ' +
    'WITH u1, u2, intersection, COUNT(DISTINCT e) as uni ' +
    'WITH u1, u2, intersection, uni, (intersection * 1.0 / uni) as jaccard_index ' +
    'MATCH (u2)-[:PARTICIPATES]->(e:Event) ' +
    'WHERE  NOT (u1)-[:PARTICIPATES]->(e:Event)<-[:PARTICIPATES]-(u2) ' +
    'WITH u1, u2, intersection, uni, jaccard_index, collect(distinct e.id) as possibleEvents ' +
    'ORDER BY jaccard_index DESC, u2.id ' +
    'RETURN u1.id as user, u2.id as neighborUserId, intersection, uni, jaccard_index, possibleEvents';

  return matchingQueryPart1 + userId + matchingQueryPart2;
}

function createEventEntity(): EventEntity {
  const location = new LocationEntity();
  location.type = GeolocationEnum.POINT;
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  location.coordinates = [-171.23794, 8.54529];

  const address = new AddressEntity(
    'Österreich',
    'Wien',
    '1010',
    'Stephansplatz',
  );
  address.housenumber = '4';

  const eventEntity = new EventEntity();
  eventEntity.id = '1';
  eventEntity.name = 'Test name';
  eventEntity.description = 'Test description';
  eventEntity.startDateTime = new Date('2020-01-01 00:10:00');
  eventEntity.endDateTime = new Date('2020-01-01 00:12:00');
  eventEntity.location = location;
  eventEntity.address = address;
  eventEntity.price = 12.5;
  eventEntity.public = true;
  eventEntity.imageId = '1';
  eventEntity.organizerId = '1';
  eventEntity.category = [CategoryEnum.SALSA, CategoryEnum.ZOUK];
  eventEntity.address = validAddress;
  eventEntity.participants = [];

  return eventEntity;
}
