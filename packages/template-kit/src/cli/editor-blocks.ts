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
    id: 'lzb-hero-photo-ribbon',
    label: 'Portada con foto e insignia',
    category: 'Portadas',
    icon: 'hero',
    slot: 'hero',
    variant: 'photo-ribbon',
    data: {
      eyebrow: 'Tradición y oficio · {{city}}',
      title: 'Lo que tu negocio hace mejor, en una frase',
      text: 'Cuenta en dos líneas qué ofreces, para quién y por qué elegirte.',
      ...CTA,
      note: 'Sin anticipos · Respuesta en minutos',
      imageAlt: 'Foto principal del negocio',
    },
  },
  {
    id: 'lzb-faq-numbered-cards',
    label: 'Preguntas en tarjetas numeradas',
    category: 'Secciones',
    icon: 'grid',
    slot: 'faq',
    variant: 'numbered-cards',
    data: {
      kicker: 'Sin dudas ni rodeos',
      title: 'Preguntas frecuentes',
      intro: 'Respuestas claras para que llegues con total certeza.',
      items: [
        {
          question: '¿Necesito reservar?',
          answer: 'Sí: escríbenos por WhatsApp y te confirmamos el horario.',
        },
        {
          question: '¿Cuánto cuesta?',
          answer:
            'Los precios están en la carta; cada servicio indica su duración.',
        },
        {
          question: '¿Qué formas de pago aceptan?',
          answer: 'Efectivo, tarjeta y transferencia.',
        },
        {
          question: '¿Puedo cambiar mi cita?',
          answer: 'Avísanos con unas horas de anticipación y la movemos.',
        },
      ],
    },
  },
  {
    id: 'lzb-services-ritual-cards',
    label: 'Servicios en tarjetas de tarifa',
    category: 'Secciones',
    icon: 'grid',
    slot: 'services',
    variant: 'ritual-cards',
    data: {
      kicker: 'Carta de servicios',
      title: 'Rituales y tarifa clara',
      intro:
        'Precios netos, sin añadidos forzados. El servicio dura lo que tenga que durar.',
      note: 'Cada servicio incluye café o agua fría de cortesía.',
      noteCta: 'Consultar horarios disponibles →',
      prices: [
        {
          name: 'Corte ejecutivo',
          price: '$350',
          description:
            'Lavado, corte a tijera y máquina, peinado con pomada mate.',
          duration: '45 minutos',
        },
        {
          name: 'Afeitado a navaja',
          price: '$320',
          description:
            'Toallas calientes, espuma densa, navaja libre y bálsamo.',
          duration: '40 minutos',
        },
        {
          name: 'Ritual completo',
          price: '$580',
          description: 'Corte, afeitado y tónico mentolado en una sola sesión.',
          duration: '75 minutos',
          badge: 'Ritual estrella',
        },
      ],
    },
  },
  {
    id: 'lzb-testimonials-paper-trio',
    label: 'Reseñas en tarjetas de papel',
    category: 'Secciones',
    icon: 'quote',
    slot: 'testimonials',
    variant: 'paper-trio',
    data: {
      kicker: 'Clientela habitual',
      title: 'Palabra de barrio',
      intro: 'Testimonios directos de quienes no cambian de barbero por nada.',
      cta: 'Reservar mi cita',
      reviews: [
        {
          text: 'Llevo años viniendo cada quincena. No falla un solo trazo y salgo listo para lo que venga.',
          author: 'Rogelio Morales',
          place: 'Santa María la Ribera',
        },
        {
          text: 'La toalla caliente y el filo son de otro calibre. Te dejan como hombre de palabra.',
          author: 'Carlos Valenzuela',
          place: 'Colonia Roma',
        },
        {
          text: 'Puntuales, pulcros y con música tranquila. Se viene a relajarse y a salir bien arreglado.',
          author: 'David Menéndez',
          place: 'San Rafael',
        },
      ],
    },
  },
  {
    id: 'lzb-about-framed-craft',
    label: 'Oficio con foto enmarcada',
    category: 'Secciones',
    icon: 'frame',
    slot: 'about',
    variant: 'framed-craft',
    data: {
      kicker: 'El oficio',
      title: 'Hecho a mano, paso a paso.',
      summary:
        'Respetamos el tiempo del cliente y el filo de la hoja: cada servicio sigue el mismo orden y usa lo mejor de cada herramienta.',
      body: 'Sin prisas ni atajos. Aquí se revisa, se prepara y se termina con calma, para que salgas como llegaste a pedir.',
      image: 'about.jpg',
      imageAlt: 'Herramientas de trabajo sobre una mesa de madera',
      plateLabel: 'Herramientas de oficio',
      plateTitle: 'Acero templado',
      plateAside: 'Desde 2014',
      features: [
        {
          title: 'Espuma batida a mano',
          text: 'Con brocha de cerda natural en tazón tibio.',
        },
        {
          title: 'Navaja nueva en cada servicio',
          text: 'Hojas abiertas directamente en tu presencia.',
        },
        {
          title: 'Loción artesanal',
          text: 'Fórmula clásica que cierra el poro y calma la piel.',
        },
      ],
    },
  },
  {
    id: 'lzb-about-booking-steps',
    label: 'Cómo agendar en tres pasos',
    category: 'Secciones',
    icon: 'grid',
    slot: 'about',
    variant: 'booking-steps',
    data: {
      kicker: 'Sencillo y directo',
      title: 'Agenda tu visita en tres pasos',
      summary: 'Nos escribes, elegimos horario y llegas con calma.',
      primaryCta: 'Agendar por WhatsApp',
      steps: [
        {
          title: 'Escríbenos por WhatsApp',
          text: 'Cuéntanos qué necesitas; te respondemos en horario de atención.',
        },
        {
          title: 'Elegimos día y hora',
          text: 'Te proponemos un espacio y te mandamos el recordatorio un día antes.',
        },
        {
          title: 'Ven con calma',
          text: 'Llega con lo que pidas el mensaje; hay lugar para dejar el auto.',
        },
      ],
    },
  },
  {
    id: 'lzb-locations-booking-panel',
    label: 'Contacto y ubicación en tarjeta',
    category: 'Secciones',
    icon: 'card',
    slot: 'locations',
    variant: 'booking-panel',
    data: {
      kicker: 'Sin intermediarios',
      title: 'Llega o aparta tu lugar',
      contactText:
        'Sin formularios lentos que nadie contesta. Escríbenos o llámanos para tener tu turno confirmado.',
      whatsappLabel: 'WhatsApp directo',
      whatsappValue: 'Reservar cita',
      whatsappNote: 'Atención rápida para apartar tu turno',
      whatsappCta: 'Escribir por WhatsApp ahora',
      callLabel: 'Teléfono',
      callNote: 'Llamada directa al mostrador',
      emailLabel: 'Correo',
      emailNote: 'Para eventos privados y grupos',
      directionsLabel: 'Abrir en Google Maps',
      branches: [
        {
          name: 'Ubicación y horarios',
          address: '{{address}}',
          hours: 'Lunes a sábado · 09:00 – 20:00',
          directionsUrl: 'https://maps.google.com/?q=ubicacion',
        },
      ],
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
  {
    id: 'lzb-cta-urgent-line',
    label: 'Urgencias: llama ahora',
    category: 'Secciones',
    icon: 'cta',
    slot: 'cta',
    variant: 'urgent-line',
    data: {
      badge: 'Urgencias',
      title: 'En una urgencia, llámanos antes de salir',
      text: 'Así preparamos el consultorio mientras vienes. Si estamos cerrados, te decimos a dónde acudir.',
      phoneLabel: 'Teléfono directo',
      primaryCta: 'Llamar ahora',
      secondaryCta: 'Escribir por WhatsApp',
      secondaryHref: '{{whatsappUrl}}',
      hours: [
        { label: 'Lun–Sáb', value: '9:00–20:00' },
        { label: 'Dom', value: '10:00–14:00' },
      ],
    },
  },
  {
    id: 'lzb-about-clock-rail',
    label: 'Horario del día en un riel',
    category: 'Secciones',
    icon: 'grid',
    slot: 'about',
    variant: 'clock-rail',
    data: {
      kicker: 'Tu día',
      title: 'Así corre la jornada',
      summary: 'Cada momento con su hora, para que sepas qué esperar.',
      statement: 'Tú llegas con calma; nosotros nos encargamos del resto.',
      primaryCta: 'Reservar por WhatsApp',
      moments: [
        {
          time: '11:00',
          title: 'Llegada',
          text: 'Recibimos a todos con el lugar listo.',
        },
        {
          time: '12:00',
          title: 'Actividad',
          text: 'Lo central del día, sin prisas.',
        },
        { time: '13:30', title: 'Comida', text: 'Mesa servida para todos.' },
        { time: '14:30', title: 'Despedida', text: 'Un recuerdo para llevar.' },
      ],
    },
  },
  {
    id: 'lzb-services-party-tiers',
    label: 'Paquetes con lista de lo incluido',
    category: 'Secciones',
    icon: 'grid',
    slot: 'services',
    variant: 'party-tiers',
    data: {
      kicker: 'Paquetes',
      title: 'Elige tu paquete',
      intro: 'Montos de referencia en MXN.',
      cta: 'Cotizar este paquete',
      prices: [
        {
          name: 'Básico',
          price: '$6,500',
          description: 'Lo esencial para empezar.',
          includes: ['Servicio principal', 'Atención por WhatsApp', 'Montaje'],
        },
        {
          name: 'Completo',
          price: '$9,800',
          description: 'El más elegido.',
          badge: 'Más pedido',
          includes: ['Todo lo del Básico', 'Extras incluidos', 'Coordinación'],
        },
        {
          name: 'Especial',
          price: '$13,500',
          description: 'Para ocasiones grandes.',
          includes: [
            'Todo lo del Completo',
            'Personalización',
            'Equipo dedicado',
          ],
        },
      ],
      extrasLabel: 'Extras',
      extras: [
        { name: 'Hora extra', price: '$1,200' },
        { name: 'Entrega a domicilio', price: '$350' },
      ],
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

/** Token fallback per variable: `:where(html)` has no specificity, so any token the project sets on `:root` wins. */
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
  return `:where(html){${vars.map(([k, v]) => `${k}:${v}`).join(';')}}`;
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
