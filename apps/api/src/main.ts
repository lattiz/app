import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from './common/filters/domain-exception.filter';
import { buildSwaggerConfig } from './swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Dev: allow all origins. Prod: CORS_ORIGIN env (comma-separated) or deny.
  const isProd = process.env.NODE_ENV === 'production';
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({ origin: isProd ? (allowedOrigins ?? false) : true, credentials: true });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new DomainExceptionFilter());

  const document = SwaggerModule.createDocument(app, buildSwaggerConfig());
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  console.log(`Lattiz API listening on http://localhost:${port} (docs: /docs)`);
}

void bootstrap();
