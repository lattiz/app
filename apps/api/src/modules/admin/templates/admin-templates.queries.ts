import { sql, type SQL } from 'drizzle-orm';
import {
  TEMPLATE_STATUSES,
  TEMPLATE_TIERS,
  type TemplateStatus,
  type TemplateTier,
} from './admin-templates.dto';

const TENANT_LIMIT = 200;

export interface TemplateListQuery {
  tier?: TemplateTier;
  category?: string;
  status?: TemplateStatus;
  q?: string;
  tag?: string;
}

export interface TemplateUpdateFields {
  name?: string;
  description?: string | null;
  category?: string;
  tags?: string[];
  featured?: boolean;
}

const TEMPLATE_COLUMNS = sql`
  u.template_id,
  u.name,
  tpl.description,
  u.category,
  u.tier,
  u.is_active,
  tpl.thumbnail_url,
  tpl.preview_url,
  u.sort_order,
  u.created_at,
  u.tenants_using,
  u.sites_published,
  u.paying_tenants,
  u.trial_tenants,
  u.archived_count,
  u.tags,
  u.featured,
  u.updated_at,
  u.retired_at,
  tpl.kit_meta
`;

export function templateListStatement(query: TemplateListQuery): SQL {
  const where = templateListWhere(query);
  return sql`
    SELECT ${TEMPLATE_COLUMNS}
    FROM admin.template_usage u
    JOIN public.templates tpl ON tpl.id = u.template_id
    WHERE ${where}
    ORDER BY u.sort_order ASC, u.name ASC
  `;
}

/**
 * Counts `data-lz-slot` on the first page only. Lax `.**` visits each slot
 * twice; strict mode counts each one once and `silent` yields 0 when the
 * project has no pages. The column itself is never projected.
 */
export function templateDetailStatement(id: string): SQL {
  return sql`
    SELECT
      ${TEMPLATE_COLUMNS},
      (
        SELECT count(*)::int
        FROM jsonb_path_query(
          tpl.grapesjs_json,
          'strict $.pages[0].**."attributes"."data-lz-slot"',
          '{}'::jsonb,
          true
        ) AS slot
      ) AS section_count
    FROM admin.template_usage u
    JOIN public.templates tpl ON tpl.id = u.template_id
    WHERE u.template_id = ${id}
  `;
}

export function templateTenantsStatement(id: string): SQL {
  return sql`
    SELECT
      o.tenant_id,
      o.slug,
      o.name,
      o.plan,
      o.entitled,
      o.site_status
    FROM admin.tenant_overview o
    WHERE o.template_id = ${id}
      AND o.is_internal = false
    ORDER BY o.created_at DESC, o.tenant_id ASC
    LIMIT ${TENANT_LIMIT}::int
  `;
}

export function templateEditableStatement(id: string): SQL {
  return sql`
    SELECT id, name, description, category, tags, featured
    FROM public.templates
    WHERE id = ${id}
  `;
}

export function templateUpdateStatement(
  id: string,
  fields: TemplateUpdateFields,
): SQL {
  const sets: SQL[] = [];
  if (fields.name !== undefined) sets.push(sql`name = ${fields.name}`);
  if (fields.description !== undefined) {
    sets.push(sql`description = ${fields.description}`);
  }
  if (fields.category !== undefined) {
    sets.push(sql`category = ${fields.category}`);
  }
  if (fields.tags !== undefined) {
    sets.push(sql`tags = ${textArray(fields.tags)}`);
  }
  if (fields.featured !== undefined) {
    sets.push(sql`featured = ${fields.featured}`);
  }
  return sql`
    UPDATE public.templates
    SET ${sql.join(sets, sql`, `)}
    WHERE id = ${id}
    RETURNING id
  `;
}

export function templateLifecycleStatement(id: string): SQL {
  return sql`
    SELECT id, is_active, retired_at, preview_url, thumbnail_url
    FROM public.templates
    WHERE id = ${id}
  `;
}

export function templateActivateStatement(id: string): SQL {
  return sql`
    UPDATE public.templates
    SET is_active = true, retired_at = NULL
    WHERE id = ${id}
    RETURNING id
  `;
}

