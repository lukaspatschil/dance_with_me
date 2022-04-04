import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentModule } from './payment/payment.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import winston from 'winston';
import 'winston-daily-rotate-file';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '../.develop.env' }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule.forRoot({ envFilePath: '../.develop.env' })],
      useFactory: async (configService: ConfigService) => ({
        transports: [
          new winston.transports.Console(),
          new winston.transports.DailyRotateFile({
            filename: `${configService.get('LOG_FILE_NAME', 'log')}-%DATE%.log`,
            dirname: configService.get('LOG_FILE_PATH', './logs'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
          }),
        ],
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
      inject: [ConfigService],
    }),
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger, ConfigModule],
})
export class AppModule {}
