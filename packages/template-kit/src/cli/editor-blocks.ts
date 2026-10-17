/**
 * Editor blocks rendered from the kit itself (new heroes, cta and primitives), so a block inserted in
 * the editor carries the kit's markup and classes and exactly the CSS that markup uses. Written by
 * `kit:manifest` to apps/web/src/features/editor/blocks/kit-blocks.generated.ts and checked by `--check`.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postcss, { type Rule } from 'postcss';
import * as prettier from 'prettier';
import { GIROS } from '../../giros';
import { renderSection } from '../lib/content';
import { parseFragment } from '../lib/dom';
import { businessFor, copySource, sectionData } from '../lib/gallery';
import { loadSectionMeta } from '../lib/load';
import { paths, REPO_ROOT, sectionDir } from '../lib/paths';
import { applyPrimitiveStyles, primitiveCss } from '../lib/primitives';
import { themeVariables } from '../lib/theme';
import { FONT_PAIRS, SHAPES } from '../spec/presets';
import { composeTheme } from '../spec/theme';
import type { ContentObject } from '../types';

export const WEB_KIT_BLOCKS_FILE = resolve(
  REPO_ROOT,
  'apps/web/src/features/editor/blocks/kit-blocks.generated.ts',
);

/** `lzb-placeholder:<w>x<h>`: the editor swaps it for its neutral SVG placeholder (blocks/shared.ts). */
const PLACEHOLDER = 'lzb-placeholder';

const CTA = {
  primaryCta: 'Escríbenos por WhatsApp',
  secondaryCta: 'Ver servicios',
  secondaryHref: '#servicios',
};

interface SectionSpec {
  id: string;
  label: string;
  category: string;
  icon: string;
  slot: string;
  variant: string;
  /** Neutral es-MX copy: blocks serve every giro, unlike the gallery's sample copy. */
  data: ContentObject;
}

const SECTIONS: SectionSpec[] = [
  {
    id: 'lzb-hero-bento',
    label: 'Portada con cifras',
    category: 'Portadas',
    icon: 'bento',
    slot: 'hero',
    variant: 'bento',
    data: {
      eyebrow: '{{city}}',
      title: 'Lo que tu negocio hace mejor, en una frase',
      text: 'Cuenta en dos líneas qué ofreces, para quién y por qué elegirte.',
      ...CTA,
      imageAlt: 'Foto principal del negocio',
      facts: [
        { value: '10 años', label: 'Atendiendo en la colonia' },
        { value: '4.9', label: 'Calificación de ejemplo' },
        { value: '6 días', label: 'Abierto a la semana' },
      ],
    },
  },
  {
    id: 'lzb-hero-rail',
    label: 'Portada con ficha',
    category: 'Portadas',
    icon: 'rail',
    slot: 'hero',
    variant: 'rail',
    data: {
      eyebrow: '{{city}}',
      title: 'Lo que tu negocio hace mejor, en una frase',
      text: 'Cuenta en dos líneas qué ofreces, para quién y por qué elegirte.',
      ...CTA,
      imageAlt: 'Foto principal del negocio',
      details: [
        { label: 'Horario', value: 'Lun a sáb, 9:00 a 19:00' },
        { label: 'Dónde', value: '{{address}}' },
        { label: 'Citas', value: 'Por WhatsApp, el mismo día' },
      ],
    },
  },
  {
    id: 'lzb-hero-overlap',
    label: 'Portada con detalle',
    category: 'Portadas',
    icon: 'overlap',
    slot: 'hero',
    variant: 'overlap',
    data: {
      eyebrow: '{{city}}',
      title: 'Lo que tu negocio hace mejor, en una frase',
      text: 'Cuenta en dos líneas qué ofreces, para quién y por qué elegirte.',
      ...CTA,
      imageAlt: 'Foto principal del negocio',
      detailImage: 'detail',
      detailAlt: 'Detalle de cerca del trabajo',
    },
  },
  {
    id: 'lzb-hero-stack',
    label: 'Portada con tarjeta',
    category: 'Portadas',
    icon: 'card',
    slot: 'hero',
    variant: 'stack',
    data: {
      eyebrow: '{{city}}',
      title: 'Lo que tu negocio hace mejor, en una frase',
      text: 'Cuenta en dos líneas qué ofreces, para quién y por qué elegirte.',
      ...CTA,
      imageAlt: 'Foto principal del negocio',
    },
  },
  {
    id: 'lzb-cta-band',
    label: 'Llamado a la acción',
    category: 'Secciones',
    icon: 'cta',
    slot: 'cta',
    variant: 'band',
    data: {
      title: 'Agenda tu cita esta semana',
      text: 'Escríbenos y te decimos qué horarios quedan libres. Respondemos en minutos.',
      primaryCta: 'Escribir por WhatsApp',
      secondaryCta: 'Ver preguntas',
      secondaryHref: '#preguntas',
    },
  },
];

