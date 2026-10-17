import { PgDialect } from 'drizzle-orm/pg-core';
import type { SQL } from 'drizzle-orm';
import type { Database } from '../../../database/database.module';
import { AdminNotFoundException } from '../admin.exceptions';
import { AdminTemplatesService } from './admin-templates.service';

const dialect = new PgDialect();

describe('AdminTemplatesService', () => {
  const execute = jest.fn();
  const service = new AdminTemplatesService({
    execute,
  } as unknown as Database);

  beforeEach(() => {
    execute.mockReset();
  });

  it('returns ADMIN_NOT_FOUND when the template is missing', async () => {
    execute.mockResolvedValue([]);
    await expect(service.get('missing')).rejects.toBeInstanceOf(
      AdminNotFoundException,
    );
  });

  it('does not select the project json as a column', async () => {
    execute.mockImplementation(async (statement: SQL) => {
      const text = dialect.sqlToQuery(statement).sql;
      expect(text).not.toMatch(/SELECT\s+[^]*\bgrapesjs_json\s+AS\b/i);
      if (text.includes('section_count')) {
        return [
          {
            template_id: 'barberia-oxido-v1',
            name: 'Óxido',
            description: null,
            category: 'barberia',
            tier: 'basic',
            is_active: true,
            thumbnail_url: null,
            preview_url: null,
            sort_order: 1,
            created_at: '2026-03-01T00:00:00.000Z',
            tenants_using: 0,
            sites_published: 0,
            paying_tenants: 0,
            trial_tenants: 0,
            archived_count: 0,
            section_count: 6,
          },
        ];
      }
      return [];
    });

    const detail = await service.get('barberia-oxido-v1');
    expect(detail.id).toBe('barberia-oxido-v1');
    expect(detail.sectionCount).toBe(6);
    expect(detail).not.toHaveProperty('grapesjs_json');
    expect(detail.tenants).toEqual([]);
  });
});
