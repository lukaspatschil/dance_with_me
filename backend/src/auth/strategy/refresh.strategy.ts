import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { fingerPrintCookieName } from '../constants';
import { UserEntity } from '../../core/entity/user.entity';
import { AuthService } from '../auth.service';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refreshToken',
) {
  private readonly logger = new Logger(RefreshTokenStrategy.name);

  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(req: Request): Promise<UserEntity> {
    const fingerPrint = req.cookies[fingerPrintCookieName];
    const { refreshToken } = req.body;

    if (!fingerPrint) {
      this.logger.log('Fingerprint cookie is missing from request');
      throw new UnauthorizedException({ error: 'refresh_token_invalid' });
    }

    if (!refreshToken) {
      this.logger.log('Refresh token is missing from request body');
      throw new UnauthorizedException({ error: 'refresh_token_invalid' });
    }

    const user = await this.authService.checkAndDeleteRefreshToken(
      refreshToken,
      fingerPrint,
    );

    if (!user) {
      this.logger.log('Refresh token and fingerprint could not be matched');
      throw new UnauthorizedException({ error: 'refresh_token_invalid' });
    }

    this.logger.log(`User ${user.id} has been successfully authenticated`);
    return user;
  }
}
