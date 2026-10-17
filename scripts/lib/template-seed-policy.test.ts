import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildKitMeta,
  pickKitIdentity,
  shouldActivate,
  shouldReplaceThumbnail,
  templateWriteFields,
  type KitMetaRecord,
  type TemplateSeedInput,
} from './template-seed-policy';

const kitMeta: KitMetaRecord = {
  vertical: 'floreria',
  sections: [{ slot: 'hero', variant: 'overlap', role: 'hero' }],
  gitSha: 'abc1234',
  seededAt: '2026-10-17T12:00:00.000Z',
};

function args(patch: Partial<TemplateSeedInput> = {}): TemplateSeedInput {
  return {
    name: 'Casa Confeti',
    description: 'Salón de fiestas',
    category: 'florerias',
    sortOrder: 10,
    tier: 'pro',
    grapesjsJson: { pages: [] },
    previewUrl: 'https://templates.lattiz.app/floreria-casa-confeti-v1',
    kitMeta,
    ...patch,
  };
}

const CATALOG = ['name', 'description', 'category', 'sort_order'] as const;
const ALWAYS = ['grapesjs_json', 'tier', 'preview_url', 'kit_meta'] as const;

describe('templateWriteFields', () => {
  it('al crear escribe catálogo, proyecto, tier, preview y kit_meta', () => {
    const fields = templateWriteFields(null, args(), false);
    for (const key of [...CATALOG, ...ALWAYS])
      assert.equal(key in fields, true);
    assert.equal(fields.name, 'Casa Confeti');
    assert.equal(fields.sort_order, 10);
    assert.equal(fields.tier, 'pro');
    assert.equal(fields.kit_meta, kitMeta);
  });

  it('al crear con el flag escribe los mismos campos', () => {
    const fields = templateWriteFields(null, args(), true);
    for (const key of [...CATALOG, ...ALWAYS])
      assert.equal(key in fields, true);
  });

  it('al crear omite descripción, orden y preview cuando no vienen', () => {
    const fields = templateWriteFields(
      null,
      args({ description: undefined, sortOrder: undefined, previewUrl: null }),
      false,
    );
    assert.equal('description' in fields, false);
    assert.equal('sort_order' in fields, false);
    assert.equal('preview_url' in fields, false);
    assert.equal(fields.name, 'Casa Confeti');
    assert.equal('kit_meta' in fields, true);
  });

  it('al actualizar sin flag no pisa nombre, descripción, categoría ni orden', () => {
    const project = { pages: [] };
    const fields = templateWriteFields(
      { id: 'floreria-casa-confeti-v1' },
      args({ grapesjsJson: project }),
      false,
    );
    for (const key of CATALOG) assert.equal(key in fields, false);
    for (const key of ALWAYS) assert.equal(key in fields, true);
    assert.equal(fields.grapesjs_json, project);
  });

  it('al actualizar con flag pisa el catálogo y conserva el orden 0', () => {
    const fields = templateWriteFields(
      { id: 'floreria-casa-confeti-v1' },
      args({ sortOrder: 0, description: '' }),
      true,
    );
    assert.equal(fields.name, 'Casa Confeti');
    assert.equal(fields.description, '');
    assert.equal(fields.category, 'florerias');
    assert.equal(fields.sort_order, 0);
    assert.equal(fields.tier, 'pro');
  });

  it('al actualizar con flag no inventa descripción ni orden si no se pasaron', () => {
    const fields = templateWriteFields(
      { id: 'x' },
      args({ description: undefined, sortOrder: undefined }),
      true,
    );
    assert.equal(fields.name, 'Casa Confeti');
    assert.equal('description' in fields, false);
    assert.equal('sort_order' in fields, false);
  });
});

describe('shouldReplaceThumbnail', () => {
  const seed = 'https://assets.lattiz.app/templates/x/thumb-abc.jpg';
  const admin = 'https://assets.lattiz.app/templates/x/admin-thumb-abc.webp';

  it('reemplaza si no hay miniatura o es la del seed', () => {
    assert.equal(shouldReplaceThumbnail(null, false), true);
    assert.equal(shouldReplaceThumbnail(undefined, false), true);
    assert.equal(shouldReplaceThumbnail('', false), true);
    assert.equal(shouldReplaceThumbnail(seed, false), true);
  });

  it('conserva la miniatura del admin salvo con el flag', () => {
    assert.equal(shouldReplaceThumbnail(admin, false), false);
    assert.equal(shouldReplaceThumbnail(admin, true), true);
    assert.equal(shouldReplaceThumbnail(seed, true), true);
    assert.equal(shouldReplaceThumbnail(null, true), true);
  });
});

describe('shouldActivate', () => {
  const ready = { previewLive: true, thumbnailReady: true, retiredAt: null };

  it('activa solo con preview y miniatura, si no está retirada', () => {
    assert.equal(shouldActivate(ready), true);
  });

  it('no activa una plantilla pendiente', () => {
    assert.equal(shouldActivate({ ...ready, previewLive: false }), false);
    assert.equal(shouldActivate({ ...ready, thumbnailReady: false }), false);
    assert.equal(
      shouldActivate({
        previewLive: false,
        thumbnailReady: false,
        retiredAt: null,
      }),
      false,
    );
  });

  it('no reactiva una plantilla retirada', () => {
    assert.equal(
      shouldActivate({ ...ready, retiredAt: '2026-10-01T00:00:00.000Z' }),
      false,
    );
    assert.equal(
      shouldActivate({
        previewLive: false,
        thumbnailReady: false,
        retiredAt: '2026-10-01T00:00:00.000Z',
      }),
      false,
    );
  });
});

