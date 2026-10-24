import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSection } from '../src/lib/content';
import { businessFor, copySource, sectionData } from '../src/lib/gallery';
import { loadSectionMeta } from '../src/lib/load';
import { sectionDir } from '../src/lib/paths';
import type { ContentObject } from '../src/types';

/** The FAQ rebuilt from Stitch (barberia-abeto-indice-01): sticky header on the left, numbered open answers on the right. */
async function render(extra: ContentObject = {}) {
  const meta = await loadSectionMeta('faq', 'index-answers');
  const giro = copySource('faq', meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir('faq', 'index-answers'), 'section.html');
  return renderSection(
    readFileSync(file, 'utf8'),
    sectionData('faq', giro, business, 'demo', { ...meta.sample, ...extra }),
    { business, index: '04', source: file },
  );
}

function css(): string {
  return readFileSync(
    resolve(sectionDir('faq', 'index-answers'), 'section.css'),
    'utf8',
  );
}

const NO_JS = 'script, [style], iframe, form';
const TOKENS_ONLY = /#[0-9a-fA-F]{3,8}\b|rgba?\(|@import|url\(|backdrop-filter/;

describe('faq/index-answers', () => {
  it('keeps every panel an open <details> with a number, question and answer', async () => {
    const root = await render({
      items: [
        { question: '¿Cuánto dura?', answer: 'Entre 45 y 80 minutos.' },
        { question: '¿Con cita?', answer: 'Sí, por WhatsApp.' },
      ],
    });
    const items = root.querySelectorAll('details.lz-faq-index-answers__item');
    expect(items).toHaveLength(2);
    for (const item of items) {
      expect(item.hasAttribute('open')).toBe(true);
      expect(
        item.querySelector('summary .lz-faq-index-answers__question')
          ?.textContent,
      ).toMatch(/\S/);
      expect(
        item.querySelector('.lz-faq-index-answers__answer')?.textContent,
      ).toMatch(/\S/);
    }
  });

  it('drops the optional kicker, intro and CTA', async () => {
    const root = await render({ kicker: '', intro: '', cta: '' });
    expect(root.querySelector('.lz-faq-index-answers__kicker')).toBeNull();
    expect(root.querySelector('.lz-faq-index-answers__intro')).toBeNull();
    expect(root.querySelector('.lz-faq-index-answers__cta')).toBeNull();
  });

  it('keeps the no-JS and token-only contract', async () => {
    expect((await render()).querySelector(NO_JS)).toBeNull();
    expect(css()).not.toMatch(TOKENS_ONLY);
  });
});
