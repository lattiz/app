import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

/** Read model for public.app_settings. Schema history lives in supabase/migrations. */
export const appSettings = pgTable('app_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').$type<unknown>().notNull(),
  description: text('description'),
  updatedBy: text('updated_by'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});
