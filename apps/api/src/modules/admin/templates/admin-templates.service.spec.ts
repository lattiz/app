import type { SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import type { Database } from '../../../database/database.module';
import type { ObjectStoragePort } from '../../storage/domain/object-storage.port';
import {
  AdminNotFoundException,
  TemplateDeleteConfirmException,
  TemplateInUseException,
  TemplateNotReadyException,
  TemplateOrderInvalidException,
  TemplateThumbnailRejectedException,
} from '../admin.exceptions';
import { AdminTemplatesService } from './admin-templates.service';

const dialect = new PgDialect();
const ID = 'barberia-oxido-v1';

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);

describe('AdminTemplatesService', () => {
  const execute = jest.fn();
  const transaction = jest.fn();
  const uploadPublic = jest.fn();
  const removePublic = jest.fn();
  const service = new AdminTemplatesService(
    { execute, transaction } as unknown as Database,
    {
      uploadPublic,
      removePublic,
      publicUrl: jest.fn(),
      pathFromPublicUrl: jest.fn(),
      usageBytes: jest.fn(),
    } as unknown as ObjectStoragePort,
  );

  beforeEach(() => {
    execute.mockReset();
    uploadPublic.mockReset();
    removePublic.mockReset();
    transaction.mockReset();
    transaction.mockImplementation(
      async (callback: (tx: { execute: typeof execute }) => Promise<unknown>) =>
        callback({ execute }),
    );
    uploadPublic.mockResolvedValue('https://cdn.example/admin-thumb.png');
  });

  afterEach(() => {
    expect(removePublic).not.toHaveBeenCalled();
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
        return [detailRow()];
      }
      return [];
    });

    const detail = await service.get(ID);
    expect(detail.id).toBe(ID);
    expect(detail.sectionCount).toBe(6);
    expect(detail.status).toBe('active');
    expect(detail.tags).toEqual(['barberia']);
    expect(detail.featured).toBe(true);
    expect(detail.kitMeta).toEqual({ giro: 'barberia' });
    expect(detail).not.toHaveProperty('grapesjs_json');
    expect(detail.tenants).toEqual([]);
  });

  it('audits only the catalog fields that changed and never tier', async () => {
    let updateParams: unknown[] = [];
    execute.mockImplementation(async (statement: SQL) => {
      const query = rendered(statement);
      if (query.text.startsWith('update')) {
        updateParams = query.params;
        expect(query.text).not.toContain('tier');
        return [{ id: ID }];
      }
      if (query.text.includes('section_count')) return [detailRow()];
      if (query.text.includes('tenant_overview')) return [];
      return [
        {
          id: ID,
          name: 'Óxido',
          description: 'Barbería',
          category: 'barberia',
          tags: ['barberia'],
          featured: false,
        },
      ];
    });

    const result = await service.update(ID, {
      name: 'Nuevo',
      tags: ['cafe', 'centro'],
      featured: false,
    });

    expect(updateParams).toEqual(
      expect.arrayContaining(['Nuevo', 'cafe', 'centro', ID]),
    );
    expect(result.before).toEqual({
      name: 'Óxido',
      tags: ['barberia'],
    });
    expect(result.after).toEqual({
      name: 'Nuevo',
      tags: ['cafe', 'centro'],
    });
    expect(uploadPublic).not.toHaveBeenCalled();
  });

  it('rejects activation when preview or thumbnail is missing', async () => {
    execute.mockImplementation(async (statement: SQL) => {
      const query = rendered(statement);
      if (query.text.startsWith('update')) {
        throw new Error('activated');
      }
      return [
        {
          id: ID,
          is_active: false,
          retired_at: null,
          preview_url: null,
          thumbnail_url: 'https://cdn.example/thumb.jpg',
        },
      ];
    });

    await expect(service.activate(ID)).rejects.toMatchObject({
      status: 409,
      details: { missing: ['preview_url'] },
    });
    await expect(service.activate(ID)).rejects.toBeInstanceOf(
      TemplateNotReadyException,
    );

    execute.mockImplementation(async (statement: SQL) => {
      const query = rendered(statement);
      if (query.text.startsWith('update')) throw new Error('activated');
      return [
        {
          id: ID,
          is_active: false,
          retired_at: null,
          preview_url: 'https://preview.example/oxido',
          thumbnail_url: null,
        },
      ];
    });
    await expect(service.activate(ID)).rejects.toMatchObject({
      details: { missing: ['thumbnail_url'] },
    });
  });

  it('activates a ready template and clears retired_at', async () => {
    execute.mockImplementation(async (statement: SQL) => {
      const query = rendered(statement);
      if (query.text.startsWith('update')) {
        expect(query.text).toContain('is_active = true');
        expect(query.text).toContain('retired_at = null');
        return [{ id: ID }];
      }
      if (query.text.includes('section_count')) {
        return [detailRow({ is_active: true, retired_at: null })];
      }
      if (query.text.includes('tenant_overview')) return [];
      return [
        {
          id: ID,
          is_active: false,
          retired_at: '2026-06-01T00:00:00.000Z',
          preview_url: 'https://preview.example/oxido',
          thumbnail_url: 'https://cdn.example/thumb.jpg',
        },
      ];
    });

    const result = await service.activate(ID);
    expect(result.before).toEqual({
      isActive: false,
      retiredAt: '2026-06-01T00:00:00.000Z',
    });
    expect(result.after).toEqual({ isActive: true, retiredAt: null });
    expect(result.template.status).toBe('active');
  });

  it('retires a template and keeps the reason for the audit', async () => {
    execute.mockImplementation(async (statement: SQL) => {
      const query = rendered(statement);
      if (query.text.startsWith('update')) {
        expect(query.text).toContain('is_active = false');
        expect(query.text).toContain('retired_at = now()');
        return [{ retired_at: '2026-06-01T00:00:00.000Z' }];
      }
      if (query.text.includes('section_count')) {
        return [
          detailRow({
            is_active: false,
            retired_at: '2026-06-01T00:00:00.000Z',
          }),
        ];
      }
      if (query.text.includes('tenant_overview')) return [];
      return [
        {
          id: ID,
          is_active: true,
          retired_at: null,
          preview_url: 'https://preview.example/oxido',
          thumbnail_url: 'https://cdn.example/thumb.jpg',
        },
      ];
    });

    const result = await service.retire(ID, 'ya no la ofrecemos');
    expect(result.reason).toBe('ya no la ofrecemos');
    expect(result.before).toEqual({ isActive: true, retiredAt: null });
    expect(result.after).toEqual({
      isActive: false,
      retiredAt: '2026-06-01T00:00:00.000Z',
    });
    expect(result.template.status).toBe('retired');
  });

  it('rejects a reorder that repeats an id before touching the database', async () => {
    await expect(service.reorder(['alfa', 'alfa'])).rejects.toMatchObject({
      status: 400,
      details: { duplicates: ['alfa'] },
    });
    await expect(service.reorder(['alfa', 'alfa'])).rejects.toBeInstanceOf(
      TemplateOrderInvalidException,
    );
    expect(execute).not.toHaveBeenCalled();
    expect(transaction).not.toHaveBeenCalled();
  });

  it('rejects a reorder that names an unknown id', async () => {
    execute.mockImplementation(async (statement: SQL) => {
      const query = rendered(statement);
      if (query.text.startsWith('update')) throw new Error('reordered');
      return [{ id: 'alfa', sort_order: 0 }];
    });

    await expect(service.reorder(['alfa', 'missing'])).rejects.toMatchObject({
      status: 400,
      details: { unknown: ['missing'] },
    });
    expect(transaction).toHaveBeenCalledTimes(1);
  });

  it('rewrites sort_order inside a transaction', async () => {
    execute.mockImplementation(async (statement: SQL) => {
      const query = rendered(statement);
      if (query.text.startsWith('update')) {
        expect(query.params).toEqual(['alfa', 0, 'beta', 10]);
        return [];
      }
      return [
        { id: 'alfa', sort_order: 30 },
        { id: 'beta', sort_order: '0' },
      ];
    });

    const result = await service.reorder(['alfa', 'beta']);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(result.before).toEqual([
      { id: 'alfa', sortOrder: 30 },
      { id: 'beta', sortOrder: 0 },
    ]);
    expect(result.after).toEqual([
      { id: 'alfa', sortOrder: 0 },
      { id: 'beta', sortOrder: 10 },
    ]);
    expect(result.ids).toEqual(['alfa', 'beta']);
  });

  it('rejects a thumbnail whose magic bytes do not match the mime', async () => {
    execute.mockImplementation(async (statement: SQL) => {
      const query = rendered(statement);
      if (query.text.startsWith('update')) throw new Error('saved');
      return [{ id: ID, thumbnail_url: 'https://cdn.example/old.jpg' }];
    });

    await expect(
      service.replaceThumbnail(ID, {
        mimetype: 'image/jpeg',
        size: PNG.length,
        buffer: PNG,
      }),
    ).rejects.toBeInstanceOf(TemplateThumbnailRejectedException);
    expect(uploadPublic).not.toHaveBeenCalled();
  });

  it('stores an admin thumbnail and leaves the previous object in place', async () => {
    execute.mockImplementation(async (statement: SQL) => {
      const query = rendered(statement);
      if (query.text.startsWith('update')) return [{ id: ID }];
      if (query.text.includes('section_count')) return [detailRow()];
      if (query.text.includes('tenant_overview')) return [];
      return [{ id: ID, thumbnail_url: 'https://cdn.example/old.jpg' }];
    });

    const result = await service.replaceThumbnail(ID, {
      mimetype: 'image/png',
      size: PNG.length,
      buffer: PNG,
    });

    expect(uploadPublic).toHaveBeenCalledWith(
      expect.stringMatching(
        /^templates\/barberia-oxido-v1\/admin-thumb-[a-f0-9]{16}\.png$/,
      ),
      PNG,
      'image/png',
    );
    expect(result.before).toEqual({
      thumbnailUrl: 'https://cdn.example/old.jpg',
    });
    expect(result.after).toEqual({
      thumbnailUrl: 'https://cdn.example/admin-thumb.png',
    });
  });

  it('refuses to delete when confirmId does not match', async () => {
    await expect(service.remove(ID, 'otra')).rejects.toBeInstanceOf(
      TemplateDeleteConfirmException,
    );
    expect(execute).not.toHaveBeenCalled();
  });

  it('refuses to delete a template referenced by sites or archives', async () => {
    for (const counts of [
      { sites: 2, archives: 0 },
      { sites: 0, archives: 3 },
    ]) {
      execute.mockReset();
      execute.mockImplementation(async (statement: SQL) => {
        const query = rendered(statement);
        if (query.text.startsWith('delete')) throw new Error('deleted');
        if (query.text.includes('site_schemas')) {
          expect(query.text).not.toContain('is_internal');
          return [counts];
        }
        return [snapshotRow()];
      });

      await expect(service.remove(ID, ID)).rejects.toMatchObject({
        status: 409,
        details: counts,
      });
      await expect(service.remove(ID, ID)).rejects.toBeInstanceOf(
        TemplateInUseException,
      );
    }
  });

  it('deletes the row and audits it without the project json', async () => {
    execute.mockImplementation(async (statement: SQL) => {
      const query = rendered(statement);
      if (query.text.startsWith('delete')) return [{ id: ID }];
      if (query.text.includes('site_schemas')) {
        return [{ sites: 0, archives: 0 }];
      }
      expect(query.text).not.toContain('grapesjs_json');
      return [{ ...snapshotRow(), grapesjs_json: { secret: 'project-json' } }];
    });

    const result = await service.remove(ID, ID);
    expect(result.before).toEqual({
      id: ID,
      name: 'Óxido',
      tier: 'basic',
      category: 'barberia',
      preview_url: 'https://preview.example/oxido',
      thumbnail_url: 'https://cdn.example/thumb.jpg',
      kit_meta: { giro: 'barberia' },
    });
    expect(result.before).not.toHaveProperty('grapesjs_json');
    expect(JSON.stringify(result.before)).not.toContain('project-json');
    expect(uploadPublic).not.toHaveBeenCalled();
  });
});

function rendered(statement: SQL): { text: string; params: unknown[] } {
  const query = dialect.sqlToQuery(statement);
  return {
    text: query.sql.replace(/\s+/g, ' ').trim().toLowerCase(),
    params: query.params,
  };
}

function detailRow(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    template_id: ID,
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
    tags: ['barberia'],
    featured: true,
    updated_at: '2026-03-02T00:00:00.000Z',
    retired_at: null,
    kit_meta: { giro: 'barberia' },
    section_count: 6,
    ...overrides,
  };
}

function snapshotRow(): Record<string, unknown> {
  return {
    id: ID,
    name: 'Óxido',
    tier: 'basic',
    category: 'barberia',
    preview_url: 'https://preview.example/oxido',
    thumbnail_url: 'https://cdn.example/thumb.jpg',
    kit_meta: { giro: 'barberia' },
  };
}
