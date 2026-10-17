import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Logic-only tests (no DOM): kept apart from vite.config.ts so the React/Tailwind plugins don't load.
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
