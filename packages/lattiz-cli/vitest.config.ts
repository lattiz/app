import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
    // The harvester and promote gates load the kit (jsdom, palette builder).
    testTimeout: 60_000,
  },
});
