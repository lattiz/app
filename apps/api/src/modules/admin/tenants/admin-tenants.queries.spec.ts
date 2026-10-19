import { PgDialect } from 'drizzle-orm/pg-core';
import { tenantListStatements } from './admin-tenants.queries';

const dialect = new PgDialect();

describe('tenantListStatements', () => {
  it('excludes internal tenants unless internal=true', () => {
    const hidden = dialect.sqlToQuery(tenantListStatements({}).items);
    expect(hidden.sql).toContain('o.is_internal = false');
    expect(hidden.sql).toContain('o.created_at DESC');

    const included = dialect.sqlToQuery(
      tenantListStatements({ internal: true }).items,
    );
    expect(included.sql).not.toContain('o.is_internal = false');
  });

  it('applies q and domainExpiringDays as bound parameters', () => {
    const rendered = dialect.sqlToQuery(
      tenantListStatements({
        q: '100%',
        domainExpiringDays: 14,
        sort: 'domain_expires_at',
        order: 'asc',
        page: 3,
        pageSize: 10,
      }).items,
    );

    expect(rendered.sql).toContain('ILIKE');
    expect(rendered.sql).toContain('make_interval');
    expect(rendered.sql).toContain('o.domain_expires_at ASC');
    expect(rendered.params.filter((param) => param === '%100\\%%')).toHaveLength(
      4,
    );
    expect(rendered.params).toContain(14);
    expect(rendered.params).toContain(10);
    expect(rendered.params).toContain(20);
    expect(rendered.params.every((param) => !(param instanceof Date))).toBe(
      true,
    );
  });

  it('ignores a blank search', () => {
    const rendered = dialect.sqlToQuery(
      tenantListStatements({ q: '   ' }).items,
    );
    expect(rendered.sql).not.toContain('ILIKE');
  });
});
