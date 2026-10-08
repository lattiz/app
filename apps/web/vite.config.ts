import path from 'node:path';

import { tanstackRouter } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // tanstackRouter must run before the React plugin.
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    // Vite 8 prebundles React as a default-only CJS interop; optimizing this entry keeps `import { Children } from "react"` and the editor crashes.
    exclude: ['@grapesjs/studio-sdk/react'],
  },
  server: {
    port: 5173,
  },
});
