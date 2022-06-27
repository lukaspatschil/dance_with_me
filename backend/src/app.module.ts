import { Logger, Module } from '@nestjs/common';
import { EventModule } from './event/event.module';
import { PaymentModule } from './payment/payment.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './core/database/database.module';
import { LoggerModule } from './core/logger/logger.module';
import { ImageModule } from './image/image.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './auth/auth.guard';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';
import { ValidationModule } from './validation/validation.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    LoggerModule,
    PaymentModule,
    AuthModule,
    EventModule,
    ImageModule,
    UserModule,
    EmailModule,
    ValidationModule,
    RecommendationModule,
    NotificationModule,
  ],
  controllers: [AuthController],
  providers: [
    Logger,
    ConfigModule,
    {
      provide: APP_GUARD,
      useExisting: AccessTokenGuard,
    },
    AccessTokenGuard,
  ],
})
export class AppModule {}
