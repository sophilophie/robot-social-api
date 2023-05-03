import {AppModule} from './app.module';
import {NestFactory} from '@nestjs/core';
import {ConfigService} from '@nestjs/config';
import {ValidationPipe} from '@nestjs/common';
import {NestExpressApplication} from '@nestjs/platform-express';
import helmet from 'helmet';

async function bootstrap(): Promise<void> {
  const app: NestExpressApplication = await NestFactory.create(AppModule);
  const config: ConfigService = app.get(ConfigService);
  const port: number = config.get<number>('PORT') ?? 3000;

  app.useGlobalPipes(new ValidationPipe({whitelist: true}));
  app.use(helmet());
  app.enableCors();

  await app.listen(port, () => console.log('Listening on port', port));
}
bootstrap();
