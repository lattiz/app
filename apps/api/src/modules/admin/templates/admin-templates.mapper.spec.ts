import {
  mapTemplateDetail,
  mapTemplateListItem,
  templateStatus,
  type TemplateDetailRow,
} from './admin-templates.mapper';

function row(overrides: Partial<TemplateDetailRow> = {}): TemplateDetailRow {
  return {
    template_id: 'barberia-oxido-v1',
    name: 'Óxido',
    description: 'Barbería',
    category: 'barberia',
    tier: 'pro',
    is_active: true,
    thumbnail_url: 'https://cdn.example/thumb.jpg',
    preview_url: 'https://preview.example/oxido',
    sort_order: 2,
    created_at: '2026-03-01T00:00:00.000Z',
    tenants_using: '4',
    sites_published: 3,
    paying_tenants: 1,
    trial_tenants: 2,
    archived_count: 0,
    tags: ['barberia'],
    featured: true,
    updated_at: '2026-03-02T00:00:00.000Z',
    retired_at: null,
    kit_meta: { giro: 'barberia' },
    section_count: '8',
    ...overrides,
  };
}

describe('template mapping', () => {
  it('maps active, retired and pending', () => {
    expect(templateStatus(true, null)).toBe('active');
    expect(templateStatus(true, '2026-06-01T00:00:00.000Z')).toBe('active');
    expect(templateStatus(false, '2026-06-01T00:00:00.000Z')).toBe('retired');
    expect(templateStatus(false, null)).toBe('pending');
    expect(mapTemplateListItem(row({ is_active: false })).status).toBe(
      'pending',
    );
    expect(
      mapTemplateListItem(
        row({
          is_active: false,
          retired_at: '2026-06-01T00:00:00.000Z',
        }),
      ).status,
    ).toBe('retired');
    const item = mapTemplateListItem(row());
    expect(item.tags).toEqual(['barberia']);
    expect(item.featured).toBe(true);
    expect(item.updatedAt).toBe('2026-03-02T00:00:00.000Z');
    expect(item.retiredAt).toBeNull();
    expect(item.kitMeta).toEqual({ giro: 'barberia' });
  });

  it('never includes grapesjs_json', () => {
    const detail = mapTemplateDetail(
      {
        ...row(),
        grapesjs_json: { pages: [{ secret: 'project-json' }] },
      } as TemplateDetailRow & { grapesjs_json: unknown },
      [
        {
          tenant_id: '6f1b0c3e-8a2d-4f5b-9c71-2e4d8a0b7c11',
          slug: 'cafe',
          name: 'Café',
          plan: 'none',
          entitled: false,
          site_status: 'published',
        },
      ],
    );

    expect(detail).not.toHaveProperty('grapesjs_json');
    expect(detail).not.toHaveProperty('grapesjsJson');
    expect(JSON.stringify(detail)).not.toContain('project-json');
    expect(detail.sectionCount).toBe(8);
    expect(detail.usage).toEqual({
      tenantsUsing: 4,
      sitesPublished: 3,
      payingTenants: 1,
      trialTenants: 2,
      archivedCount: 0,
    });
    expect(detail.tenants).toEqual([
      {
        id: '6f1b0c3e-8a2d-4f5b-9c71-2e4d8a0b7c11',
        slug: 'cafe',
        name: 'Café',
        plan: 'none',
        entitled: false,
        published: true,
      },
    ]);
    expect(detail.thumbnailUrl).toBe('https://cdn.example/thumb.jpg');
    expect(detail.previewUrl).toBe('https://preview.example/oxido');
  });
});
