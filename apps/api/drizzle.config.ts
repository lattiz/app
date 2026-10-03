import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  // Studio only: schema changes are Supabase CLI migrations in /supabase/migrations.
  schema: './src/database/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
