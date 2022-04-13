import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventModule } from './event/event.module';
import { PaymentModule } from './payment/payment.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './core/database/database.module';
import { LoggerModule } from './core/logger/logger.module';
import { PictureModule } from './picture/picture.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    LoggerModule,
    PaymentModule,
    EventModule,
    PictureModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger, ConfigModule],
})
export class AppModule {}