describe('buildKitMeta', () => {
  const meta = {
    vertical: 'floreria',
    family: 'service-landing',
    archetype: 'editorial-atelier',
    slots: [
      { slot: 'hero', variant: 'overlap', role: 'hero', counted: true },
      { slot: 'faq', variant: 'grid', role: 'faq', counted: true },
      { slot: 'roto' },
    ],
  };
  const extras = {
    direction: 'jardin-suave',
    palette: 'pal-menta-tinta',
    fontPair: 'fredoka+nunito',
    check: {
      at: '2026-10-17T11:00:00.000Z',
      result: 'WARN',
      fail: 0,
      warn: 2,
      forced: true,
    },
    gitSha: 'abc1234',
    seededAt: '2026-10-17T12:00:00.000Z',
  };

  it('arma un objeto estable y deja fuera counted', () => {
    const record = buildKitMeta(meta, extras);
    assert.deepEqual(Object.keys(record), [
      'vertical',
      'family',
      'archetype',
      'direction',
      'palette',
      'fontPair',
      'sections',
      'check',
      'gitSha',
      'seededAt',
    ]);
    assert.deepEqual(record.sections, [
      { slot: 'hero', variant: 'overlap', role: 'hero' },
      { slot: 'faq', variant: 'grid', role: 'faq' },
    ]);
    assert.deepEqual(record.check, extras.check);
    assert.equal(record.gitSha, 'abc1234');
    assert.equal(record.seededAt, extras.seededAt);
  });

  it('omite dirección, paleta, par y check cuando no existen', () => {
    const record = buildKitMeta(meta, {
      gitSha: null,
      seededAt: extras.seededAt,
    });
    assert.deepEqual(Object.keys(record), [
      'vertical',
      'family',
      'archetype',
      'sections',
      'gitSha',
      'seededAt',
    ]);
    assert.equal(record.gitSha, null);
    assert.equal('check' in record, false);
    assert.equal('palette' in record, false);
  });

  it('omite check forzado en false y una paleta custom', () => {
    const record = buildKitMeta(
      { slots: [] },
      {
        palette: 'custom',
        direction: '  ',
        check: { at: 't', result: 'PASS', fail: 0, warn: 0, forced: false },
        gitSha: null,
        seededAt: 't2',
      },
    );
    assert.equal('palette' in record, false);
    assert.equal('direction' in record, false);
    assert.deepEqual(record.check, {
      at: 't',
      result: 'PASS',
      fail: 0,
      warn: 0,
    });
    assert.deepEqual(record.sections, []);
  });

  it('sin meta deja solo secciones, gitSha y seededAt', () => {
    const record = buildKitMeta(null, {
      gitSha: null,
      seededAt: 't',
    });
    assert.deepEqual(record, {
      sections: [],
      gitSha: null,
      seededAt: 't',
    });
  });
});

describe('pickKitIdentity', () => {
  const lockTier = {
    palette: 'pal-menta-tinta',
    fontPair: 'fredoka+nunito',
    layout: { direction: 'jardin-suave', archetype: 'booking' },
  };

  it('prefiere el lock sobre el spec y el tema', () => {
    assert.deepEqual(
      pickKitIdentity({
        lockTier,
        spec: {
          layout: { direction: 'otra' },
          brand: { palette: { preset: 'otra-paleta' }, fontPair: 'otro+par' },
        },
        themeFontPair: 'tema+par',
      }),
      {
        direction: 'jardin-suave',
        palette: 'pal-menta-tinta',
        fontPair: 'fredoka+nunito',
      },
    );
  });

  it('si el lock dice custom, toma el preset del spec y el par del tema', () => {
    assert.deepEqual(
      pickKitIdentity({
        lockTier: { palette: 'custom', layout: {} },
        spec: { brand: { palette: { preset: 'pal-salvia-tinta' } } },
        themeFontPair: 'red-hat-display+red-hat-text',
      }),
      {
        palette: 'pal-salvia-tinta',
        fontPair: 'red-hat-display+red-hat-text',
      },
    );
  });

  it('no inventa paleta ni par cuando solo hay un objeto custom', () => {
    assert.deepEqual(
      pickKitIdentity({
        lockTier: { palette: 'custom' },
        spec: {
          layout: { direction: 'jardin-suave' },
          brand: {
            palette: { custom: { bg: '#fff', accent: '#000' } },
            fontPair: { display: 'Fraunces', body: 'Outfit' },
          },
        },
      }),
      { direction: 'jardin-suave' },
    );
  });

  it('sin fuentes devuelve un objeto vacío', () => {
    assert.deepEqual(pickKitIdentity({}), {});
    assert.deepEqual(
      pickKitIdentity({ lockTier: { palette: '  ', fontPair: '' } }),
      {},
    );
  });
});
