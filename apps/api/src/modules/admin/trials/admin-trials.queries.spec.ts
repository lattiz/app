import { PgDialect } from 'drizzle-orm/pg-core';
import {
  trialListStatements,
  trialPopulationStatement,
} from './admin-trials.queries';

const dialect = new PgDialect();

function flatten(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

describe('trial queries', () => {
  it('hides internal tenants and orders by preview start', () => {
    const rendered = dialect.sqlToQuery(trialListStatements({}, 7).items);
    const text = flatten(rendered.sql);
    expect(text).toContain('o.preview_started_at IS NOT NULL');
    expect(text).toContain('o.is_internal = false');
    expect(text).toContain(
      'ORDER BY o.preview_started_at DESC, o.tenant_id ASC',
    );
    expect(text).toContain('s.created_at > o.preview_started_at');
    expect(rendered.params).toEqual(expect.arrayContaining([25, 0]));
    expect(rendered.params.every((param) => !(param instanceof Date))).toBe(
      true,
    );
  });

  it('binds trial days and the 48h cutoff without Date params', () => {
    const expiring = dialect.sqlToQuery(
      trialListStatements({ state: 'expiring', page: 2, pageSize: 10 }, 7)
        .items,
    );
    const text = flatten(expiring.sql);
    expect(text).toContain("o.plan = 'none'");
    expect(text).toContain('o.entitled IS NOT TRUE');
    expect(text).toContain('make_interval(days =>');
    expect(text).toContain('make_interval(hours =>');
    expect(text).toContain('converted.converted_at IS NULL');
    expect(expiring.params).toEqual(expect.arrayContaining([7, 48, 10, 10]));
    expect(expiring.params.every((param) => !(param instanceof Date))).toBe(
      true,
    );

    const active = flatten(
      dialect.sqlToQuery(trialListStatements({ state: 'active' }, 7).items).sql,
    );
    expect(active).toContain('>= now() + make_interval(hours =>');

    const expired = flatten(
      dialect.sqlToQuery(trialListStatements({ state: 'expired' }, 14).items)
        .sql,
    );
    expect(expired).toContain('converted.converted_at IS NULL AND NOT');

    const converted = flatten(
      dialect.sqlToQuery(trialListStatements({ state: 'converted' }, 7).items)
        .sql,
    );
    expect(converted).toContain('converted.converted_at IS NOT NULL');
    expect(converted).not.toContain('make_interval(days =>');
  });

  it('loads the whole non-internal population for the summary', () => {
    const text = flatten(dialect.sqlToQuery(trialPopulationStatement()).sql);
    expect(text).toContain('o.preview_started_at IS NOT NULL');
    expect(text).toContain('o.is_internal = false');
    expect(text).not.toContain('LIMIT');
    expect(text).not.toContain('make_interval');
  });
});
