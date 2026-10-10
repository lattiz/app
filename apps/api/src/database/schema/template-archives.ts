import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

/**
 * Mirror of `public.template_archives`: a tenant's project as it was right before
 * the API replaced it. Server-only (RLS on, no policy); every query filters by tenant_id.
 */
export const templateArchives = pgTable(
  'template_archives',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    templateId: text('template_id'),
    projectData: jsonb('project_data')
      .$type<Record<string, unknown>>()
      .notNull(),
    exportedHtml: text('exported_html'),
    reason: text('reason').notNull(),
    archivedAt: timestamp('archived_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index('template_archives_tenant_idx').on(t.tenantId, t.archivedAt.desc()),
  ],
);

export type TemplateArchiveRow = typeof templateArchives.$inferSelect;
