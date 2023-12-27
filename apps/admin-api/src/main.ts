import { FullConfig } from '@app/common/configuration';
import { configureSwagger } from '@app/core/utils';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ValidationError } from 'class-validator';
import * as admin from 'firebase-admin';

import { AppModule } from './app/app.module';
import * as firebaseCreds from '../../../serviceAccountKey.json';

async function bootstrap() {
  // it must be here, please don't ever change it's position :)
  admin.initializeApp({
    credential: admin.credential.cert(
      firebaseCreds.serviceAccount as admin.ServiceAccount
    ),
    storageBucket: firebaseCreds.storageBucket,
  });

  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });

  const configService = app.get(ConfigService<FullConfig, true>);
  const globalPrefix = 'api';
  const swaggerPrefix = 'doc';
  app.setGlobalPrefix(globalPrefix);

  const PORT = configService.get('ADMIN_PORT');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      skipMissingProperties: false,
      skipNullProperties: false,
      stopAtFirstError: true,
      transformOptions: {
        exposeDefaultValues: true,
        enableImplicitConversion: false,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        function richFirstErrorMessage(errors: ValidationError[]): string {
          const topLevelErrors = errors[0].constraints;
          if (topLevelErrors) {
            return Object.values(topLevelErrors)[0];
          }

          return richFirstErrorMessage(errors[0].children);
        }

        return new BadRequestException(richFirstErrorMessage(errors));
      },
    })
  );
  configureSwagger(app, { swaggerPrefix });

  await app.listen(PORT);

  const url = await app.getUrl();

  Logger.log(`📚 Swagger documentation: ${url}/${swaggerPrefix}`);
  Logger.log(`🚀 Application is running on: ${url}/${globalPrefix}`);
}

bootstrap();
