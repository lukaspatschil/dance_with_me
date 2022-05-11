import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyFunction } from 'passport-facebook';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  private readonly logger = new Logger(FacebookStrategy.name);

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('FACEBOOK_CLIENT_ID'),
      clientSecret: configService.get('FACEBOOK_CLIENT_SECRET'),
      callbackURL: '/auth/authorization_code/facebook',
      profileFields: [
        'id',
        'displayName',
        'photos',
        'email',
        'first_name',
        'last_name',
      ],
      scope: ['email', 'public_profile'],
    });
  }

  override authenticate(req: Request, options: object): void {
    this.logger.log('Authenticating with Facebook strategy');
    super.authenticate(req, {
      ...options,
      authType: 'rerequest',
      state: req.query['state'],
    });
  }

  validate: VerifyFunction = async (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done,
  ) => {
    const { id, displayName, name, emails, photos, provider } = profile;
    const email = emails?.[0]?.value;
    if (!email) {
      this.logger.error('No email provided by Facebook');
      return done(new Error('No email provided by Facebook'));
    }
    const user = {
      id: `${provider}:${id}`,
      displayName,
      firstName: name?.givenName,
      lastName: name?.familyName,
      email,
      emailVerified: !!email, // Facebook guarantees a verified email, if it is provided.
      pictureUrl: photos?.[0]?.value,
    };
    try {
      const resolvedUser = await this.authService.validateProviderUser(user);
      this.logger.log(`User ${resolvedUser.id} validated`);
      done(null, resolvedUser);
    } catch (err: any) {
      this.logger.error(`Failed to validate user ${user.id}: ${err.message}`);
      done(err, false);
    }
  };
}