interface PieceSpec {
  id: string;
  label: string;
  icon: string;
  /** Primitive family (primitives/<family>/). */
  family: string;
  html: string;
}

/** Primitives as small pieces to drop inside any section; the default style of each family. */
const PIECES: PieceSpec[] = [
  {
    id: 'lzb-btn',
    family: 'button',
    label: 'Botón',
    icon: 'button',
    html: '<a class="lz-btn" href="{{whatsappUrl}}" target="_blank" rel="noopener noreferrer">Escríbenos por WhatsApp</a>',
  },
  {
    id: 'lzb-tile',
    family: 'card',
    label: 'Tarjeta',
    icon: 'tile',
    html: '<article class="lz-tile"><h3>Servicio destacado</h3><p>Describe en una línea qué incluye y cuánto tarda.</p><p><strong>Desde $350 MXN</strong></p></article>',
  },
  {
    id: 'lzb-tag',
    family: 'tag',
    label: 'Etiqueta',
    icon: 'tag',
    html: '<p class="lz-tag">Atendemos con cita</p>',
  },
  {
    id: 'lzb-frame',
    family: 'frame',
    label: 'Foto con marco',
    icon: 'frame',
    html: `<figure class="lz-frame"><img src="${PLACEHOLDER}:800x1000" width="800" height="1000" alt="Foto del negocio" loading="lazy"></figure>`,
  },
  {
    id: 'lzb-bignum',
    family: 'number',
    label: 'Cifra grande',
    icon: 'number',
    html: '<p class="lz-bignum"><span class="lz-bignum__value">10 años</span><span class="lz-bignum__label">Atendiendo en la colonia</span></p>',
  },
  {
    id: 'lzb-pullquote',
    family: 'quote',
    label: 'Cita destacada',
    icon: 'quote',
    html: '<figure class="lz-pullquote"><blockquote>Una frase de un cliente que cuente por qué regresa.</blockquote><figcaption class="lz-pullquote__cite">Nombre del cliente</figcaption></figure>',
  },
  {
    id: 'lzb-rule',
    family: 'divider',
    label: 'Separador',
    icon: 'rule',
    html: '<hr class="lz-rule">',
  },
];

export interface KitBlockData {
  id: string;
  label: string;
  category: string;
  icon: string;
  kitVariant?: string;
  kitPrimitive?: string;
  content: {
    tagName: string;
    classes: string[];
    attributes: Record<string, string>;
    components: string;
    styles: string;
  };
}

const classesIn = (html: string) =>
  new Set(
    [...html.matchAll(/\sclass="([^"]*)"/g)].flatMap((m) =>
      m[1].split(/\s+/).filter(Boolean),
    ),
  );

/** core.css reduced to the selectors whose every class the markup uses (element-only rules are dropped). */
export function usedCoreCss(core: string, used: Set<string>): string {
  const root = postcss.parse(core);
  root.walkComments((c) => {
    c.remove();
  });
  root.walkRules((rule: Rule) => {
    if (
      rule.parent?.type === 'atrule' &&
      /keyframes$/.test((rule.parent as { name: string }).name)
    )
      return;
    const keep = rule.selectors.filter((sel) => {
      const cls = [...sel.matchAll(/\.([A-Za-z0-9_-]+)/g)].map((m) => m[1]);
      return cls.length > 0 && cls.every((c) => used.has(c));
    });
    if (keep.length === 0) rule.remove();
    else rule.selectors = keep;
  });
  const kept = root.toString();
  root.walkAtRules(/keyframes$/, (at) => {
    if (!new RegExp(`\\b${at.params}\\b`).test(kept.replace(at.toString(), '')))
      at.remove();
  });
  let changed = true;
  while (changed) {
    changed = false;
    root.walkAtRules((at) => {
      if (at.nodes && at.nodes.length === 0) {
        at.remove();
        changed = true;
      }
    });
  }
  return root.toString();
}

