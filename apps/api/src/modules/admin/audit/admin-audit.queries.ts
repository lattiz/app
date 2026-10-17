import { sql, type SQL } from 'drizzle-orm';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const MAX_PAGE = 100_000;
const USER_AGENT_MAX = 200;

export interface AuditListQuery {
  actor?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditListStatements {
  items: SQL;
  count: SQL;
  page: number;
  pageSize: number;
}

export function auditListStatements(
  query: AuditListQuery,
): AuditListStatements {
  const page = auditPage(query);
  const where = auditWhere(query);
  return {
    page: page.page,
    pageSize: page.pageSize,
    count: sql`
      SELECT count(*)::int AS total
      FROM admin.audit_log
      ${where}
    `,
    items: sql`
      SELECT
        id,
        actor_user_id,
        actor_email,
        action,
        target_type,
        target_id,
        reason,
        before,
        after,
        ip,
        user_agent,
        created_at
      FROM admin.audit_log
      ${where}
      ORDER BY created_at DESC
      LIMIT ${page.pageSize}::int
      OFFSET ${page.offset}::int
    `,
  };
}

export function clipUserAgent(value: string | null | undefined): string | null {
  if (value == null) return null;
  return value.length <= USER_AGENT_MAX
    ? value
    : value.slice(0, USER_AGENT_MAX);
}

function auditWhere(query: AuditListQuery): SQL {
  const parts: SQL[] = [];
  const actor = blankToUndefined(query.actor);
  if (actor) {
    parts.push(sql`(
      actor_user_id::text = ${actor}
      OR lower(actor_email) = lower(${actor})
    )`);
  }
  const action = blankToUndefined(query.action);
  if (action) {
    parts.push(sql`action LIKE ${likePrefix(action)} ESCAPE '\\'`);
  }
  const targetType = blankToUndefined(query.targetType);
  if (targetType) parts.push(sql`target_type = ${targetType}`);
  const targetId = blankToUndefined(query.targetId);
  if (targetId) parts.push(sql`target_id = ${targetId}`);
  const from = blankToUndefined(query.from);
  if (from) parts.push(sql`created_at >= ${from}::timestamptz`);
  const to = blankToUndefined(query.to);
  if (to) parts.push(sql`created_at <= ${to}::timestamptz`);
  if (parts.length === 0) return sql``;
  return sql`WHERE ${sql.join(parts, sql` AND `)}`;
}

function likePrefix(prefix: string): string {
  return `${prefix.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

function auditPage(query: AuditListQuery): {
  page: number;
  pageSize: number;
  offset: number;
} {
  const page = clampInt(query.page, DEFAULT_PAGE, 1, MAX_PAGE);
  const pageSize = clampInt(
    query.pageSize,
    DEFAULT_PAGE_SIZE,
    1,
    MAX_PAGE_SIZE,
  );
  return { page, pageSize, offset: (page - 1) * pageSize };
}

function clampInt(
  value: number | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  if (value === undefined || !Number.isInteger(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}

function blankToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
