import {
  Controller,
  Post,
  UseGuards,
  Logger,
  Get,
  Req,
  Res,
  HttpCode,
  Param,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthTokens, AuthUser } from './interfaces';
import { Request, Response } from 'express';
import {
  fingerPrintCookieMaxAge,
  fingerPrintCookieName,
  fingerPrintCookieSameSite,
} from './constants';
import { Public } from './auth.guard';
import { UserEntity } from '../core/entity/user.entity';
import { ConfigService } from '@nestjs/config';
import { IdentityProviderGuard } from './social.guard';
import { User } from './user.decorator';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  private authenticatedCookie(fingerPrint: string, res: Response) {
    return res.cookie(fingerPrintCookieName, fingerPrint, {
      maxAge: fingerPrintCookieMaxAge,
      httpOnly: true,
      secure: process.env['NODE_ENV'] !== 'test', // supertest does not support secure cookies
      sameSite: fingerPrintCookieSameSite,
      path: this.configService.get<string>('API_BASE_PATH', '/'),
    });
  }

  private static fragment(params: { [k: string]: string | number | null }) {
    return Object.entries(params)
      .filter(([, value]) => Boolean(value))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
  }

  private authenticatedRedirect(
    tokens: AuthTokens,
    res: Response,
    state: string | null,
  ) {
    const { accessToken, refreshToken, fingerPrint } = tokens;
    const expiresAt = new Date().getTime() + fingerPrintCookieMaxAge;
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const loginCallbackPath = this.configService.get('FRONTEND_LOGIN_CALLBACK');
    const fragment = AuthController.fragment({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      state,
    });
    return this.authenticatedCookie(fingerPrint, res).redirect(
      `${frontendUrl}${loginCallbackPath}#${fragment}`,
    );
  }

  private authenticatedResponse(tokens: AuthTokens, res: Response) {
    const { accessToken, refreshToken, fingerPrint } = tokens;
    const expiresAt = new Date().getTime() + fingerPrintCookieMaxAge;
    return this.authenticatedCookie(fingerPrint, res)
      .json({
        accessToken,
        refreshToken,
        expiresAt,
      })
      .send();
  }

  @Public()
  @Get('login_redirect/:provider')
  @UseGuards(IdentityProviderGuard)
  providerRedirect(@Param() provider: 'google' | 'facebook') {
    this.logger.log(`Redirect to ${provider} login`);
  }

  @Public()
  @Get('authorization_code/:provider')
  @UseGuards(IdentityProviderGuard)
  async providerCallback(
    @Param() provider: 'google' | 'facebook',
    @Query('state') state: string | null,
    @Req() req: Request & { user: UserEntity },
    @Res() res: Response,
  ) {
    this.logger.log(`Received callback from ${provider} login`);
    const tokens = await this.authService.authenticateUser(req.user);
    return this.authenticatedRedirect(tokens, res, state);
  }

  @Public()
  @Post('refresh_token')
  @HttpCode(200)
  @UseGuards(AuthGuard('refreshToken'))
  async refreshToken(
    @Req() req: Request & { user: UserEntity },
    @Res() res: Response,
  ) {
    this.logger.log(`Refreshing tokens for user ${req.user.id}`);
    const tokens = await this.authService.authenticateUser(req.user);
    return this.authenticatedResponse(tokens, res);
  }

  @Public()
  @Post('revoke')
  @HttpCode(204)
  @UseGuards(AuthGuard('refreshToken'))
  logout(@Req() req: Request & { user: UserEntity }, @Res() res: Response) {
    this.logger.log(`Revoking refresh token for user ${req.user.id}`);
    return res.clearCookie(fingerPrintCookieName).send();
  }

  @Post('force_logout')
  @HttpCode(204)
  async forceLogout(@User() user: AuthUser, @Res() res: Response) {
    this.logger.log(`Forcing logout from all sessions for user ${user.id}`);
    await this.authService.forceLogout(user);
    return res.clearCookie(fingerPrintCookieName).send();
  }
}
