import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { randomBytes, createHash } from 'crypto';
import {
  AuthProviderUser,
  AuthTokens,
  AuthUser,
  PasetoPayloadInput,
} from './interfaces';
import { PasetoService } from './paseto.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RefreshTokenDocument } from '../core/schema/refreshtoken.schema';
import { UserEntity } from '../core/entity/user.entity';
import { UserMapper } from '../core/mapper/user.mapper';

/* eslint @typescript-eslint/no-magic-numbers: 0 */

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly pasetoService: PasetoService,
    @InjectModel(RefreshTokenDocument.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  private static generateRefreshToken(): string {
    return randomBytes(32).toString('base64url');
  }

  private static generateFingerPrint() {
    const fingerPrint = randomBytes(32).toString('base64url');
    const hash = createHash('sha256').update(fingerPrint).digest('base64url');
    return { fingerPrint, hash };
  }

  public static checkFingerPrint(fingerPrint: string, hash: string) {
    return (
      createHash('sha256').update(fingerPrint).digest('base64url') === hash
    );
  }

  async authenticateUser(user: UserEntity): Promise<AuthTokens> {
    this.logger.log(`Authenticating user ${user.id}`);
    const { fingerPrint, hash } = AuthService.generateFingerPrint();
    const refreshToken = AuthService.generateRefreshToken();

    await this.refreshTokenModel.create({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _id: refreshToken,
      fingerprint: fingerPrint,
      user: user.id,
    });

    const payloadInput: PasetoPayloadInput = {
      sub: user.id,
      role: user.role,
      displayName: user.displayName,
      pictureUrl: user.pictureUrl ?? undefined,
      fingerPrintHash: hash,
    };

    const accessToken = await this.pasetoService.createToken(payloadInput);

    this.logger.log(`User ${user.id} authenticated`);
    return {
      accessToken,
      refreshToken,
      fingerPrint,
    };
  }

  async forceLogout(user: AuthUser): Promise<void> {
    await this.refreshTokenModel.deleteMany({ user: user.id });
    this.logger.log(`User ${user.id} logged out from all devices`);
  }

  async validateProviderUser(user: AuthProviderUser): Promise<UserEntity> {
    return await this.userService.findAndUpdateOrCreate(user);
  }

  async checkAndDeleteRefreshToken(
    tokenId: string,
    fingerPrint: string,
  ): Promise<UserEntity | null> {
    const token = await this.refreshTokenModel
      .findByIdAndDelete(tokenId)
      .populate('user');
    this.logger.log(`Refresh token found: ${token}`);
    if (!token) {
      this.logger.log('Refresh token could not be not found');
      return null;
    } else if (token.fingerprint !== fingerPrint) {
      this.logger.log('Fingerprint did not match refresh token');
      return null;
    }
    return UserMapper.mapDocumentToEntity(token.user);
  }
}
