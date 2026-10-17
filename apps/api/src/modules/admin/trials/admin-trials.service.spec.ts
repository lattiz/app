import type { SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import type { PreviewConfig } from '../../../common/billing/preview.config';
import type { Database } from '../../../database/database.module';
import { AdminTrialsService } from './admin-trials.service';

const dialect = new PgDialect();
const NOW = new Date('2026-06-15T00:00:00.000Z');

describe('AdminTrialsService', () => {
  const execute = jest.fn();
  const service = new AdminTrialsService(
    { execute } as unknown as Database,
    { enabled: true, trialDays: 7 } as unknown as PreviewConfig,
  );

  beforeEach(() => {
    execute.mockReset();
  });

  it('classifies each page row with the live trial length', async () => {
    execute.mockImplementation(async (statement: SQL) => {
      const rendered = dialect.sqlToQuery(statement);
      expect(rendered.params.every((param) => !(param instanceof Date))).toBe(
        true,
      );
      if (rendered.sql.includes('count(*)')) return [{ total: 1 }];
      return [
        {
          tenant_id: '6f1b0c3e-8a2d-4f5b-9c71-2e4d8a0b7c11',
          slug: 'cafe',
          name: 'Café',
          email: 'ana@example.com',
          plan: 'none',
          entitled: false,
          preview_started_at: '2026-06-10T00:00:00.000Z',
          template_id: 'cafe-v1',
          template_name: 'Café',
          converted_at: null,
        },
      ];
    });

    const page = await service.list({ state: 'active' }, NOW);
    expect(page.total).toBe(1);
    expect(page.items[0]?.state).toBe('active');
    expect(page.items[0]?.previewExpiresAt).toBe('2026-06-17T00:00:00.000Z');
    expect(page.items[0]?.hoursToConvert).toBeNull();
  });

  it('adds the live preview rule to the summary', async () => {
    execute.mockResolvedValue([]);
    const summary = await service.summary(NOW);
    expect(summary).toEqual({
      active: 0,
      expiring: 0,
      expired: 0,
      converted: 0,
      conversionRate30d: null,
      conversionRate90d: null,
      medianHoursToConvert: null,
      trialDays: 7,
      enabled: true,
    });
  });
});
