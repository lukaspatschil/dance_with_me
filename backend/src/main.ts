import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.use(cookieParser());

  // TODO: remove this when sameSite works in dev environment
  if (process.env['NODE_ENV'] === 'development') {
    app.enableCors({
      origin: process.env['FRONTEND_URL'] ?? 'http://localhost:4200',
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      preflightContinue: false,
      optionsSuccessStatus: HttpStatus.NO_CONTENT,
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  await app.listen(process.env['GATEWAY_PORT'] ?? 3000);
}
void bootstrap();
