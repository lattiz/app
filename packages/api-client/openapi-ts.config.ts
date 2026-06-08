import { defineConfig } from '@hey-api/openapi-ts';

/**
 * Generates the typed client + TanStack Query bindings from the API's OpenAPI
 * spec. The spec is produced by `@lattiz/api`'s `generate:openapi` task; this
 * package's `generate:client` task consumes it (wired via `turbo.json`).
 *
 * Output (`src/generated/`) is committed and MUST NOT be hand-edited — it is
 * the single source of API types for the front end.
 */
export default defineConfig({
  input: '../../apps/api/openapi.json',
  output: {
    path: 'src/generated',
  },
  plugins: ['@hey-api/client-fetch', '@tanstack/react-query'],
});
