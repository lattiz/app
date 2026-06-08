import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { buildSwaggerConfig } from './swagger';

/**
 * Emits `apps/api/openapi.json` without starting the HTTP server.
 *
 * Builds the Nest application context, generates the OpenAPI document with the
 * same config the runtime uses, writes it next to this package, and exits.
 * This is the source spec for `@lattiz/api-client` type generation.
 */
async function generate(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  const document = SwaggerModule.createDocument(app, buildSwaggerConfig());
  await app.close();

  const outPath = resolve(process.cwd(), 'openapi.json');
  writeFileSync(outPath, JSON.stringify(document, null, 2) + '\n', 'utf8');
  // eslint-disable-next-line no-console
  console.log(`Wrote ${outPath}`);
}

generate().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to generate openapi.json:', error);
  process.exit(1);
});
