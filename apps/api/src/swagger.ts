import { DocumentBuilder } from '@nestjs/swagger';

/**
 * Single source of truth for the OpenAPI document config, shared by the
 * runtime Swagger UI (`main.ts`) and the `generate:openapi` script so the
 * served spec and the emitted `openapi.json` never drift.
 */
export function buildSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('Lattiz API')
    .setDescription(
      'Lattiz resource server. Auth is handled by Supabase; this API only ' +
        'validates Supabase-issued JWTs (JWKS / ES256, audience `authenticated`).',
    )
    .setVersion('0.0.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Supabase access token (JWT).',
    })
    .build();
}
