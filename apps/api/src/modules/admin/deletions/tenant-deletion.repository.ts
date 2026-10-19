import { Inject, Injectable } from '@nestjs/common';
import { sql, type SQL } from 'drizzle-orm';
import { type Database, DATABASE } from '../../../database/database.module';
import type { DnsProviderName } from '../../domains/domain/dns-provider.port';
import { TenantDeletionActiveException } from '../admin.exceptions';
import {
  type DeletionJob,
  type DeletionJobStatus,
  type DeletionSnapshot,
  type DeletionStep,
  normalizeSteps,
} from './tenant-deletion.model';

const UNIQUE_VIOLATION = '23505';

export interface TenantDeletionContext {
  tenantId: string;
  userId: string;
  slug: string;
  email: string | null;
  stripeCustomerId: string | null;
  domain: {
    name: string;
    source: string;
    registrarDomainId: string | null;
    expiresAt: string | null;
    dnsProvider: DnsProviderName | null;
    dnsZoneId: string | null;
  } | null;
  ga4PropertyId: string | null;
  analyticsIsMock: boolean;
  pendingEmails: number;
  assetsObjects: number;
  brandingObjects: number;
}

export interface InsertDeletionJob {
  tenantId: string;
  userId: string;
  slug: string;
  snapshot: DeletionSnapshot;
  notifyEmail: string | null;
  notifyCustomer: boolean;
  steps: DeletionStep[];
  reason: string;
  actorUserId: string;
  actorEmail: string | null;
}

export interface DeletionListQuery {
  status?: DeletionJobStatus;
  page: number;
  pageSize: number;
}

interface ContextRow {
  id: string;
  user_id: string;
  slug: string;
  email: string | null;
  stripe_customer_id: string | null;
  domain: string | null;
  source: string | null;
  registrar_domain_id: string | null;
  expires_at: string | Date | null;
  dns_provider: string | null;
  dns_zone_id: string | null;
  ga4_property_id: string | null;
  is_mock: boolean | null;
  pending_emails: number | string;
  assets_objects: number | string | null;
  branding_objects: number | string | null;
}

interface JobRow {
  id: string;
  tenant_id: string;
  user_id: string;
  slug: string;
  snapshot: DeletionSnapshot | string;
  notify_email?: string | null;
  notify_customer: boolean;
  status: DeletionJobStatus;
  steps: unknown;
  reason: string;
  actor_user_id: string;
  actor_email: string | null;
  created_at: string | Date;
  updated_at: string | Date;
  finished_at: string | Date | null;
}

interface ExistenceRow {
  tenant_exists: boolean;
  profile_exists: boolean;
  auth_exists: boolean;
}

interface EmailKindRow {
  kind: string;
}

const JOB_COLUMNS = sql`
  id, tenant_id, user_id, slug, snapshot, notify_customer,
  status, steps, reason, actor_user_id, actor_email,
  created_at, updated_at, finished_at
`;

