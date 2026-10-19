import { mkdtempSync, copyFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { harvestFolder } from '../src/design/harvest';
import { parseYamlLite } from '../src/design/harvest/yaml-lite';
import {
  tokensFromDesignMd,
  tokensFromHtml,
} from '../src/design/harvest/tokens';
import { validateHarvest, type Candidate } from '../src/design/types';
import { readFileSync } from 'node:fs';

const FIX = resolve(import.meta.dirname, 'fixtures/executive-vision-dental');
const html = readFileSync(join(FIX, 'screen.html'), 'utf8');
const md = readFileSync(join(FIX, 'design.md'), 'utf8');

const candidate: Candidate = {
  id: 'dental-executive-vision-01',
  giro: 'dental',
  source: 'stitch',
  status: 'collected',
  tags: [],
  license_ref: 'x',
  created_at: new Date().toISOString(),
  stitch: {},
};

function folder(files: Record<string, string>) {
  const dir = mkdtempSync(join(tmpdir(), 'harvest-'));
  mkdirSync(dir, { recursive: true });
  for (const [name, src] of Object.entries(files))
    copyFileSync(join(FIX, src), join(dir, name));
  return dir;
}

describe('token extraction', () => {
  it('parses the DESIGN.md front matter', () => {
    const t = tokensFromDesignMd(md)!;
    expect(t.colors.background).toBe('#08132a');
    expect(t.typography.find((s) => s.token === 'display-lg')).toMatchObject({
      family: 'Playfair Display',
      sizePx: 84,
      weight: 700,
      letterSpacingEm: -0.02,
    });
    expect(t.radiiPx.DEFAULT).toBe(8);
  });
  it('reads the Tailwind config without evaluating it', () => {
    const t = tokensFromHtml(html)!;
    expect(t.colors.surface).toBe('#fcf8f9');
    expect(t.linkedFamilies).toEqual(['Inter', 'Playfair Display']);
    expect(t.typography.length).toBeGreaterThan(5);
  });
  it('ignores malformed front matter', () => {
    expect(tokensFromDesignMd('# no front matter')).toBeNull();
    expect(parseYamlLite("a:\n  b: 'x'\n  : y\nc: 1")).toEqual({
      a: { b: 'x' },
      c: '1',
    });
  });
});

describe('harvest of the Executive Vision – Dental fixture', () => {
  const h = harvestFolder(
    candidate,
    folder({ 'design.md': 'design.md', 'source.html': 'screen.html' }),
  );

  it('produces a valid harvest.json', () => {
    expect(() => validateHarvest(JSON.parse(JSON.stringify(h)))).not.toThrow();
    expect(h.input.kind).toBe('design-md');
  });
  it('extracts at least one AA-compliant palette (dark, from the design system)', () => {
    expect(h.palette).not.toBeNull();
    expect(h.palette!.aa).toEqual({ ok: true, problems: [] });
    expect(h.palette!.mode).toBe('dark');
    expect(h.palette!.from.bg).toBe('background');
  });
  it('extracts a typographic scale and Google families only', () => {
    expect(h.typography.displayFamily).toBe('Playfair Display');
    expect(h.typography.bodyFamily).toBe('Inter');
    expect(h.typography.scale[0].sizePx).toBe(84);
    expect(h.typography.unsupportedFamilies).toEqual([]);
  });
  it('maps the section patterns and flags what the kit cannot build', () => {
    const slots = h.sections.map((s) => `${s.slot}/${s.layout}`);
    expect(slots).toContain('hero/split');
    expect(slots).toContain('services/bento');
    expect(slots).toContain('about/quote');
    expect(slots).toContain('footer/link-columns');
    const cta = h.sections.find((s) => s.slot === 'cta')!;
    expect(cta.notes?.join(' ')).toMatch(/formularios/);
  });
  it('drops every image: no URL survives in the harvest', () => {
    expect(h.images_ignored).toBeGreaterThanOrEqual(2);
    expect(JSON.stringify(h)).not.toMatch(
      /googleusercontent|aida-public|https?:/,
    );
  });
});

describe('harvest from HTML only (Stitch MCP down, light tokens)', () => {
  it('still yields a palette from the Tailwind config', () => {
    const h = harvestFolder(
      candidate,
      folder({ 'source.html': 'screen.html' }),
    );
    expect(h.input.kind).toBe('html');
    expect(h.palette?.mode).toBe('light');
    expect(h.palette?.aa.ok).toBe(true);
  });
  it('refuses an empty candidate', () => {
    expect(() => harvestFolder(candidate, folder({}))).toThrow(
      /design\.md ni source\.html/,
    );
  });
});

describe('harvest audit trail (Part 5)', () => {
  const dir = folder({
    'design.md': 'design.md',
    'source.html': 'screen.html',
  });
  const h = harvestFolder(candidate, dir);

  it('groups colors into roles and maps them to --lz-* tokens, not Material names', () => {
    const p = h.palette!;
    expect(p.roles.text).toContain('on-surface');
    expect(p.roles.accent).toContain('primary');
    expect(p.roles.border).toContain('outline');
    expect(Object.keys(p.lz)).toContain('--lz-color-accent-text');
    expect(p.lz['--lz-color-bg'].toLowerCase()).toBe('#08132a');
    expect(JSON.stringify(p.lz)).not.toMatch(/surface-container|on-primary/);
  });

  it('computes contrast per text/background pair with aa_pass', () => {
    const pair = h.palette!.pairs.find(
      (x) => x.fg === 'on-surface' && x.bg === 'surface',
    )!;
    expect(pair.ratio).toBeGreaterThan(10);
    expect(pair.aa_pass).toBe(true);
    expect(h.palette!.pairs.every((x) => typeof x.aa_pass === 'boolean')).toBe(
      true,
    );
  });

  it('reports the distance to the closest palette of the giro (A2 method)', () => {
    const d = h.palette!.distance.find((x) => x.giro === 'dental')!;
    expect(d.min).toBe(15);
    expect(d.ok).toBe(d.distance >= 15);
    expect(d.nearest).toMatch(/^(dental:|pal-)/);
  });

  it('says "already exists" for what the kit has and drafts only what is new', () => {
    const by = Object.fromEntries(
      h.sections.map((s) => [`${s.slot}/${s.layout}`, s]),
    );
    expect(by['hero/split'].existing).toBe('hero/split');
    expect(by['footer/link-columns'].existing).toBe('footer/columns');
    expect(by['hero/split'].draft).toBeUndefined();
    for (const key of ['about/quote', 'services/bento', 'cta/centered']) {
      const d = by[key].draft!;
      expect(d.html).toContain(`data-lz-variant="${d.variant}"`);
      expect(d.html).not.toMatch(/<script|<form|style=|https?:/);
      expect(d.css).not.toMatch(/#[0-9a-f]{3,8}\b|@import|https?:/i);
      expect(d.meta_ts).toContain('satisfies SectionMeta');
      expect(d.bytes.css_gzip).toBeGreaterThan(100);
    }
  });

  it('turns JS behaviors into Motion recommendations without keeping code', () => {
    const kinds = h.interactivity.map((i) => i.kind).sort();
    expect(kinds).toEqual(['parallax', 'reveal-on-scroll', 'sticky-header']);
    expect(JSON.stringify(h.interactivity)).not.toMatch(
      /addEventListener|function|=>/,
    );
    expect(
      h.interactivity.find((i) => i.kind === 'reveal-on-scroll')!
        .recommendation,
    ).toMatch(/Pro/);
  });

  it('records what each photo has to be, never where it came from', () => {
    const hero = h.image_needs.find((n) => n.slot === 'hero')!;
    expect(hero).toMatchObject({ orientation: 'portrait', use: 'foreground' });
    expect(h.image_needs.some((n) => n.use === 'background')).toBe(true);
  });

  it('excludes icon fonts and checks the delivery of the type pair', () => {
    const t = h.typography;
    expect(t.delivery).toEqual({ ok: true, problems: [] });
    expect(t.existingPair).toBe('playfair-display+inter');
    expect(t.metrics).toEqual({ 'Playfair Display': true, Inter: true });
    const fromHtml = harvestFolder(
      candidate,
      folder({ 'source.html': 'screen.html' }),
    );
    expect(fromHtml.typography.googleFamilies).not.toContain(
      'Material Symbols Outlined',
    );
  });

  it('is deterministic: harvesting twice gives byte-identical harvest.json', () => {
    expect(JSON.stringify(harvestFolder(candidate, dir))).toBe(
      JSON.stringify(h),
    );
  });
});
