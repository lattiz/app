import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
    // Headless GrapesJS compiles take a few seconds each.
    testTimeout: 60_000,
  },
});
