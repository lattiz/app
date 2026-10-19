import type { SectionPattern } from '../types';

/**
 * Scaffolds for the (slot, layout) pairs the kit can build from a Stitch pattern. Each one reads the
 * same copy keys as a legacy sibling, so a giro's existing copy fills it. Everything is token-driven
 * (no color literals, no Tailwind, no JS); Stitch's classes and images never reach the output.
 */

export interface Scaffold {
  html: string;
  css: string;
  contentKeys: string[];
  tiers: ('basic' | 'pro')[];
  archetypes: string[];
  label: string;
  numbered: boolean;
  description: string;
  intent: string;
  sample: Record<string, unknown>;
}

type Surface = SectionPattern['surface'];

const CARD: Record<Surface, string> = {
  flat: `background: var(--lz-color-surface);`,
  tinted: `background: var(--lz-color-surface-2);`,
  bordered: `background: var(--lz-color-surface);
  border: var(--lz-border-width, 1px) solid var(--lz-color-line);`,
  glass: `background: color-mix(in srgb, var(--lz-color-text) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--lz-color-text) 14%, transparent);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);`,
};

const SURFACE_ES: Record<Surface, string> = {
  flat: 'planas',
  tinted: 'teñidas',
  bordered: 'con filete',
  glass: 'de cristal (translúcidas con borde fino)',
};

const SAMPLE_PRICES = [
  {
    name: 'Valoración inicial',
    price: '$600',
    description: 'Revisión completa y plan por escrito, sin compromiso.',
  },
  {
    name: 'Limpieza profunda',
    price: '$950',
    description: 'Higiene con ultrasonido y pulido, en una sola visita.',
  },
  {
    name: 'Blanqueamiento',
    price: '$3,200',
    description: 'Dos sesiones con seguimiento de sensibilidad.',
  },
  {
    name: 'Ortodoncia',
    price: '$1,400',
    description: 'Mensualidad con revisión incluida.',
  },
];

function servicesGrid(
  variant: string,
  p: SectionPattern,
  bento: boolean,
): Scaffold {
  const b = `lz-services-${variant}`;
  const html = `<section id="servicios" data-lz-slot="services" data-lz-variant="${variant}" class="lz-section ${b}">
  <div class="lz-container">
    <p class="${b}__kicker" data-lz-key="kicker"></p>
    <h2 class="lz-title lz-title--section" data-lz-key="title"></h2>
    <div class="${b}__grid">
      <article class="${b}__card" data-lz-each="prices">
        <p class="${b}__price" data-lz-key="price"></p>
        <h3 class="${b}__name" data-lz-key="name"></h3>
        <p class="${b}__desc" data-lz-key="description"></p>
      </article>
    </div>
  </div>
</section>
`;
  const spans = bento
    ? `
/* Bento: the first card takes two thirds, the second the rest, then pairs. */
.${b}__card:nth-child(4n + 1) {
  grid-column: span 8;
}
.${b}__card:nth-child(4n + 2) {
  grid-column: span 4;
}
.${b}__card:nth-child(4n + 3),
.${b}__card:nth-child(4n + 4) {
  grid-column: span 6;
}
`
    : '';
  const css = `.${b} {
  padding: var(--lz-section-pad) 0;
}

.${b}__kicker {
  margin: 0 0 calc(12px * var(--lz-space));
  color: var(--lz-color-text);
  font-size: calc(14px * var(--lz-text-scale));
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.${b}__grid {
  display: grid;
  grid-template-columns: repeat(${bento ? 12 : 3}, minmax(0, 1fr));
  gap: calc(20px * var(--lz-space));
  margin-top: calc(40px * var(--lz-space));
}

.${b}__card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: calc(14px * var(--lz-space));
  min-height: calc(220px * var(--lz-space));
  padding: calc(32px * var(--lz-space));
  border-radius: var(--lz-radius-card);
  color: var(--lz-color-text);
  ${CARD[p.surface]}
}
${spans}
.${b}__price {
  margin: 0;
  color: var(--lz-color-accent-text);
  font-family: var(--lz-font-display);
  font-size: calc(clamp(36px, 4.4vw, 60px) * var(--lz-display-scale));
  letter-spacing: var(--lz-display-tracking, 0);
  line-height: 1;
}

.${b}__name {
  margin: 0;
  font-family: var(--lz-font-display);
  font-size: calc(24px * var(--lz-text-scale));
  line-height: 1.2;
}

.${b}__desc {
  max-width: 44ch;
  margin: 0;
  color: var(--lz-color-muted);
  font-size: calc(16px * var(--lz-text-scale));
  line-height: 1.55;
  text-wrap: pretty;
}

@media (max-width: 992px) {
  .${b}__grid {
    grid-template-columns: repeat(${bento ? 6 : 2}, minmax(0, 1fr));
  }
  .${b}__card,
  .${b}__card:nth-child(n) {
    grid-column: ${bento ? 'span 3' : 'auto'};
  }
}

@media (max-width: 480px) {
  .${b}__grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .${b}__card,
  .${b}__card:nth-child(n) {
    grid-column: auto;
    padding: calc(24px * var(--lz-space));
  }
}
`;
  return {
    html,
    css,
    contentKeys: [
      'kicker',
      'title',
      'prices[].name',
      'prices[].price',
      'prices[].description',
    ],
    tiers: ['basic', 'pro'],
    archetypes: bento ? ['showcase', 'bold', 'catalog'] : ['catalog', 'soft'],
    label: 'Servicios y precios',
    numbered: true,
    description: `Tarjetas ${SURFACE_ES[p.surface]} con el precio grande arriba, nombre y descripción${bento ? '; en escritorio forman un bento de 12 columnas (8/4 y 6/6)' : '; tres por fila en escritorio'}.`,
    intent: `${bento ? 'Catálogo en mosaico' : 'Catálogo en retícula'} con tarjetas ${SURFACE_ES[p.surface]}, a partir de un patrón de Stitch; para giros con pocos servicios bien diferenciados.`,
    sample: { prices: SAMPLE_PRICES },
  };
}

