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
    tags: text('tags')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    featured: boolean('featured').notNull().default(false),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    retiredAt: timestamp('retired_at', { withTimezone: true }),
    kitMeta: jsonb('kit_meta').$type<Record<string, unknown>>(),
  },
  (t) => [
    index('templates_tier_idx').on(t.tier),
    index('templates_active_sort_order_idx')
      .on(t.sortOrder)
      .where(sql`${t.isActive}`),
    check('templates_tier_check', sql`${t.tier} IN ('basic', 'pro')`),
    check(
      'templates_retired_at_check',
      sql`${t.retiredAt} IS NULL OR ${t.isActive} = false`,
    ),
  ],
);

export type TemplateRow = typeof templates.$inferSelect;
