import { PipeTransform, Query, Type, ValidationPipe } from '@nestjs/common';

export function ValidatedQuery(
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
) {
  return Query(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
    ...pipes
  );
}