function aboutQuote(variant: string, p: SectionPattern): Scaffold {
  const b = `lz-about-${variant}`;
  const html = `<section id="nosotros" data-lz-slot="about" data-lz-variant="${variant}" class="lz-section ${b}">
  <div class="lz-container ${b}__inner">
    <p class="lz-title ${b}__quote" data-lz-key="statement"></p>
    <span class="${b}__rule" aria-hidden="true"></span>
    <p class="${b}__label" data-lz-key="kicker"></p>
  </div>
</section>
`;
  const css = `.${b} {
  padding: var(--lz-section-pad) 0;
  background: var(--lz-color-surface-2);
  color: var(--lz-color-text);
}

.${b}__inner {
  display: grid;
  justify-items: center;
  gap: calc(24px * var(--lz-space));
  max-width: calc(880px * var(--lz-space));
  text-align: center;
}

.${b}__quote {
  margin: 0;
  font-size: calc(clamp(28px, 3.6vw, 48px) * var(--lz-display-scale));
  line-height: 1.3;
  text-wrap: balance;
}

.${b}__rule {
  width: 48px;
  height: var(--lz-border-width, 1px);
  background: var(--lz-color-accent);
}

/* Text, not muted: the lowest-contrast test theme misses AA for muted on surface-2. */
.${b}__label {
  margin: 0;
  color: var(--lz-color-text);
  font-size: calc(14px * var(--lz-text-scale));
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

@media (max-width: 480px) {
  .${b}__quote {
    font-size: calc(var(--lz-title-section-sm) * var(--lz-display-scale));
  }
}
`;
  return {
    html,
    css,
    contentKeys: ['kicker', 'statement'],
    tiers: ['pro'],
    archetypes: ['editorial', 'minimal', 'trust'],
    label: 'Nosotros',
    numbered: true,
    description: `Cita grande centrada sobre el tinte del tema, un filete de acento y la fuente debajo (${SURFACE_ES[p.surface]}).`,
    intent:
      'Una sola idea de marca dicha como cita editorial, sin foto; para giros que se venden por criterio y trato.',
    sample: {},
  };
}

