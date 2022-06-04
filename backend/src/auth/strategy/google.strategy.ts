import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { NonEmpty } from '../../core/util';
import { Request } from 'express';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: '/auth/authorization_code/google',
      scope: ['email', 'profile'],
    });
  }

  override authenticate(req: Request, options: object): void {
    this.logger.log('Authenticating with Google strategy');
    super.authenticate(req, {
      ...options,
      state: req.query['state'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile & { emails: NonEmpty<Profile['emails']> },
    done: VerifyCallback,
  ): Promise<void> {
    const { id, displayName, name, emails, photos, provider } = profile;
    const user = {
      id: `${provider}:${id}`,
      displayName,
      firstName: name?.givenName,
      lastName: name?.familyName,
      email: emails[0].value,
      emailVerified: emails[0].verified === 'true',
      pictureUrl: photos?.[0]?.value,
    };
    try {
      const resolvedUser = await this.authService.validateProviderUser(user);
      this.logger.log(`User ${resolvedUser.id} validated`);
      done(null, resolvedUser);
    } catch (err: any) {
      this.logger.error(`Failed to validate user ${user.id}: ${err.message}`);
      done(err as Error, false);
    }
  }
}
