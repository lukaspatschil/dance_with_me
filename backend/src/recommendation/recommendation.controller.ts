import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Query,
} from '@nestjs/common';
import { QueryDto } from '../core/dto/query.dto';
import { RecommendationService } from './recommendation.service';
import { User } from '../auth/user.decorator';
import { AuthUser } from '../auth/interfaces';
import { EventDto } from '../core/dto/event.dto';
import { EventMapper } from '../core/mapper/event.mapper';
import { EventEntity } from '../core/entity/event.entity';

@Controller('recommendation')
export class RecommendationController {
  private readonly logger = new Logger(RecommendationController.name);

  constructor(private readonly recommendationService: RecommendationService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getRecommendations(
    @Query() queryDto: QueryDto,
    @User() user: AuthUser,
  ): Promise<EventDto[]> {
    this.logger.log(
      'get recommendations for user {} with query: {}',
      JSON.stringify(user),
      JSON.stringify(queryDto),
    );
    const result = await this.recommendationService.getRecommendation(
      queryDto,
      user,
    );
    this.logger.log('Result: ' + JSON.stringify(result));
    return result.map((item) =>
      EventMapper.mapEntityToDto(item as Required<EventEntity>, user.id),
    );
  }
}