function ctaCentered(variant: string, p: SectionPattern): Scaffold {
  const b = `lz-cta-${variant}`;
  const html = `<section id="cita" data-lz-slot="cta" data-lz-variant="${variant}" class="lz-section ${b}">
  <div class="lz-container">
    <div class="${b}__card">
      <h2 class="lz-title ${b}__title" data-lz-key="title"></h2>
      <p class="${b}__text" data-lz-if="text" data-lz-key="text"></p>
      <div class="${b}__actions">
        <a href="{{whatsappUrl}}" target="_blank" rel="noopener noreferrer" class="lz-button lz-button--primary ${b}__cta" data-lz-key="primaryCta"></a>
        <a data-lz-if="secondaryCta" class="lz-button lz-button--secondary ${b}__cta" data-lz-attr-href="secondaryHref" data-lz-key="secondaryCta"></a>
      </div>
    </div>
  </div>
</section>
`;
  const css = `.${b} {
  padding: var(--lz-section-pad) 0;
}

.${b}__card {
  display: grid;
  justify-items: center;
  gap: calc(20px * var(--lz-space));
  max-width: calc(760px * var(--lz-space));
  margin: 0 auto;
  padding: calc(64px * var(--lz-space));
  border-radius: var(--lz-radius-card);
  color: var(--lz-color-text);
  text-align: center;
  ${CARD[p.surface === 'flat' ? 'tinted' : p.surface]}
}

.${b}__title {
  margin: 0;
  font-size: calc(
    min(clamp(32px, 4.4vw, 60px), 10svh) * var(--lz-display-scale)
  );
  text-wrap: balance;
}

.${b}__text {
  max-width: 46ch;
  margin: 0;
  color: var(--lz-color-muted);
  font-size: calc(18px * var(--lz-text-scale));
  line-height: 1.55;
}

.${b}__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: calc(12px * var(--lz-space));
}

.${b}__cta {
  touch-action: manipulation;
}

.${b}__cta:active {
  transform: scale(var(--lz-press-scale, 0.97));
  transition: transform var(--lz-dur-press, 120ms)
    var(--lz-ease-out, cubic-bezier(0.23, 1, 0.32, 1));
}

@media (prefers-reduced-motion: reduce) {
  .${b}__cta:active {
    transform: none;
    transition: none;
  }
}

@media (max-width: 480px) {
  .${b}__card {
    padding: calc(32px * var(--lz-space)) calc(24px * var(--lz-space));
  }
}
`;
  return {
    html,
    css,
    contentKeys: [
      'title',
      'text?',
      'primaryCta',
      'secondaryCta?',
      'secondaryHref?',
    ],
    tiers: ['basic', 'pro'],
    archetypes: ['booking', 'bold', 'soft'],
    label: 'Llamada a la acción',
    numbered: false,
    description: `Tarjeta centrada ${SURFACE_ES[p.surface === 'flat' ? 'tinted' : p.surface]} con titular, una línea y el CTA de WhatsApp (más uno secundario opcional). Cuenta como sección.`,
    intent:
      'Un cierre contenido en una sola tarjeta centrada, a partir de un patrón de Stitch (su formulario se vuelve botón de WhatsApp).',
    sample: {
      title:
        'Hablemos de tu <span class="lz-title__serif">primera visita</span>',
      text: 'Escríbenos y te decimos qué horarios hay libres esta semana.',
      primaryCta: 'Escribir por WhatsApp',
      secondaryCta: 'Ver preguntas',
      secondaryHref: '#preguntas',
    },
  };
}

type Generator = (variant: string, p: SectionPattern) => Scaffold;

const GENERATORS: Record<string, Generator> = {
  'services/bento': (v, p) => servicesGrid(v, p, true),
  'services/card-grid': (v, p) => servicesGrid(v, p, false),
  'about/quote': aboutQuote,
  'cta/centered': ctaCentered,
  'cta/band': ctaCentered,
};

export const supportedPatterns = () => Object.keys(GENERATORS);

export function scaffoldFor(
  variant: string,
  p: SectionPattern,
): Scaffold | undefined {
  return GENERATORS[`${p.slot}/${p.layout}`]?.(variant, p);
}
