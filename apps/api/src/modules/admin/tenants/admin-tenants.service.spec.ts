import { PgDialect } from 'drizzle-orm/pg-core';
import type { SQL } from 'drizzle-orm';
import type { PreviewConfig } from '../../../common/billing/preview.config';
import type { Database } from '../../../database/database.module';
import {
  AdminNotFoundException,
  TenantStatusConflictException,
} from '../admin.exceptions';
import type { AdminMetricsService } from '../metrics/admin-metrics.service';
import type { StorageUsageService } from '../storage/storage-usage.service';
import { AdminTenantsService } from './admin-tenants.service';

const dialect = new PgDialect();
const TENANT = '6f1b0c3e-8a2d-4f5b-9c71-2e4d8a0b7c11';

const ACTOR = '22222222-2222-4222-8222-222222222222';

describe('AdminTenantsService', () => {
  const execute = jest.fn();
  const find = jest.fn();
  const measure = jest.fn();
  const invalidate = jest.fn();
  const service = new AdminTenantsService(
    { execute } as unknown as Database,
    {
      enabled: true,
      trialDays: 7,
      maxAssetBytes: 1000,
    } as unknown as PreviewConfig,
    { find, measure } as unknown as StorageUsageService,
    { invalidate } as unknown as AdminMetricsService,
  );

  beforeEach(() => {
    execute.mockReset();
    find.mockReset();
    measure.mockReset();
    invalidate.mockReset();
  });

  it('returns ADMIN_NOT_FOUND when the overview row is missing', async () => {
    execute.mockResolvedValue([]);
    await expect(service.get(TENANT)).rejects.toBeInstanceOf(
      AdminNotFoundException,
    );
    expect(find).not.toHaveBeenCalled();
  });

  it('does not read outbox payload or recipient', async () => {
    execute.mockImplementation(async (statement: SQL) => {
      const text = dialect.sqlToQuery(statement).sql;
      if (text.includes('email_outbox')) {
        expect(text).not.toMatch(/payload|to_email/);
        expect(text).toContain('left(last_error, 200)');
        expect(text).toContain('LIMIT 20');
      }
      if (text.includes('template_archives')) {
        expect(text).not.toMatch(/project_data|exported_html/);
      }
      if (text.includes('admin.tenant_overview')) {
        return [
          {
            tenant_id: TENANT,
            user_id: TENANT,
            slug: 'cafe',
            name: 'Café',
            plan: 'none',
            status: 'active',
            created_at: '2026-01-01T00:00:00.000Z',
            preview_started_at: null,
            included_domain_used_at: null,
            stripe_customer_id: null,
            email: 'ana@example.com',
            email_confirmed_at: null,
            last_sign_in_at: null,
            is_internal: false,
            tags: [],
            entitled: false,
            subscription_id: null,
            subscription_status: null,
            subscription_plan: null,
            billing_period: null,
            current_period_end: null,
            cancel_at_period_end: null,
            cancel_at: null,
            payment_attempts: null,
            subscription_created_at: null,
            template_id: null,
            template_name: null,
            site_status: null,
            published_at: null,
            site_updated_at: null,
            domain: 'cafe.mx',
            domain_source: 'lattiz_managed',
            dns_status: null,
            domain_expires_at: null,
            domain_suspended_at: null,
            dns_provider: null,
            renewal_status: null,
            renewal_late_deadline_at: null,
            storage_bytes: null,
            storage_measured_at: null,
            flag_notes: 'nota',
          },
        ];
      }
      return [];
    });
    find.mockResolvedValue(null);

    const detail = await service.get(
      TENANT,
      new Date('2026-06-15T12:00:00.000Z'),
    );

    expect(detail.overview.status).toBe('active');
    expect(detail.overview.domainSource).toBe('lattiz_managed');
    expect(detail.previewState).toBe('trial_unstarted');
    expect(detail.flags.notes).toBe('nota');
    expect(detail.storage.assetByteLimit).toBe(1000);
    expect(detail.emails).toEqual([]);
  });

  it('does not measure storage for an unknown tenant', async () => {
    execute.mockResolvedValue([]);
    await expect(service.refreshStorage(TENANT)).rejects.toBeInstanceOf(
      AdminNotFoundException,
    );
    expect(measure).not.toHaveBeenCalled();
  });

  it('suspends an active site and does not touch Stripe, the domain or subscriptions', async () => {
    const texts: string[] = [];
    execute.mockImplementation(async (statement: SQL) => {
      const text = dialect.sqlToQuery(statement).sql;
      texts.push(text);
      if (text.includes('admin.tenant_overview')) return [overview('inactive')];
      if (text.includes('UPDATE public.tenants')) return [{ status: 'inactive' }];
      if (text.includes('SELECT status')) return [{ status: 'active' }];
      return [];
    });
    find.mockResolvedValue(null);

    const result = await service.suspend(TENANT, 'Contenido denunciado');

    const writes = texts.filter((text) =>
      /^\s*update\b/i.test(text),
    );
    expect(writes).toHaveLength(1);
    expect(writes[0]).toContain('UPDATE public.tenants');
    expect(writes[0]).toContain('status');
    expect(writes[0]).not.toMatch(/stripe|domain|subscriptions/i);
    expect(result.before).toEqual({ status: 'active' });
    expect(result.after).toEqual({ status: 'inactive' });
    expect(result.detail.overview.status).toBe('inactive');
  });

  it.each(['inactive', 'cancelled'])(
    'rejects suspend when the site is %s',
    async (status) => {
      execute.mockImplementation(async (statement: SQL) => {
        const text = dialect.sqlToQuery(statement).sql;
        if (text.includes('UPDATE')) {
          throw new Error('suspend must not write');
        }
        if (text.includes('SELECT status')) return [{ status }];
        return [];
      });

      await expect(service.suspend(TENANT, 'Motivo de prueba')).rejects.toBeInstanceOf(
        TenantStatusConflictException,
      );
      await expect(service.suspend(TENANT, 'Motivo de prueba')).rejects.toMatchObject({
        status: 409,
      });
    },
  );

  it('reactivates a suspended site', async () => {
    execute.mockImplementation(async (statement: SQL) => {
      const text = dialect.sqlToQuery(statement).sql;
      if (text.includes('admin.tenant_overview')) return [overview('active')];
      if (text.includes('UPDATE public.tenants')) return [{ status: 'active' }];
      if (text.includes('SELECT status')) return [{ status: 'inactive' }];
      return [];
    });
    find.mockResolvedValue(null);

    const result = await service.reactivate(TENANT);

    expect(result.before).toEqual({ status: 'inactive' });
    expect(result.after).toEqual({ status: 'active' });
    expect(result.detail.overview.status).toBe('active');
  });

  it('rejects reactivate unless the site is suspended', async () => {
    execute.mockImplementation(async (statement: SQL) => {
      const text = dialect.sqlToQuery(statement).sql;
      if (text.includes('UPDATE')) throw new Error('reactivate must not write');
      if (text.includes('SELECT status')) return [{ status: 'active' }];
      return [];
    });

    await expect(service.reactivate(TENANT)).rejects.toMatchObject({
      status: 409,
      code: 'TENANT_STATUS_CONFLICT',
    });
  });

  it('upserts flags and drops the metrics cache when isInternal changes', async () => {
    let upsert: SQL | undefined;
    execute.mockImplementation(async (statement: SQL) => {
      const text = dialect.sqlToQuery(statement).sql;
      if (text.includes('INSERT INTO admin.tenant_flags')) {
        upsert = statement;
        return [{ is_internal: true, tags: ['vip'], notes: 'hola' }];
      }
      if (text.includes('admin.tenant_overview')) {
        return [{ ...overview('active'), is_internal: true, tags: ['vip'], flag_notes: 'hola' }];
      }
      if (text.includes('FROM admin.tenant_flags')) {
        return [{ is_internal: false, tags: ['antes'], notes: 'vieja' }];
      }
      if (text.includes('SELECT 1 AS ok')) return [{ ok: 1 }];
      return [];
    });
    find.mockResolvedValue(null);

    const result = await service.updateFlags(
      TENANT,
      { isInternal: true, tags: ['vip'], notes: 'hola' },
      ACTOR,
    );

    expect(upsert).toBeDefined();
    const query = dialect.sqlToQuery(upsert as SQL);
    expect(query.sql).toContain('ON CONFLICT (tenant_id) DO UPDATE');
    expect(query.sql).toContain('updated_by');
    expect(query.params).toEqual(
      expect.arrayContaining([TENANT, true, 'vip', 'hola', ACTOR]),
    );
    expect(result.before).toEqual({
      isInternal: false,
      tags: ['antes'],
      notes: 'vieja',
    });
    expect(result.after).toEqual({
      isInternal: true,
      tags: ['vip'],
      notes: 'hola',
    });
    expect(invalidate).toHaveBeenCalledTimes(1);
  });

  it('keeps omitted flag fields and skips the metrics cache when internal does not change', async () => {
    execute.mockImplementation(async (statement: SQL) => {
      const text = dialect.sqlToQuery(statement).sql;
      if (text.includes('INSERT INTO admin.tenant_flags')) {
        return [{ is_internal: false, tags: ['antes'], notes: 'nueva' }];
      }
      if (text.includes('admin.tenant_overview')) return [overview('active')];
      if (text.includes('FROM admin.tenant_flags')) {
        return [{ is_internal: false, tags: ['antes'], notes: 'vieja' }];
      }
      if (text.includes('SELECT 1 AS ok')) return [{ ok: 1 }];
      return [];
    });
    find.mockResolvedValue(null);

    const result = await service.updateFlags(TENANT, { notes: 'nueva' }, ACTOR);

    expect(result.before.tags).toEqual(['antes']);
    expect(result.after).toEqual({
      isInternal: false,
      tags: ['antes'],
      notes: 'nueva',
    });
    expect(invalidate).not.toHaveBeenCalled();
  });
});

function overview(status: string) {
  return {
    tenant_id: TENANT,
    user_id: TENANT,
    slug: 'cafe',
    name: 'Café',
    plan: 'none',
    status,
    created_at: '2026-01-01T00:00:00.000Z',
    preview_started_at: null,
    included_domain_used_at: null,
    stripe_customer_id: null,
    email: null,
    email_confirmed_at: null,
    last_sign_in_at: null,
    is_internal: false,
    tags: [] as string[],
    entitled: false,
    subscription_id: null,
    subscription_status: null,
    subscription_plan: null,
    billing_period: null,
    current_period_end: null,
    cancel_at_period_end: null,
    cancel_at: null,
    payment_attempts: null,
    subscription_created_at: null,
    template_id: null,
    template_name: null,
    site_status: null,
    published_at: null,
    site_updated_at: null,
    domain: null,
    domain_source: null,
    dns_status: null,
    domain_expires_at: null,
    domain_suspended_at: null,
    dns_provider: null,
    renewal_status: null,
    renewal_late_deadline_at: null,
    storage_bytes: null,
    storage_measured_at: null,
    flag_notes: null as string | null,
  };
}