@Injectable()
export class TenantDeletionRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async loadContext(tenantId: string): Promise<TenantDeletionContext | null> {
    const rows = await this.query<ContextRow>(sql`
      SELECT
        t.id,
        t.user_id,
        t.slug,
        u.email,
        t.stripe_customer_id,
        d.domain,
        d.source,
        d.registrar_domain_id,
        d.expires_at,
        d.dns_provider,
        d.dns_zone_id,
        a.ga4_property_id,
        a.is_mock,
        (
          SELECT count(*)
          FROM public.email_outbox e
          WHERE e.tenant_id = t.id AND e.status = 'pending'
        ) AS pending_emails,
        su.assets_objects,
        su.branding_objects
      FROM public.tenants t
      LEFT JOIN auth.users u ON u.id = t.user_id
      LEFT JOIN public.domains d
        ON d.tenant_id = t.id AND d.released_at IS NULL
      LEFT JOIN public.tenant_analytics a ON a.tenant_id = t.id
      LEFT JOIN admin.storage_usage su ON su.tenant_id = t.id
      WHERE t.id = ${tenantId}::uuid
    `);
    const row = rows[0];
    return row ? mapContext(row) : null;
  }

  async insert(input: InsertDeletionJob): Promise<{ id: string }> {
    try {
      const rows = await this.query<{ id: string }>(sql`
        INSERT INTO admin.tenant_deletions (
          tenant_id, user_id, slug, snapshot, notify_email, notify_customer,
          status, steps, reason, actor_user_id, actor_email
        ) VALUES (
          ${input.tenantId}::uuid,
          ${input.userId}::uuid,
          ${input.slug},
          ${JSON.stringify(input.snapshot)}::jsonb,
          ${input.notifyEmail},
          ${input.notifyCustomer},
          'pending',
          ${JSON.stringify(input.steps)}::jsonb,
          ${input.reason},
          ${input.actorUserId}::uuid,
          ${input.actorEmail}
        )
        RETURNING id
      `);
      const row = rows[0];
      if (!row) throw new Error('tenant deletion insert returned no id');
      return { id: row.id };
    } catch (error) {
      if (pgErrorCode(error) === UNIQUE_VIOLATION) {
        throw new TenantDeletionActiveException();
      }
      throw error;
    }
  }

  /** Atomic claim. A missing row means another process owns the job. */
  async claim(id: string): Promise<DeletionJob | null> {
    const rows = await this.query<JobRow>(sql`
      UPDATE admin.tenant_deletions
      SET status = 'running'
      WHERE id = ${id}::uuid
        AND (
          status IN ('pending', 'failed')
          OR (
            status = 'running'
            AND updated_at < now() - interval '10 minutes'
          )
        )
      RETURNING
        id, tenant_id, user_id, slug, snapshot, notify_email, notify_customer,
        status, steps, reason, actor_user_id, actor_email,
        created_at, updated_at, finished_at
    `);
    const row = rows[0];
    return row ? mapJob(row) : null;
  }

  async find(id: string): Promise<DeletionJob | null> {
    const rows = await this.query<JobRow>(sql`
      SELECT ${JOB_COLUMNS}
      FROM admin.tenant_deletions
      WHERE id = ${id}::uuid
    `);
    const row = rows[0];
    return row ? mapJob(row) : null;
  }

  async list(
    query: DeletionListQuery,
  ): Promise<{ items: DeletionJob[]; total: number }> {
    const status = query.status ?? null;
    const offset = (query.page - 1) * query.pageSize;
    const [countRows, itemRows] = await Promise.all([
      this.query<{ total: number | string }>(sql`
        SELECT count(*) AS total
        FROM admin.tenant_deletions
        WHERE ${status}::text IS NULL OR status = ${status}
      `),
      this.query<JobRow>(sql`
        SELECT ${JOB_COLUMNS}
        FROM admin.tenant_deletions
        WHERE ${status}::text IS NULL OR status = ${status}
        ORDER BY created_at DESC
        LIMIT ${query.pageSize}
        OFFSET ${offset}
      `),
    ]);
    return {
      total: asInt(countRows[0]?.total),
      items: itemRows.map((row) => mapJob(row)),
    };
  }

  /** False when the row is no longer ours (another claim won). */
  async writeSteps(id: string, steps: DeletionStep[]): Promise<boolean> {
    const rows = await this.query<{ id: string }>(sql`
      UPDATE admin.tenant_deletions
      SET steps = ${JSON.stringify(steps)}::jsonb
      WHERE id = ${id}::uuid AND status = 'running'
      RETURNING id
    `);
    return rows.length > 0;
  }

  async finish(input: {
    id: string;
    status: 'completed' | 'completed_manual' | 'failed';
    steps: DeletionStep[];
    clearNotifyEmail: boolean;
  }): Promise<boolean> {
    const rows = await this.query<{ id: string }>(sql`
      UPDATE admin.tenant_deletions
      SET status = ${input.status},
          steps = ${JSON.stringify(input.steps)}::jsonb,
          finished_at = now(),
          notify_email = CASE
            WHEN ${input.clearNotifyEmail} THEN NULL
            ELSE notify_email
          END
      WHERE id = ${input.id}::uuid AND status = 'running'
      RETURNING id
    `);
    return rows.length > 0;
  }

  async setTenantOffline(tenantId: string): Promise<void> {
    await this.db.execute(sql`
      UPDATE public.tenants
      SET status = 'inactive'
      WHERE id = ${tenantId}::uuid
    `);
  }

  async cancelPendingEmails(tenantId: string): Promise<void> {
    await this.db.execute(sql`
      UPDATE public.email_outbox
      SET status = 'failed',
          last_error = 'cancelled: tenant deleted'
      WHERE tenant_id = ${tenantId}::uuid
        AND status = 'pending'
    `);
  }

  async pendingEmailKinds(tenantId: string): Promise<string[]> {
    const rows = await this.query<EmailKindRow>(sql`
      SELECT kind
      FROM public.email_outbox
      WHERE tenant_id = ${tenantId}::uuid
        AND status = 'pending'
    `);
    return rows.map((row) => row.kind);
  }

  async accountGone(
    tenantId: string,
    userId: string,
  ): Promise<{ tenant: boolean; user: boolean }> {
    const rows = await this.query<ExistenceRow>(sql`
      SELECT
        EXISTS (
          SELECT 1 FROM public.tenants WHERE id = ${tenantId}::uuid
        ) AS tenant_exists,
        EXISTS (
          SELECT 1 FROM public.profiles WHERE id = ${userId}::uuid
        ) AS profile_exists,
        EXISTS (
          SELECT 1 FROM auth.users WHERE id = ${userId}::uuid
        ) AS auth_exists
    `);
    const row = rows[0];
    return {
      tenant: row ? !row.tenant_exists : false,
      user: row ? !row.profile_exists && !row.auth_exists : false,
    };
  }

  async hasIdempotencyKey(key: string): Promise<boolean> {
    const rows = await this.query<{ found: boolean }>(sql`
      SELECT EXISTS (
        SELECT 1 FROM public.email_outbox WHERE idempotency_key = ${key}
      ) AS found
    `);
    return rows[0]?.found === true;
  }

  private async query<T>(statement: SQL): Promise<T[]> {
    const rows = await this.db.execute(statement);
    return rows as unknown as T[];
  }
}

