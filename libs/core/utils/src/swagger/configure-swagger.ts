import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configureSwagger(
  app: INestApplication,
  {
    swaggerPrefix = 'doc',
  }: {
    swaggerPrefix?: string;
  }
) {
  const swaggerDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Art Date API')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'headers',
        name: 'Authorization',
      })
      .setDescription(
        `
* _Last update: ${new Date().toLocaleString()}_
`
      )
      .setVersion('0.0.1')
      .build()
  );

  SwaggerModule.setup(swaggerPrefix, app, swaggerDoc, {
    useGlobalPrefix: false,
    swaggerOptions: {
      persistAuthorization: true,
      tryItOutEnabled: true,
      filter: true,
    },
    explorer: false,
  });
}