export function templateRetireStatement(id: string): SQL {
  return sql`
    UPDATE public.templates
    SET is_active = false, retired_at = now()
    WHERE id = ${id}
    RETURNING retired_at
  `;
}

/** Locks the catalog rows so two reorders cannot interleave. */
export function templateSortOrdersStatement(ids: readonly string[]): SQL {
  return sql`
    SELECT id, sort_order
    FROM public.templates
    WHERE id IN (${sql.join(
      ids.map((id) => sql`${id}`),
      sql`, `,
    )})
    FOR UPDATE
  `;
}

export function templateReorderStatement(ids: readonly string[]): SQL {
  const rows = ids.map((id, index) => sql`(${id}, ${index * 10}::int)`);
  return sql`
    UPDATE public.templates AS t
    SET sort_order = v.sort_order::int
    FROM (VALUES ${sql.join(rows, sql`, `)}) AS v(id, sort_order)
    WHERE t.id = v.id
  `;
}

export function templateThumbnailStateStatement(id: string): SQL {
  return sql`
    SELECT id, thumbnail_url
    FROM public.templates
    WHERE id = ${id}
  `;
}

export function templateThumbnailUpdateStatement(id: string, url: string): SQL {
  return sql`
    UPDATE public.templates
    SET thumbnail_url = ${url}
    WHERE id = ${id}
    RETURNING id
  `;
}

/** Counts every reference, including internal tenants. */
export function templateReferenceCountsStatement(id: string): SQL {
  return sql`
    SELECT
      (
        SELECT count(*)::int
        FROM public.site_schemas
        WHERE template_id = ${id}
      ) AS sites,
      (
        SELECT count(*)::int
        FROM public.template_archives
        WHERE template_id = ${id}
      ) AS archives
  `;
}

export function templateDeleteSnapshotStatement(id: string): SQL {
  return sql`
    SELECT id, name, tier, category, preview_url, thumbnail_url, kit_meta
    FROM public.templates
    WHERE id = ${id}
  `;
}

export function templateDeleteStatement(id: string): SQL {
  return sql`
    DELETE FROM public.templates
    WHERE id = ${id}
    RETURNING id
  `;
}

export function templateListWhere(query: TemplateListQuery): SQL {
  const parts: SQL[] = [];
  if (query.tier && isOneOf(query.tier, TEMPLATE_TIERS)) {
    parts.push(sql`u.tier = ${query.tier}`);
  }

  const category = query.category?.trim();
  if (category) {
    parts.push(sql`u.category = ${category.slice(0, 100)}`);
  }

  if (query.status && isOneOf(query.status, TEMPLATE_STATUSES)) {
    parts.push(templateStatusFilter(query.status));
  }

  const q = query.q?.trim();
  if (q) {
    const pattern = containsPattern(q.slice(0, 200));
    parts.push(sql`(
      u.template_id ILIKE ${pattern}
      OR u.name ILIKE ${pattern}
    )`);
  }

  const tag = query.tag?.trim();
  if (tag) {
    parts.push(sql`${tag.slice(0, 24)} = ANY(u.tags)`);
  }

  if (parts.length === 0) return sql`TRUE`;
  return sql.join(parts, sql` AND `);
}

function templateStatusFilter(status: TemplateStatus): SQL {
  if (status === 'active') return sql`u.is_active = ${true}`;
  if (status === 'retired') return sql`u.retired_at IS NOT NULL`;
  return sql`u.is_active = ${false} AND u.retired_at IS NULL`;
}

function textArray(values: readonly string[]): SQL {
  if (values.length === 0) return sql`'{}'::text[]`;
  return sql`ARRAY[${sql.join(
    values.map((value) => sql`${value}`),
    sql`, `,
  )}]::text[]`;
}

function containsPattern(raw: string): string {
  return `%${raw.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

function isOneOf<T extends string>(
  value: string,
  allowed: readonly T[],
): value is T {
  return (allowed as readonly string[]).includes(value);
}
