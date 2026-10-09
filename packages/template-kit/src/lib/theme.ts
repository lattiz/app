import { COLOR_TOKENS, type ColorToken, type Theme } from '../types';
import { parseColor, type Rgba, type VarResolver } from './color';

/** Every custom property a theme defines; this is the only place token values enter the CSS. */
export function themeVariables(theme: Theme): [string, string][] {
  return [
    ...COLOR_TOKENS.map((t): [string, string] => [
      `--lz-color-${t}`,
      theme.colors[t],
    ]),
    ['--lz-font-display', theme.fonts.display],
    ['--lz-font-serif', theme.fonts.serif],
    ['--lz-font-body', theme.fonts.body],
    ['--lz-radius-pill', theme.radius.pill],
    ['--lz-radius-card', theme.radius.card],
    ['--lz-section-pad', theme.sectionPad],
    ['--lz-container', theme.container],
    ['--lz-map-filter', theme.effects.mapFilter],
    ['--lz-hero-image-filter', theme.effects.heroImageFilter],
  ];
}

export function themeRootCss(theme: Theme): string {
  return `:root {\n${themeVariables(theme)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')}\n}\n`;
}

export function googleFontsHref(theme: Theme): string {
  return `https://fonts.googleapis.com/css2?${theme.fonts.googleFonts}&display=swap`;
}

export function themeResolver(theme: Theme): VarResolver {
  const vars = new Map(themeVariables(theme));
  return (name) => vars.get(name);
}

export function tokenColor(theme: Theme, token: ColorToken): Rgba | null {
  return parseColor(theme.colors[token], themeResolver(theme));
}

/** Primary family names, e.g. `'Anton', sans-serif` → `Anton`. */
export function fontFamilyName(stack: string): string {
  return stack
    .split(',')[0]
    .trim()
    .replace(/^['"]|['"]$/g, '');
}
