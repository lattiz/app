import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Application user profiles — distinct from Supabase auth.users.
 * Supabase owns identity; this table owns application-level data.
 * The `id` matches the Supabase auth user id (`sub` claim of the JWT).
 */
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  displayName: text('display_name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type ProfileRow = typeof profiles.$inferSelect;
export type NewProfileRow = typeof profiles.$inferInsert;
