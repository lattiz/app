import { PgDialect } from 'drizzle-orm/pg-core';
import {
  domainFactsStatement,
  funnelStatement,
  kpiUpsertStatement,
  signupsStatement,
  subscriptionFactsStatement,
  templateUsageStatement,
} from './admin-metrics.queries';

const dialect = new PgDialect();

function flatten(sql: string): string {
  return sql.replace(/\s+/g, ' ').trim();
}

describe('admin metrics queries', () => {
  it('excludes internal tenants and binds timestamps as text', () => {
    const subscriptions = flatten(
      dialect.sqlToQuery(subscriptionFactsStatement()).sql,
    );
    const domains = flatten(dialect.sqlToQuery(domainFactsStatement()).sql);
    const funnel = dialect.sqlToQuery(
      funnelStatement('2026-09-18T06:00:00.000Z', '2026-10-17T06:00:00.000Z'),
    );
    const signups = dialect.sqlToQuery(
      signupsStatement('2026-10-16T06:00:00.000Z', '2026-10-17T06:00:00.000Z'),
    );
    const upsert = dialect.sqlToQuery(
      kpiUpsertStatement({
        day: '2026-10-16',
        mrrCents: null,
        currency: null,
        payingTenants: 1,
        trialsActive: 2,
        signups: 3,
        newPaying: 4,
        cancellations: 0,
        publishedSites: 5,
        capturedAt: '2026-10-17T06:15:00.000Z',
      }),
    );

    expect(subscriptions).toContain('NOT COALESCE(f.is_internal, false)');
    expect(domains).toContain('NOT COALESCE(f.is_internal, false)');
    expect(domains).toContain("c.status = 'open'");
    expect(flatten(funnel.sql)).toContain('preview_started_at IS NOT NULL');
    expect(flatten(funnel.sql)).toContain('ss.published_at IS NOT NULL');
    expect(flatten(funnel.sql)).toContain('NOT COALESCE(f.is_internal, false)');
    for (const rendered of [funnel, signups, upsert]) {
      expect(rendered.params.every((param) => !(param instanceof Date))).toBe(
        true,
      );
    }
    expect(upsert.sql).toContain('ON CONFLICT (day)');
    expect(templateUsageStatement()).toBeDefined();
    expect(
      flatten(dialect.sqlToQuery(templateUsageStatement()).sql),
    ).not.toContain('email');
  });
});
