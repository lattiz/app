import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DIRECTIONS } from '../../template-kit/directions';
import { GIROS } from '../../template-kit/giros';
import { paletteFromTokens } from '../src/design/harvest/palette';
import { tokensFromDesignMd } from '../src/design/harvest/tokens';
import {
  buildDesignMd,
  buildPrompt,
  resolveDirection,
  resolveSystem,
  unusedDirection,
} from '../src/design/system';

const cases = Object.keys(GIROS).flatMap((g) =>
  Object.keys(DIRECTIONS).map((d) => [g, d] as const),
);

describe('Stitch design system', () => {
  it.each(cases)('%s × %s round-trips through the harvester', (giro, dir) => {
    const r = resolveSystem(giro, dir);
    const t = tokensFromDesignMd(buildDesignMd(r));
    expect(t).not.toBeNull();
    for (const v of Object.values(t!.colors))
      expect(v).toMatch(/^#[0-9a-f]{6}$/i);
    expect(t!.typography.find((s) => s.token === 'display-lg')?.family).toBe(
      r.display,
    );
    expect(t!.linkedFamilies).toEqual([]);
    const draft = paletteFromTokens(t!, { title: r.giroLabel, giro });
    expect(draft?.bg.toLowerCase()).toBe(r.palette.colors.bg.toLowerCase());
  });

  it('carries the kit constraints and the direction voice in the prompt', () => {
    const r = resolveSystem('dental');
    const md = buildDesignMd(r);
    expect(md).toMatch(/No forms or input fields/);
    expect(md).toMatch(/Mexican Spanish/);
    expect(buildPrompt(r, 'Brief X')).toMatch(/Brief:\nBrief X/);
  });

  it('rejects unknown giros and directions', () => {
    expect(() => resolveSystem('panaderia')).toThrow(/Giro desconocido/);
    expect(() => resolveSystem('dental', 'nope')).toThrow(
      /Dirección desconocida/,
    );
  });

  it.each(Object.keys(DIRECTIONS))(
    'direction %s: a versionable file with the hard constraints, in both rigors',
    (dir) => {
      const r = resolveDirection(dir);
      for (const rigor of ['loose', 'tight'] as const) {
        const md = buildDesignMd(r, rigor);
        expect(tokensFromDesignMd(md)).not.toBeNull();
        expect(md).toMatch(/Rigor: (loose|tight)/);
        expect(md).toMatch(/Icons are inline SVG only/);
        expect(md).toMatch(/Single-column layout on mobile/);
        expect(md).toMatch(/identifiable real people/);
        expect(md).toMatch(/No gradients as the background of primary text/);
      }
      expect(buildDesignMd(r, 'loose')).toMatch(/closely related variants/);
      expect(buildDesignMd(r, 'tight')).toMatch(/Use exactly these colors/);
      expect(buildDesignMd(r)).toBe(buildDesignMd(r, 'loose'));
    },
  );

  it('picks the least-used direction for --direccion unused', () => {
    const info = () => ({
      status: 0,
      out: JSON.stringify({
        directions: [
          { id: 'a', used: 2 },
          { id: 'b', used: 0 },
          { id: 'c', used: 0 },
        ],
      }),
    });
    expect(unusedDirection('dental', info)).toBe('b');
    expect(() =>
      unusedDirection('dental', () => ({ status: 1, out: '' })),
    ).toThrow();
  });

  it.each(Object.keys(DIRECTIONS))(
    'design-library/stitch/_design-systems/%s.md is current (run: pnpm lattiz design system --all)',
    (dir) => {
      const file = resolve(
        import.meta.dirname,
        '../../../design-library/stitch/_design-systems',
        `${dir}.md`,
      );
      expect(readFileSync(file, 'utf8')).toBe(
        buildDesignMd(resolveDirection(dir), 'loose'),
      );
    },
  );

  it('reads the giro info through pnpm banner and stderr noise', () => {
    const noisy = () => ({
      status: 0,
      out: '$ tsx main.ts giro show dental --json\n{"directions":[{"id":"x","used":1},{"id":"y","used":0}]}\n(node:1) Warning: noise',
    });
    expect(unusedDirection('dental', noisy)).toBe('y');
  });
});
