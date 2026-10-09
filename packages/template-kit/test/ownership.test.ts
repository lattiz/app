import { describe, expect, it } from 'vitest';
import { parseCss } from '../src/lib/css';
import {
  CORE,
  classUsage,
  selectorOwner,
  splitCss,
} from '../src/lib/ownership';

const slotClasses = new Map([
  [
    'navbar',
    new Set(['lz-navbar', 'lz-navbar__cta', 'lz-button', 'lz-container']),
  ],
  ['hero', new Set(['lz-hero', 'lz-button', 'lz-container'])],
  ['marquee', new Set(['lz-marquee', 'lz-marquee__track'])],
]);
const usage = classUsage(slotClasses);

describe('selectorOwner', () => {
  it('assigns a rule to the only slot using its classes', () => {
    expect(selectorOwner('.lz-hero', usage)).toBe('hero');
    expect(selectorOwner('.lz-navbar:hover', usage)).toBe('navbar');
  });

  it('keeps shared classes and element selectors in core', () => {
    expect(selectorOwner('.lz-button', usage)).toBe(CORE);
    expect(selectorOwner('body', usage)).toBe(CORE);
    expect(selectorOwner('.lz-unused', usage)).toBe(CORE);
  });

  it('gives a slot-specific override of a shared class to that slot', () => {
    expect(selectorOwner('.lz-navbar__cta .lz-button', usage)).toBe('navbar');
  });

  it('keeps rules spanning two slots in core', () => {
    expect(selectorOwner('.lz-hero, .lz-marquee', usage)).toBe(CORE);
  });
});

describe('splitCss', () => {
  const css = parseCss(`
    .lz-button{color:red}
    .lz-hero{animation:lz-fade 1s ease}
    .lz-marquee__track{animation:lz-marquee 22s linear infinite}
    .lz-navbar{animation:lz-fade 1s}
    @keyframes lz-marquee{0%{transform:none}100%{transform:translateX(-50%)}}
    @keyframes lz-fade{0%{opacity:0}100%{opacity:1}}
    @media (max-width: 992px){.lz-hero{padding:0}.lz-container{width:100%}}
    @media (prefers-reduced-motion: reduce){.lz-marquee__track{animation:none !important}}
  `);
  const split = splitCss(css, slotClasses);
  const text = (owner: string) =>
    (owner === CORE ? split.core : split.slots.get(owner))?.toString() ?? '';

  it('puts keyframes with the slot that uses them, shared ones in core', () => {
    expect(text('marquee')).toContain('@keyframes lz-marquee');
    expect(text(CORE)).toContain('@keyframes lz-fade');
    expect(text('hero')).not.toContain('@keyframes');
  });

  it('recreates media wrappers in each bucket', () => {
    expect(text('hero')).toMatch(
      /@media \(max-width: 992px\)\s*\{\s*\.lz-hero\{padding:0\}/,
    );
    expect(text(CORE)).toMatch(
      /@media \(max-width: 992px\)\s*\{\s*\.lz-container/,
    );
    expect(text('marquee')).toContain('prefers-reduced-motion');
  });

  it('keeps shared rules in core only', () => {
    expect(text(CORE)).toContain('.lz-button{color:red}');
    expect(text('hero')).not.toContain('.lz-button');
  });
});
