import { resolve } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { COLOR_TOKENS } from '../src/types';
import { compileFile, type CompiledTemplate } from '../src/lib/compile';
import { loadTheme } from '../src/lib/load';
import { paths } from '../src/lib/paths';
import {
  googleFontsHref,
  themeRootCss,
  themeVariables,
} from '../src/lib/theme';

type Rule = {
  selectors?: unknown;
  selectorsAdd?: string;
  style?: Record<string, unknown>;
};

function rootRule(c: CompiledTemplate): Rule | undefined {
  return (c.project.styles as Rule[]).find((r) => r.selectorsAdd === ':root');
}

describe('theme → tokens', () => {
  it('emits every required token as a --lz-* custom property', () => {
    const css = themeRootCss(loadTheme('oxido'));
    for (const t of COLOR_TOKENS) expect(css).toContain(`--lz-color-${t}:`);
    for (const t of [
      '--lz-radius-pill',
      '--lz-radius-card',
      '--lz-section-pad',
      '--lz-container',
      '--lz-font-display',
      '--lz-font-serif',
      '--lz-font-body',
      '--lz-font-mono',
      '--lz-display-transform',
      '--lz-border-width',
      '--lz-shadow',
      '--lz-photo-filter',
      '--lz-stack',
    ]) {
      expect(css).toContain(`${t}:`);
    }
  });

  it('builds the Google Fonts link from the theme query', () => {
    expect(googleFontsHref(loadTheme('trazo-noche'))).toBe(
      'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;700&display=swap',
    );
  });

  it('derives shape, density and photo treatment tokens', () => {
    const vars = new Map(themeVariables(loadTheme('concreto-brutal')));
    expect(vars.get('--lz-border-width')).toBe('3px');
    expect(vars.get('--lz-shadow')).toBe('6px 6px 0 var(--lz-color-ink)');
    expect(vars.get('--lz-accent-word-bg')).toBe('var(--lz-color-accent)');
    expect(vars.get('--lz-photo-filter')).toMatch(
      /^grayscale\(1\) .* hue-rotate\(36deg\)/,
    );
    const oxido = new Map(themeVariables(loadTheme('oxido')));
    expect(oxido.get('--lz-shadow')).toBe('none');
    expect(oxido.get('--lz-section-pad')).toBe('clamp(72px, 10vw, 140px)');
    expect(oxido.get('--lz-photo-filter')).toBe('grayscale(1)');
    expect(oxido.get('--lz-font-mono')).toBe("'Space Grotesk', sans-serif");
  });
});

describe('compiled project tokens', () => {
  let oxido: CompiledTemplate;
  let norte: CompiledTemplate;
  beforeAll(async () => {
    oxido = await compileFile(resolve(paths.templates, 'barberia-oxido-v1.ts'));
    norte = await compileFile(resolve(paths.templates, 'barberia-norte-v1.ts'));
  });

  it('generates :root from the theme, not from copied values', () => {
    for (const c of [oxido, norte]) {
      const style = rootRule(c)?.style ?? {};
      for (const [prop, value] of themeVariables(c.theme)) {
        // jsdom-free parser: values reach GrapesJS verbatim.
        expect(style[prop], `${c.manifest.id} ${prop}`).toBe(value);
      }
    }
    expect(rootRule(norte)?.style?.['--lz-color-bg']).toBe('#EFE9DD');
    expect(rootRule(oxido)?.style?.['--lz-color-bg']).toBe('#0B0B0C');
  });

  it('emits no Studio global-style structures (no second token system)', () => {
    for (const c of [oxido, norte]) {
      const json = JSON.stringify(c.project);
      expect(json).not.toMatch(/gjs-t-/);
      expect(json).not.toContain('"data-variable"');
      expect(c.project.dataSources).toEqual([]);
      for (const rule of c.project.styles as Rule[]) {
        for (const value of Object.values(rule.style ?? {}))
          expect(typeof value).toBe('string');
      }
    }
  });

  it('keeps the head (fonts, preconnects, title, meta) and the web project shape', () => {
    const page = (
      norte.project.pages as {
        frames: {
          component: {
            head: {
              components: {
                tagName: string;
                attributes?: Record<string, string>;
              }[];
            };
            docEl: unknown;
          };
        }[];
      }[]
    )[0];
    const head = page.frames[0].component.head.components;
    expect(head.map((h) => h.tagName)).toEqual([
      'meta',
      'meta',
      'title',
      'meta',
      'link',
      'link',
      'link',
    ]);
    expect(head[6].attributes?.href).toBe(googleFontsHref(norte.theme));
    expect(page.frames[0].component.docEl).toEqual({
      tagName: 'html',
      attributes: { lang: 'es-MX' },
    });
    expect(norte.project.custom).toEqual({
      projectType: 'web',
      id: 'barberia-norte-v1',
    });
  });

  it('builds every wa.me link from the business variables', () => {
    const links = [...norte.html.matchAll(/https:\/\/wa\.me\/[^"]+/g)].map(
      (m) => m[0],
    );
    expect(links.length).toBeGreaterThanOrEqual(7);
    expect(
      links.every((l) => l.startsWith('https://wa.me/5215500000000?text=')),
    ).toBe(true);
    expect(links).toContain(
      'https://wa.me/5215500000000?text=Hola%2C%20quiero%20informaci%C3%B3n%20de%20la%20membres%C3%ADa',
    );
  });
});
