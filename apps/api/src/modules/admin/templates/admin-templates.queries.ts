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
  u.archived_count
`;

export function templateListStatement(query: TemplateListQuery): SQL {
  const where = templateListWhere(query);
  return sql`
    SELECT ${TEMPLATE_COLUMNS}
    FROM admin.template_usage u
    JOIN public.templates tpl ON tpl.id = u.template_id
    WHERE ${where}
    ORDER BY u.sort_order ASC, u.created_at ASC, u.template_id ASC
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
    parts.push(sql`u.is_active = ${query.status === 'active'}`);
  }

  const q = query.q?.trim();
  if (q) {
    const pattern = containsPattern(q.slice(0, 200));
    parts.push(sql`(
      u.template_id ILIKE ${pattern}
      OR u.name ILIKE ${pattern}
    )`);
  }

  if (parts.length === 0) return sql`TRUE`;
  return sql.join(parts, sql` AND `);
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
