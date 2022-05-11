import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategy/google.strategy';
import { AccessTokenStrategy } from './strategy/auth.strategy';
import { ConfigModule } from '@nestjs/config';
import { FacebookStrategy } from './strategy/facebook.strategy';
import { PasetoService } from './paseto.service';
import { RefreshTokenStrategy } from './strategy/refresh.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RefreshTokenDocument,
  RefreshTokenSchema,
} from '../core/schema/refreshtoken.schema';

@Module({
  imports: [
    UserModule,
    PassportModule,
    ConfigModule,
    MongooseModule.forFeature([
      { name: RefreshTokenDocument.name, schema: RefreshTokenSchema },
    ]),
  ],
  providers: [
    AuthService,
    FacebookStrategy,
    GoogleStrategy,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    PasetoService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
