import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
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
  ],
  controllers: [],
  providers: [],
})
export class LoggerModule {}