function mapContext(row: ContextRow): TenantDeletionContext {
  const dnsProvider = isDnsProvider(row.dns_provider) ? row.dns_provider : null;
  return {
    tenantId: row.id,
    userId: row.user_id,
    slug: row.slug,
    email: row.email?.trim() ? row.email.trim() : null,
    stripeCustomerId: row.stripe_customer_id,
    domain: row.domain
      ? {
          name: row.domain,
          source: row.source ?? 'user_provided',
          registrarDomainId: row.registrar_domain_id,
          expiresAt: isoOrNull(row.expires_at),
          dnsProvider,
          dnsZoneId: row.dns_zone_id,
        }
      : null,
    ga4PropertyId: row.ga4_property_id,
    analyticsIsMock: row.is_mock === true,
    pendingEmails: asInt(row.pending_emails),
    assetsObjects: asInt(row.assets_objects),
    brandingObjects: asInt(row.branding_objects),
  };
}

function mapJob(row: JobRow): DeletionJob {
  const snapshot =
    typeof row.snapshot === 'string'
      ? (JSON.parse(row.snapshot) as DeletionSnapshot)
      : row.snapshot;
  return {
    id: row.id,
    tenantId: row.tenant_id,
    userId: row.user_id,
    slug: row.slug,
    snapshot,
    notifyEmail: row.notify_email ?? null,
    notifyCustomer: row.notify_customer,
    status: row.status,
    steps: normalizeSteps(row.steps),
    reason: row.reason,
    actorUserId: row.actor_user_id,
    actorEmail: row.actor_email,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    finishedAt: isoOrNull(row.finished_at),
  };
}

function isDnsProvider(value: string | null): value is DnsProviderName {
  return value === 'cloudflare' || value === 'openprovider';
}

function asInt(value: number | string | null | undefined): number {
  if (value == null) return 0;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function iso(value: string | Date): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function isoOrNull(value: string | Date | null | undefined): string | null {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function pgErrorCode(error: unknown): string | undefined {
  const direct = (error as { code?: unknown } | null)?.code;
  const cause = (error as { cause?: { code?: unknown } } | null)?.cause?.code;
  const code = typeof cause === 'string' ? cause : direct;
  return typeof code === 'string' ? code : undefined;
}
