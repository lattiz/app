import { parseDocument } from '../../../../template-kit/src/lib/dom';
import type { Interactivity } from '../types';

/**
 * Behaviors the source gets from JS, read as text and never executed or copied. Each one maps to
 * what the kit does: Motion (Pro only) or nothing (Básico has no JS at all).
 */
export function interactivityOf(html: string): Interactivity[] {
  const doc = parseDocument(html).window.document;
  const scripts = [
    ...doc.querySelectorAll('script:not([src]):not([id="tailwind-config"])'),
  ]
    .map((s) => s.textContent ?? '')
    .join('\n');
  const out: Interactivity[] = [];
  if (/IntersectionObserver/.test(scripts)) {
    const sel = /querySelectorAll\(['"]([^'"]+)['"]\)/.exec(scripts)?.[1];
    out.push({
      kind: 'reveal-on-scroll',
      detail: `IntersectionObserver agrega una clase de entrada${sel ? ` a ${sel}` : ''}`,
      recommendation:
        'Motion (solo Pro): preset calm con data-lz-reveal; Básico sin animación (el contenido ya es visible sin JS)',
    });
  }
  if (
    /classList\.(add|toggle)\(['"][\w-]+['"]\)[\s\S]{0,80}scrollY|scrollY[\s\S]{0,120}classList/.test(
      scripts,
    )
  ) {
    out.push({
      kind: 'sticky-header',
      detail: 'el encabezado cambia de estilo al hacer scroll',
      recommendation: 'omitir: el navbar del kit es fijo y no necesita JS',
    });
  }
  if (
    /parallax|translateY\([^)]*scrollY|scrollY[^;]*translateY/i.test(scripts)
  ) {
    out.push({
      kind: 'parallax',
      detail: 'la imagen se desplaza o escala con el scroll',
      recommendation:
        'descartado; en Pro se degrada a un revelado suave (fade) con Motion',
    });
  }
  const known = out.length > 0;
  const remaining = scripts.replace(/\/\/.*$/gm, '').trim();
  if (remaining && !known)
    out.push({
      kind: 'other-js',
      detail: 'script propio sin patrón reconocido',
      recommendation: 'omitir: ningún JS de Stitch entra al kit',
    });
  return out;
}
