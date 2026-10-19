import { describe, expect, it } from 'vitest';
import { DIRECTIONS } from '../../template-kit/directions';
import { GIROS } from '../../template-kit/giros';
import { paletteFromTokens } from '../src/design/harvest/palette';
import { tokensFromDesignMd } from '../src/design/harvest/tokens';
import {
  buildDesignMd,
  buildPrompt,
  resolveSystem,
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
});
