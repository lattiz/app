import { PgDialect } from 'drizzle-orm/pg-core';
import { auditListStatements, clipUserAgent } from './admin-audit.queries';

const dialect = new PgDialect();

function flatten(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

describe('audit queries', () => {
  it('filters by actor, action prefix, target, and the time window', () => {
    const rendered = dialect.sqlToQuery(
      auditListStatements({
        actor: 'ana@lattiz.test',
        action: 'template.',
        targetType: 'template',
        targetId: 'cafe',
        from: '2026-10-01T00:00:00.000Z',
        to: '2026-10-17T00:00:00.000Z',
        page: 2,
        pageSize: 500,
      }).items,
    );
    const text = flatten(rendered.sql);
    expect(text).toContain('actor_user_id::text =');
    expect(text).toContain('lower(actor_email) = lower(');
    expect(text).toContain('action LIKE');
    expect(text).toContain('ESCAPE');
    expect(text).toContain('target_type =');
    expect(text).toContain('target_id =');
    expect(text).toContain('created_at >=');
    expect(text).toContain('::timestamptz');
    expect(text).toContain('created_at <=');
    expect(text).toContain('ORDER BY created_at DESC');
    expect(rendered.params).toEqual(
      expect.arrayContaining([
        'ana@lattiz.test',
        'template.%',
        'template',
        'cafe',
        '2026-10-01T00:00:00.000Z',
        '2026-10-17T00:00:00.000Z',
        100,
        100,
      ]),
    );
    expect(rendered.params.filter((param) => param === 500)).toHaveLength(0);
  });

  it('clips pageSize to 100 and keeps an unfiltered list ordered by time', () => {
    const statements = auditListStatements({ pageSize: 1000, page: 1 });
    expect(statements.pageSize).toBe(100);
    const rendered = dialect.sqlToQuery(statements.items);
    const text = flatten(rendered.sql);
    expect(text).not.toContain('WHERE');
    expect(text).toContain('ORDER BY created_at DESC');
    expect(rendered.params).toEqual(expect.arrayContaining([100, 0]));
  });

  it('escapes LIKE wildcards in the action prefix', () => {
    const rendered = dialect.sqlToQuery(
      auditListStatements({ action: '100%_done' }).items,
    );
    expect(rendered.params).toEqual(expect.arrayContaining(['100\\%\\_done%']));
  });

  it('clips the user agent to 200 characters', () => {
    expect(clipUserAgent(null)).toBeNull();
    expect(clipUserAgent('short')).toBe('short');
    expect(clipUserAgent('x'.repeat(250))).toHaveLength(200);
  });
});
