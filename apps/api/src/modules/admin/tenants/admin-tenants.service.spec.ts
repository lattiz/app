import { PgDialect } from 'drizzle-orm/pg-core';
import type { SQL } from 'drizzle-orm';
import type { PreviewConfig } from '../../../common/billing/preview.config';
import type { Database } from '../../../database/database.module';
import { AdminNotFoundException } from '../admin.exceptions';
import type { StorageUsageService } from '../storage/storage-usage.service';
import { AdminTenantsService } from './admin-tenants.service';

const dialect = new PgDialect();
const TENANT = '6f1b0c3e-8a2d-4f5b-9c71-2e4d8a0b7c11';

describe('AdminTenantsService', () => {
  const execute = jest.fn();
  const find = jest.fn();
  const measure = jest.fn();
  const service = new AdminTenantsService(
    { execute } as unknown as Database,
    {
      enabled: true,
      trialDays: 7,
      maxAssetBytes: 1000,
    } as unknown as PreviewConfig,
    { find, measure } as unknown as StorageUsageService,
  );

  beforeEach(() => {
    execute.mockReset();
    find.mockReset();
    measure.mockReset();
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
});
