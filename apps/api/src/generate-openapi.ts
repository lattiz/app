import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { buildSwaggerConfig } from './swagger';

/** Writes openapi.json without starting the HTTP server. Source spec for @lattiz/api-client. */
async function generate(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  try {
    const document = SwaggerModule.createDocument(app, buildSwaggerConfig());
    const outPath = resolve(process.cwd(), 'openapi.json');
    writeFileSync(outPath, JSON.stringify(document, null, 2) + '\n', 'utf8');
    console.log(`Wrote ${outPath}`);
  } finally {
    // Releases the DB pool, the settings refresh timer and the cron jobs.
    await app.close();
  }
}

generate().catch((error) => {
  console.error('Failed to generate openapi.json:', error);
  process.exit(1);
});
