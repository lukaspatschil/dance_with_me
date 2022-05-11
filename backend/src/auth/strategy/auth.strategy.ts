import { Strategy } from 'passport-custom';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { fingerPrintCookieName } from '../constants';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { AuthUser } from '../interfaces';
import { PasetoService } from '../paseto.service';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'accessToken',
) {
  private readonly logger = new Logger(AccessTokenStrategy.name);

  constructor(private readonly pasetoService: PasetoService) {
    super();
  }

  async validate(req: Request): Promise<AuthUser> {
    const fingerPrint = req.cookies?.[fingerPrintCookieName];
    const authHeader = req.headers?.authorization;
    const bearerMatch = /Bearer\s+(?<token>\S+)/i;
    const token = authHeader?.match(bearerMatch)?.groups?.['token'];

    if (!fingerPrint) {
      this.logger.log('Fingerprint cookie is missing from request');
      throw new UnauthorizedException({ error: 'access_token_invalid' });
    }

    if (!token) {
      this.logger.log('Access token is missing from request header');
      throw new UnauthorizedException({ error: 'access_token_invalid' });
    }

    try {
      const payload = await this.pasetoService.verifyToken(token);

      const fingerPrintValid = AuthService.checkFingerPrint(
        fingerPrint,
        payload.fingerPrintHash,
      );

      if (fingerPrintValid) {
        this.logger.log(`User ${payload.sub} authenticated with access token`);
        return {
          id: payload.sub,
          displayName: payload.displayName,
          pictureUrl: payload.pictureUrl,
          role: payload.role,
        };
      } else {
        throw new Error('fingerprint_invalid');
      }
    } catch (err) {
      this.logger.error(err);
      throw new UnauthorizedException({ error: 'access_token_invalid' });
    }
  }
}