/** Tokens for projects that have no `:root` rule yet (Studio's avoidUpdateStyle keeps an existing one). */
function fallbackRoot(): string {
  const theme = composeTheme({
    name: 'editor-fallback',
    label: 'Respaldo del editor',
    tier: 'basic',
    palette: GIROS.barberia.palettes['norte-atelier'],
    fontPair: {
      id: 'playfair-display+inter',
      fonts: FONT_PAIRS['playfair-display+inter'],
    },
    shape: SHAPES.sutil,
    brand: {},
  });
  // Fonts stay the project's own (without the token, font-family inherits); photos keep their color.
  const vars = themeVariables(theme)
    .filter(([k]) => !k.startsWith('--lz-font-'))
    .map(([k, v]): [string, string] => [k, /-filter$/.test(k) ? 'none' : v]);
  return `:root{${vars.map(([k, v]) => `${k}:${v}`).join(';')}}`;
}

const minify = (css: string) =>
  css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();

function styles(html: string, sectionCss: string, core: string): string {
  return minify(
    [
      fallbackRoot(),
      usedCoreCss(core, classesIn(html)),
      primitiveCss([html]).css,
      sectionCss,
    ].join('\n'),
  );
}

function toContent(root: Element, css: string): KitBlockData['content'] {
  const attributes: Record<string, string> = {};
  for (const a of Array.from(root.attributes))
    if (a.name !== 'class') attributes[a.name] = a.value;
  return {
    tagName: root.localName,
    classes: Array.from(root.classList),
    attributes,
    components: root.innerHTML,
    styles: css,
  };
}

async function sectionBlock(
  spec: SectionSpec,
  core: string,
): Promise<KitBlockData> {
  const meta = await loadSectionMeta(spec.slot, spec.variant);
  const giro = copySource(spec.slot, meta);
  const business = businessFor(giro, 'demo');
  const file = resolve(sectionDir(spec.slot, spec.variant), 'section.html');
  const data = {
    ...sectionData(spec.slot, giro, business, 'demo', meta.sample),
    ...spec.data,
  };
  const root = renderSection(readFileSync(file, 'utf8'), data, {
    business,
    index: '02',
    source: file,
    tokens: true,
  });
  applyPrimitiveStyles(root, {});
  // A page keeps one <h1> and one #hero: the inserted section is a second one.
  root.removeAttribute('id');
  for (const h1 of Array.from(root.querySelectorAll('h1'))) {
    const h2 = root.ownerDocument.createElement('h2');
    for (const a of Array.from(h1.attributes)) h2.setAttribute(a.name, a.value);
    h2.innerHTML = h1.innerHTML;
    h1.replaceWith(h2);
  }
  for (const img of Array.from(root.querySelectorAll('img'))) {
    img.removeAttribute('fetchpriority');
    img.setAttribute('loading', 'lazy');
    img.setAttribute(
      'src',
      `${PLACEHOLDER}:${img.getAttribute('width')}x${img.getAttribute('height')}`,
    );
  }
  const css = readFileSync(
    resolve(sectionDir(spec.slot, spec.variant), 'section.css'),
    'utf8',
  );
  return {
    id: spec.id,
    label: spec.label,
    category: spec.category,
    icon: spec.icon,
    kitVariant: `${spec.slot}/${spec.variant}`,
    content: toContent(root, styles(root.outerHTML, css, core)),
  };
}

function pieceBlock(spec: PieceSpec, core: string): KitBlockData {
  const fragment = parseFragment(
    spec.html.replace('{{whatsappUrl}}', '{{lz:whatsapp_url}}'),
  );
  const root = fragment.children[0];
  applyPrimitiveStyles(root, {});
  return {
    id: spec.id,
    label: spec.label,
    category: 'Piezas',
    icon: spec.icon,
    kitPrimitive: spec.family,
    content: toContent(root, styles(root.outerHTML, '', core)),
  };
}

export async function buildKitBlocks(): Promise<KitBlockData[]> {
  const core = readFileSync(paths.core, 'utf8');
  const sections = [];
  for (const spec of SECTIONS) sections.push(await sectionBlock(spec, core));
  return [...sections, ...PIECES.map((p) => pieceBlock(p, core))];
}

export async function renderKitBlocks(manifestHash: string): Promise<string> {
  const blocks = await buildKitBlocks();
  const config = await prettier.resolveConfig(WEB_KIT_BLOCKS_FILE);
  return prettier.format(
    `// GENERATED by \`pnpm --filter @lattiz/template-kit kit:manifest\` from packages/template-kit (src/cli/editor-blocks.ts). Do not edit.\n\n/** Kit sections and primitives as editor blocks: kit markup and classes, and only the CSS they use. */\nexport const KIT_BLOCKS_MANIFEST_HASH = '${manifestHash}';\n\nexport const KIT_BLOCKS = ${JSON.stringify(blocks, null, 2)};\n`,
    { ...(config ?? {}), parser: 'typescript' },
  );
}
