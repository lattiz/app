import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Shared flat config for the whole monorepo. Run once from the root
 * (`pnpm lint`). Type-aware linting is intentionally NOT enabled — the
 * recommended rule set plus per-package `typecheck` (tsc --noEmit) is enough
 * for this scaffold and keeps lint fast. Generated and build output is ignored.
 */
export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/.turbo/**',
      '**/node_modules/**',
      'packages/api-client/src/generated/**',
      'apps/web/src/routeTree.gen.ts',
      'apps/api/drizzle/**',
      'apps/api/openapi.json',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Backend + shared packages run on Node.
  {
    files: ['apps/api/**/*.ts', 'packages/**/*.ts'],
    languageOptions: { globals: { ...globals.node } },
  },
  // Web app runs in the browser and uses React hooks.
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  // Disables stylistic rules that conflict with Prettier. Must come last.
  prettier,
);
