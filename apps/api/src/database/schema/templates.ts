import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/** Mirror of `public.templates` (owned by supabase/migrations; Drizzle never migrates it). */
export const templates = pgTable(
  'templates',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    category: text('category').default('general'),
    previewUrl: text('preview_url'),
    thumbnailUrl: text('thumbnail_url'),
    grapesjsJson: jsonb('grapesjs_json')
      .$type<Record<string, unknown>>()
      .notNull(),
    isActive: boolean('is_active').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    tier: text('tier').$type<'basic' | 'pro'>().notNull().default('basic'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index('templates_tier_idx').on(t.tier),
    check('templates_tier_check', sql`${t.tier} IN ('basic', 'pro')`),
  ],
);

export type TemplateRow = typeof templates.$inferSelect;
