import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from './common/filters/domain-exception.filter';
import { buildSwaggerConfig } from './swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // CORS for the local web app during development.
  app.enableCors({ origin: true, credentials: true });

  // DTO validation lives in the backend with class-validator/class-transformer.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Consistent, typable error envelope for every error.
  app.useGlobalFilters(new DomainExceptionFilter());

  // Swagger UI at /docs, raw spec at /docs-json.
  const document = SwaggerModule.createDocument(app, buildSwaggerConfig());
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Lattiz API listening on http://localhost:${port} (docs: /docs)`);
}

void bootstrap();
