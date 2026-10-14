import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  PRIMITIVE_FAMILIES,
  PRIMITIVES,
  themeStyles,
  type PrimitiveChoices,
  type PrimitiveFamily,
} from '../../primitives';
import { KIT_ROOT } from './paths';

export const PRIMITIVES_DIR = resolve(KIT_ROOT, 'primitives');

/**
 * Adds the theme's style modifier to every bare element of a family inside a rendered section (an
 * element that already names a theme style or a role, like `lz-btn--secondary`, keeps its own).
 */
export function applyPrimitiveStyles(
  root: Element,
  choices: PrimitiveChoices = {},
): void {
  for (const id of PRIMITIVE_FAMILIES) {
    const family: PrimitiveFamily = PRIMITIVES[id];
    const style = choices[id] ?? family.defaultStyle;
    if (!style) continue;
    const taken = [...themeStyles(id), ...(family.roles ?? [])].map(
      (s) => `${family.block}--${s}`,
    );
    const elements = [
      ...(root.classList.contains(family.block) ? [root] : []),
      ...root.querySelectorAll(`.${family.block}`),
    ];
    for (const el of elements)
      if (!taken.some((c) => el.classList.contains(c)))
        el.classList.add(`${family.block}--${style}`);
  }
}

export interface UsedPrimitives {
  /** Kit-relative CSS files, in emission order. */
  files: string[];
  css: string;
  /** family → styles present in the markup. */
  used: Record<string, string[]>;
}

/** CSS for the families and styles the markup uses, and nothing else (empty for legacy templates). */
export function primitiveCss(html: string[]): UsedPrimitives {
  const classes = new Set<string>();
  for (const part of html)
    for (const m of part.matchAll(/\sclass="([^"]*)"/g))
      for (const c of m[1].split(/\s+/)) if (c) classes.add(c);
  const files: string[] = [];
  const used: Record<string, string[]> = {};
  for (const id of PRIMITIVE_FAMILIES) {
    const family: PrimitiveFamily = PRIMITIVES[id];
    if (!classes.has(family.block)) continue;
    const styles = Object.keys(family.styles).filter((s) =>
      classes.has(`${family.block}--${s}`),
    );
    used[id] = styles;
    files.push(`primitives/${id}/base.css`);
    for (const s of styles) files.push(`primitives/${id}/${s}.css`);
  }
  return {
    files,
    css: files
      .map((f) => readFileSync(resolve(KIT_ROOT, f), 'utf8').trimEnd())
      .join('\n'),
    used,
  };
}
