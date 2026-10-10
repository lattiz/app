import { Logger } from '@nestjs/common';
import type { SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
import type { PreviewCapabilityService } from '../../common/billing/preview-capability.service';
import type { Database } from '../../database/database.module';
import type { ObjectStoragePort } from '../storage/domain/object-storage.port';
import { TemplateAccessService } from '../templates/template-access.service';
import type { HtmlSanitizerPort } from './html-sanitizer.port';
import { SitesService } from './sites.service';

const dialect = new PgDialect();
const DAY = 86_400_000;

interface Recorded {
  sql: string;
  params: unknown[];
  inTx: boolean;
}

interface Fixture {
  plan: string;
  status: string | null;
  periodEnd: Date | null;
  currentTemplate: { id: string; tier: string } | null;
  failReplace?: boolean;
}

const TEMPLATES = [
  { id: 'barberia-oxido-v1', tier: 'pro', grapesjs_json: { pages: ['pro'] } },
  {
    id: 'barberia-base-claro-v1',
    tier: 'basic',
    grapesjs_json: { pages: ['basic'] },
  },
];

function harness(fixture: Fixture) {
  const recorded: Recorded[] = [];
  const answer = (text: string, params: unknown[]): unknown[] => {
    if (text.includes('LEFT JOIN LATERAL')) {
      return [
        {
          plan: fixture.plan,
          status: fixture.status,
          current_period_end: fixture.periodEnd,
          template_id: fixture.currentTemplate?.id ?? null,
          template_name: fixture.currentTemplate?.id ?? null,
          template_tier: fixture.currentTemplate?.tier ?? null,
        },
      ];
    }
    if (text.includes('AND user_id =')) return [{ ok: 1 }];
    if (text.includes('SELECT id FROM public.tenants'))
      return [{ id: 'tenant-1' }];
    if (text.includes('FROM public.templates') && text.includes('WHERE id =')) {
      return TEMPLATES.filter((t) => params.includes(t.id));
    }
    if (text.includes('FROM public.templates')) return TEMPLATES;
    if (text.includes('SELECT grapesjs_json FROM public.site_schemas')) {
      return fixture.currentTemplate
        ? [{ grapesjs_json: { saved: true } }]
        : [];
    }
    if (text.includes('SELECT status, published_at')) {
      const at = new Date('2026-10-01T00:00:00Z');
      return [
        {
          status: 'published',
          published_at: at,
          updated_at: at,
          created_at: at,
        },
      ];
    }
    if (text.includes('INSERT INTO public.template_archives'))
      return [{ id: 'archive-1' }];
    if (text.startsWith('UPDATE public.site_schemas')) {
      if (fixture.failReplace) throw new Error('replace failed');
      return [{ updated_at: new Date(), published_at: new Date() }];
    }
    if (text.includes('INSERT INTO public.site_schemas'))
      return [{ created_at: new Date() }];
    return [];
  };
  const executor = (inTx: boolean) => ({
    execute: jest.fn((statement: SQL) => {
      const { sql, params } = dialect.sqlToQuery(statement);
      const text = sql.replace(/\s+/g, ' ').trim();
      recorded.push({ sql: text, params, inTx });
      return Promise.resolve().then(() => answer(text, params));
    }),
  });
  const db = {
    ...executor(false),
    transaction: jest.fn((fn: (tx: unknown) => Promise<unknown>) =>
      fn(executor(true)),
    ),
  } as unknown as Database;
  const preview = {
    shouldSanitizePublishedHtml: () => false,
    shouldSeal: () => false,
    shouldVerifyAssetBytes: () => false,
    unpaidAssetByteLimit: () => null,
  } as unknown as PreviewCapabilityService;
  const storage = {
    uploadPublic: jest.fn().mockResolvedValue('https://assets/x.png'),
    usageBytes: jest.fn().mockResolvedValue(0),
  } as unknown as ObjectStoragePort;
  const sites = new SitesService(
    db,
    storage,
    preview,
    { sanitizeUnpaidSiteHtml: (h: string) => h } as HtmlSanitizerPort,
    new TemplateAccessService(db),
  );
  const writes = () => recorded.filter((q) => /^(UPDATE|INSERT)/.test(q.sql));
  return { sites, recorded, writes };
}

const activeBasico = (tier: string | null): Fixture => ({
  plan: 'basico',
  status: 'active',
  periodEnd: new Date(Date.now() + 10 * DAY),
  currentTemplate: tier
    ? {
        id: tier === 'pro' ? 'barberia-oxido-v1' : 'barberia-base-claro-v1',
        tier,
      }
    : null,
});

const locked = { code: 'TEMPLATE_LOCKED_BY_PLAN', status: 403 };
const requiresPro = { code: 'TEMPLATE_REQUIRES_PRO', status: 403 };

describe('SitesService template access', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  describe('a Básico tenant still on a Pro template (locked, A2)', () => {
    it('cannot load, save, upload or publish, and nothing is written', async () => {
      const { sites, writes } = harness(activeBasico('pro'));
      await expect(
        sites.getEditorProject('tenant-1', 'user-1'),
      ).rejects.toMatchObject(locked);
      await expect(
        sites.saveEditorProject('tenant-1', 'user-1', { x: 1 }),
      ).rejects.toMatchObject(locked);
      await expect(
        sites.uploadAssets('tenant-1', 'user-1', [
          {
            originalname: 'a.png',
            mimetype: 'image/png',
            buffer: Buffer.from('x'),
          },
        ]),
      ).rejects.toMatchObject(locked);
      await expect(
        sites.publishSite('tenant-1', 'user-1', { x: 1 }, '<html></html>'),
      ).rejects.toMatchObject(locked);
      expect(writes()).toEqual([]);
    });

    it('can switch to a Básico template: archive first, then replace, in one transaction', async () => {
      const { sites, recorded } = harness(activeBasico('pro'));
      await sites.changeTemplate(
        'tenant-1',
        'user-1',
        'barberia-base-claro-v1',
        true,
      );
      const writes = recorded.filter((q) => /^(UPDATE|INSERT)/.test(q.sql));
      expect(writes.map((q) => q.sql.split(' ').slice(0, 3).join(' '))).toEqual(
        [
          'INSERT INTO public.template_archives',
          'UPDATE public.site_schemas SET',
        ],
      );
      expect(writes.every((q) => q.inTx)).toBe(true);
      expect(writes[0].sql).toContain(
        'SELECT tenant_id, template_id, grapesjs_json, exported_html',
      );
      expect(writes[0].params).toContain('template_switch');
      expect(writes[0].params).toContain('tenant-1');
    });

    it('cannot switch to another Pro template', async () => {
      const { sites, writes } = harness(activeBasico('pro'));
      await expect(
        sites.changeTemplate('tenant-1', 'user-1', 'barberia-oxido-v1', true),
      ).rejects.toMatchObject(requiresPro);
      expect(writes()).toEqual([]);
    });
  });

  it('a failed replace propagates and leaves the archive inside the rolled-back transaction', async () => {
    const { sites, recorded } = harness({
      ...activeBasico('basic'),
      failReplace: true,
    });
    await expect(
      sites.changeTemplate(
        'tenant-1',
        'user-1',
        'barberia-base-claro-v1',
        true,
      ),
    ).rejects.toThrow('replace failed');
    const archive = recorded.find((q) =>
      q.sql.startsWith('INSERT INTO public.template_archives'),
    );
    expect(archive?.inTx).toBe(true);
    expect(
      recorded.filter((q) => !q.inTx && /^(UPDATE|INSERT)/.test(q.sql)),
    ).toEqual([]);
  });

  it('a Básico tenant cannot pick a Pro template first time', async () => {
    const { sites, writes } = harness(activeBasico(null));
    await expect(
      sites.selectTemplate('user-1', 'barberia-oxido-v1'),
    ).rejects.toMatchObject(requiresPro);
    expect(writes()).toEqual([]);
  });

  it('first load seeds the first template the plan includes', async () => {
    const { sites, recorded } = harness(activeBasico(null));
    await expect(sites.getEditorProject('tenant-1', 'user-1')).resolves.toEqual(
      {
        project: { pages: ['basic'] },
      },
    );
    const seed = recorded.find((q) =>
      q.sql.startsWith('INSERT INTO public.site_schemas'),
    );
    expect(seed?.params).toContain('barberia-base-claro-v1');
  });

  it('a Pro tenant can pick and edit a Pro template', async () => {
    const pro: Fixture = { ...activeBasico('pro'), plan: 'pro' };
    const { sites } = harness(pro);
    await expect(
      sites.saveEditorProject('tenant-1', 'user-1', { x: 1 }),
    ).resolves.toMatchObject({ saved: true });
    await expect(
      sites.changeTemplate('tenant-1', 'user-1', 'barberia-oxido-v1', true),
    ).resolves.toMatchObject({ templateId: 'barberia-oxido-v1' });
  });

  it('an involuntary lapse does not lock the template (subscription lockout handles it)', async () => {
    const lapsed: Fixture = {
      plan: 'basico',
      status: 'past_due',
      periodEnd: new Date(Date.now() + 10 * DAY),
      currentTemplate: { id: 'barberia-oxido-v1', tier: 'pro' },
    };
    const { sites } = harness(lapsed);
    await expect(
      sites.saveEditorProject('tenant-1', 'user-1', { x: 1 }),
    ).resolves.toMatchObject({ saved: true });
  });
});
