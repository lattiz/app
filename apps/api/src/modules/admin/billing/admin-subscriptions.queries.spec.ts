import { PgDialect } from 'drizzle-orm/pg-core';
import {
  subscriptionListStatements,
  subscriptionOverviewStatement,
} from './admin-subscriptions.queries';

const dialect = new PgDialect();
const ID = '6f1b0c3e-8a2d-4f5b-9c71-2e4d8a0b7c11';

function flatten(sql: string): string {
  return sql.replace(/\s+/g, ' ').trim();
}

describe('subscriptionListStatements', () => {
  it('excludes internal tenants and orders by created_at desc', () => {
    const hidden = dialect.sqlToQuery(subscriptionListStatements({}).items);
    const text = flatten(hidden.sql);
    expect(text).toContain('s.is_internal = false');
    expect(text).toContain('ORDER BY s.created_at DESC, s.id ASC');
    expect(hidden.params).toEqual(expect.arrayContaining([25, 0]));

    const included = dialect.sqlToQuery(
      subscriptionListStatements({ internal: true }).items,
    );
    expect(included.sql).not.toContain('is_internal');
    expect(flatten(included.sql)).toContain('WHERE TRUE');
  });

  it('binds status, plan, period, search and page as parameters', () => {
    const rendered = dialect.sqlToQuery(
      subscriptionListStatements({
        q: '100%',
        status: ['active', 'past_due'],
        plan: 'pro',
        period: 'annual',
        cancelScheduled: true,
        paymentIssues: true,
        page: 3,
        pageSize: 10,
      }).items,
    );
    const text = flatten(rendered.sql);

    expect(text).toContain('ILIKE');
    expect(text).toContain('s.status IN');
    expect(text).toContain('s.plan =');
    expect(text).toContain('s.billing_period =');
    expect(text).toContain('s.payment_attempts > 0');
    expect(text).toContain("s.status = 'past_due'");
    expect(text).toContain('AND ( s.status NOT IN');
    expect(text).not.toContain('active,past_due');
    expect(
      rendered.params.filter((param) => param === '%100\\%%'),
    ).toHaveLength(3);
    expect(rendered.params).toEqual(
      expect.arrayContaining(['active', 'past_due', 'pro', 'annual', 10, 20]),
    );
    expect(rendered.params.every((param) => !(param instanceof Date))).toBe(
      true,
    );
  });

  it('negates scheduled cancellation and payment issues when false', () => {
    const text = flatten(
      dialect.sqlToQuery(
        subscriptionListStatements({
          cancelScheduled: false,
          paymentIssues: false,
        }).items,
      ).sql,
    );
    expect(text).toContain("AND NOT (( s.status NOT IN ('canceled'");
    expect(text).toContain(
      "AND NOT ((s.payment_attempts > 0 OR s.status = 'past_due'))",
    );
  });

  it('ignores a blank search and an empty status list', () => {
    const text = flatten(
      dialect.sqlToQuery(
        subscriptionListStatements({ q: '   ', status: [] }).items,
      ).sql,
    );
    expect(text).not.toContain('ILIKE');
    expect(text).not.toContain('s.status IN');
  });

  it('loads one subscription by id', () => {
    const rendered = dialect.sqlToQuery(subscriptionOverviewStatement(ID));
    expect(rendered.sql).toContain('admin.subscription_overview');
    expect(rendered.sql).toContain('::uuid');
    expect(rendered.params).toContain(ID);
  });
});
