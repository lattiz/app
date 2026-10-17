import { PgDialect } from 'drizzle-orm/pg-core';
import {
  templateDetailStatement,
  templateListStatement,
  templateTenantsStatement,
} from './admin-templates.queries';

const dialect = new PgDialect();

function flatten(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

describe('template queries', () => {
  it('lists every template by sort order without the project json', () => {
    const rendered = dialect.sqlToQuery(templateListStatement({}));
    const text = flatten(rendered.sql);
    expect(text).toContain('FROM admin.template_usage u');
    expect(text).toContain(
      'ORDER BY u.sort_order ASC, u.created_at ASC, u.template_id ASC',
    );
    expect(text).not.toContain('LIMIT');
    expect(text).not.toContain('grapesjs_json');
  });

  it('binds tier, category, pending status and an escaped search', () => {
    const rendered = dialect.sqlToQuery(
      templateListStatement({
        tier: 'pro',
        category: 'barberia',
        status: 'pending',
        q: '100%',
      }),
    );
    const text = flatten(rendered.sql);
    expect(text).toContain('u.tier =');
    expect(text).toContain('u.category =');
    expect(text).toContain('u.is_active =');
    expect(text).toContain('u.template_id ILIKE');
    expect(text).toContain('u.name ILIKE');
    expect(rendered.params).toEqual(
      expect.arrayContaining(['pro', 'barberia', false, '%100\\%%']),
    );
    expect(text).not.toContain('grapesjs_json');
  });

  it('counts first-page sections without projecting grapesjs_json', () => {
    const rendered = dialect.sqlToQuery(
      templateDetailStatement('barberia-oxido-v1'),
    );
    const text = flatten(rendered.sql);
    expect(text).toContain('jsonb_path_query');
    expect(text).toContain(
      `'strict $.pages[0].**."attributes"."data-lz-slot"'`,
    );
    expect(text).toContain('AS section_count');
    expect(text).not.toMatch(/\bAS\s+grapesjs_json\b/i);
    expect(text).not.toMatch(/SELECT\s+tpl\.grapesjs_json\b/i);
    expect(text).not.toContain('barberia-oxido-v1');
    expect(rendered.params).toContain('barberia-oxido-v1');
  });

  it('limits template tenants to 200 and skips internal accounts', () => {
    const rendered = dialect.sqlToQuery(
      templateTenantsStatement('barberia-oxido-v1'),
    );
    const text = flatten(rendered.sql);
    expect(text).toContain('o.is_internal = false');
    expect(text).toContain('LIMIT');
    expect(rendered.params).toEqual(
      expect.arrayContaining(['barberia-oxido-v1', 200]),
    );
    expect(text).not.toContain('grapesjs_json');
  });
});
