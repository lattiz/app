import type { Region } from '../types';

export interface SlotSlice {
  slot: string;
  variant: string | null;
  region: Region;
  element: Element;
  /** Every class used inside the slot, root included. */
  classes: Set<string>;
}

function regionOf(el: Element): Region {
  if (el.closest('main')) return 'main';
  if (el.tagName === 'FOOTER' || el.closest('footer')) return 'footer';
  if (el.tagName === 'HEADER' || el.closest('header')) return 'header';
  return 'main';
}

function classesOf(root: Element): Set<string> {
  const set = new Set<string>();
  for (const el of [root, ...Array.from(root.querySelectorAll('[class]'))]) {
    for (const c of Array.from(el.classList)) set.add(c);
  }
  return set;
}

/** Top-level `[data-lz-slot]` elements in document order (nested slots stay inside their parent). */
export function sliceSlots(doc: Document | Element): SlotSlice[] {
  const all = Array.from(doc.querySelectorAll('[data-lz-slot]'));
  return all
    .filter((el) => !el.parentElement?.closest('[data-lz-slot]'))
    .map((element) => ({
      slot: element.getAttribute('data-lz-slot') ?? '',
      variant: element.getAttribute('data-lz-variant'),
      region: regionOf(element),
      element,
      classes: classesOf(element),
    }));
}
