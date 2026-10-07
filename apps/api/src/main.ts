import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from './common/filters/domain-exception.filter';
import { buildSwaggerConfig } from './swagger';

async function bootstrap(): Promise<void> {
  // rawBody preserves the exact bytes Stripe signs; required for webhook verification.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  // Behind Caddy the client IP is in X-Forwarded-For; rate limiting keys on it. 0 when exposed directly.
  app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS ?? 0));
  app.disable('x-powered-by');

  // GrapesJS project JSON payloads far exceed Express's 100kb default.
  app.useBodyParser('json', { limit: '10mb' });

  // Dev: allow all origins. Prod: CORS_ORIGIN env (comma-separated) or deny.
  const isProd = process.env.NODE_ENV === 'production';
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: isProd ? (allowedOrigins ?? false) : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new DomainExceptionFilter());

  // SIGTERM during a deploy drains in-flight requests and closes the DB pool cleanly.
  app.enableShutdownHooks();

  // Public API surface stays private in prod; the client is generated from openapi.json instead.
  if (!isProd) {
    SwaggerModule.setup(
      'docs',
      app,
      SwaggerModule.createDocument(app, buildSwaggerConfig()),
    );
  }

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  console.log(
    `Lattiz API listening on http://localhost:${port}${isProd ? '' : ' (docs: /docs)'}`,
  );
}

void bootstrap();
