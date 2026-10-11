import { BASE_CSS, ICONS, img, type SectionBlock } from './shared';

const CATEGORY = 'Secciones Pro';

/** Editable data-lz-* values: Pro blocks expose them as traits in the settings panel. */
const counterTraits = [
  { type: 'text', name: 'data-lz-counter', label: 'Número final' },
  { type: 'text', name: 'data-lz-prefix', label: 'Antes del número' },
  { type: 'text', name: 'data-lz-suffix', label: 'Después del número' },
];

function stat(value: string, prefix: string, suffix: string, label: string) {
  return {
    tagName: 'li',
    classes: ['lzb-stats__item'],
    components: [
      {
        tagName: 'strong',
        classes: ['lzb-stats__value'],
        attributes: {
          'data-lz-counter': value,
          'data-lz-prefix': prefix,
          'data-lz-suffix': suffix,
        },
        traits: counterTraits,
        components: `${prefix}${Number(value).toLocaleString('es-MX')}${suffix}`,
      },
      { tagName: 'span', classes: ['lzb-stats__label'], components: label },
    ],
  };
}

const heroEditorial: SectionBlock = {
  id: 'lzb-hero-editorial',
  label: 'Portada editorial',
  category: CATEGORY,
  media: ICONS.hero,
  content: {
    tagName: 'section',
    classes: ['lzb', 'lzb-hero-ed'],
    attributes: { 'data-lz-section': 'hero' },
    styles: `${BASE_CSS}
.lzb-hero-ed{overflow:hidden}
.lzb-hero-ed__grid{display:grid;grid-template-columns:repeat(12,1fr);gap:20px;align-items:end}
.lzb-hero-ed__title{grid-column:1/9;margin:0;font-family:var(--lzb-display);font-size:clamp(48px,9vw,140px);line-height:.9;text-transform:var(--lz-display-transform,none);letter-spacing:-.01em}
.lzb-hero-ed__title em{color:var(--lzb-accent-text);font-family:var(--lz-font-serif,Georgia,serif);font-style:var(--lz-accent-style,italic);text-transform:var(--lz-accent-transform,none)}
.lzb-hero-ed__media{grid-column:9/13;grid-row:1/3}
.lzb-hero-ed__media img{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:var(--lzb-radius)}
.lzb-hero-ed__copy{grid-column:1/7;display:flex;flex-direction:column;gap:20px}
@media (max-width:992px){.lzb-hero-ed__title,.lzb-hero-ed__copy,.lzb-hero-ed__media{grid-column:1/-1;grid-row:auto}.lzb-hero-ed__media img{aspect-ratio:16/10}}`,
    components: `
<div class="lzb__inner lzb-hero-ed__grid">
  <h2 class="lzb-hero-ed__title" data-lz-words>Hecho a mano, <em>con oficio</em></h2>
  <div class="lzb-hero-ed__media" data-lz-parallax="0.08">${img(900, 1200, 'Foto principal')}</div>
  <div class="lzb-hero-ed__copy" data-lz-reveal="fade-up">
    <p class="lzb__lead">Una promesa clara en dos líneas. Lo que hace distinto a tu negocio y por qué volver.</p>
    <a class="lzb__btn" href="{{lz:whatsapp_url}}">Agenda por WhatsApp</a>
  </div>
</div>`,
  },
};

const marquee: SectionBlock = {
  id: 'lzb-marquee',
  label: 'Cinta en movimiento',
  category: CATEGORY,
  media: ICONS.marquee,
  content: {
    tagName: 'section',
    classes: ['lzb', 'lzb-marquee'],
    // Self-animated: Lattiz Motion's section choreography stays out.
    attributes: { 'aria-label': 'Lo que hacemos', 'data-lz-section': 'none' },
    styles: `${BASE_CSS}
.lzb-marquee{padding:18px 0;overflow:hidden;background:var(--lzb-accent);color:var(--lzb-on-accent)}
.lzb-marquee__track{display:flex;width:max-content;animation:lzb-marquee 28s linear infinite}
.lzb-marquee__track:hover{animation-play-state:paused}
.lzb-marquee__group{display:flex;gap:48px;padding-right:48px;margin:0;list-style:none;font-family:var(--lzb-display);font-size:clamp(20px,3vw,34px);text-transform:var(--lz-display-transform,none);white-space:nowrap}
@keyframes lzb-marquee{to{transform:translateX(-50%)}}
@media (prefers-reduced-motion:reduce){.lzb-marquee__track{animation:none}}`,
    components: `
<div class="lzb-marquee__track">
  <ul class="lzb-marquee__group"><li>Cortes clásicos</li><li>✦</li><li>Barba a navaja</li><li>✦</li><li>Color</li><li>✦</li><li>Citas por WhatsApp</li><li>✦</li></ul>
  <ul class="lzb-marquee__group" aria-hidden="true"><li>Cortes clásicos</li><li>✦</li><li>Barba a navaja</li><li>✦</li><li>Color</li><li>✦</li><li>Citas por WhatsApp</li><li>✦</li></ul>
</div>`,
  },
};

const stackedCards: SectionBlock = {
  id: 'lzb-stacked-cards',
  label: 'Tarjetas apiladas',
  category: CATEGORY,
  media: ICONS.stack,
  content: {
    tagName: 'section',
    classes: ['lzb', 'lzb-stack'],
    attributes: { 'data-lz-section': 'cards' },
    styles: `${BASE_CSS}
.lzb-stack__list{display:grid;gap:24px;margin:40px 0 0;padding:0;list-style:none}
.lzb-stack__card{position:sticky;top:calc(80px + var(--i,0) * 24px);display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:center;min-height:320px;padding:clamp(24px,4vw,48px);border-radius:var(--lzb-radius);background:var(--lzb-surface);border:var(--lz-border-width,1px) solid var(--lzb-line);box-shadow:0 -12px 40px rgba(0,0,0,.08)}
.lzb-stack__card:nth-child(2){--i:1}
.lzb-stack__card:nth-child(3){--i:2}
.lzb-stack__card h3{margin:0 0 10px;font-family:var(--lzb-display);font-size:clamp(26px,3.4vw,44px);line-height:1}
.lzb-stack__card p{margin:0;color:var(--lzb-muted)}
.lzb-stack__card img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:calc(var(--lzb-radius) * .7)}
@media (max-width:992px){.lzb-stack__card{position:relative;top:auto;grid-template-columns:1fr}}`,
    components: `
<div class="lzb__inner">
  <p class="lzb__eyebrow">Cómo trabajamos</p>
  <h2 class="lzb__title" data-lz-reveal="fade-up">Tres pasos, cero complicaciones</h2>
  <ol class="lzb-stack__list">
    <li class="lzb-stack__card"><div><h3>01 · Agenda</h3><p>Escríbenos por WhatsApp y elige tu horario.</p></div>${img(800, 600, 'Paso uno')}</li>
    <li class="lzb-stack__card"><div><h3>02 · Te atendemos</h3><p>Llegas, te escuchamos y trabajamos sin prisa.</p></div>${img(800, 600, 'Paso dos')}</li>
    <li class="lzb-stack__card"><div><h3>03 · Vuelves</h3><p>Te recordamos tu próxima cita para que no la pierdas.</p></div>${img(800, 600, 'Paso tres')}</li>
  </ol>
</div>`,
  },
};

const snapGallery: SectionBlock = {
  id: 'lzb-snap-gallery',
  label: 'Galería deslizable',
  category: CATEGORY,
  media: ICONS.snap,
  content: {
    tagName: 'section',
    classes: ['lzb', 'lzb-snap'],
    attributes: { 'data-lz-section': 'gallery' },
    styles: `${BASE_CSS}
.lzb-snap__track{display:grid;grid-auto-flow:column;grid-auto-columns:min(78%,420px);gap:16px;margin-top:32px;padding:0 max(24px,calc((100% - var(--lz-container,1200px)) / 2)) 12px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding-inline:max(24px,calc((100% - var(--lz-container,1200px)) / 2));overscroll-behavior-x:contain}
.lzb-snap__track figure{margin:0;scroll-snap-align:start}
.lzb-snap__track img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:var(--lzb-radius);cursor:zoom-in}
.lzb-snap__track figcaption{margin-top:8px;color:var(--lzb-muted);font-size:14px}`,
    components: `
<div class="lzb__inner">
  <p class="lzb__eyebrow">Galería</p>
  <h2 class="lzb__title" data-lz-reveal="fade-up">Desliza para ver más</h2>
</div>
<div class="lzb-snap__track" data-lz-lightbox>
  ${[1, 2, 3, 4, 5].map((n) => `<figure>${img(800, 1000, `Trabajo ${n}`)}<figcaption>Trabajo ${n}</figcaption></figure>`).join('\n  ')}
</div>`,
  },
};

const beforeAfter: SectionBlock = {
  id: 'lzb-before-after',
  label: 'Antes y después',
  category: CATEGORY,
  media: ICONS.compare,
  content: {
    tagName: 'section',
    classes: ['lzb', 'lzb-compare-block'],
    attributes: { 'data-lz-section': 'text' },
    styles: `${BASE_CSS}
.lzb-compare-block__frame{max-width:900px;margin:32px auto 0;border-radius:var(--lzb-radius);overflow:hidden}
.lzb-compare-block__frame img{width:100%;aspect-ratio:4/3;object-fit:cover}
.lzb-compare-block__labels{display:flex;justify-content:space-between;max-width:900px;margin:10px auto 0;color:var(--lzb-muted);font-size:13px;letter-spacing:.12em;text-transform:uppercase}`,
    components: `
<div class="lzb__inner">
  <p class="lzb__eyebrow">Resultados</p>
  <h2 class="lzb__title">Antes y después</h2>
  <div class="lzb-compare-block__frame" data-lz-compare="50">
    ${img(1200, 900, 'Antes')}
    ${img(1200, 900, 'Después')}
  </div>
  <div class="lzb-compare-block__labels"><span>Antes</span><span>Después</span></div>
</div>`,
  },
};

const statsCounters: SectionBlock = {
  id: 'lzb-stats',
  label: 'Cifras animadas',
  category: CATEGORY,
  media: ICONS.stats,
  content: {
    tagName: 'section',
    classes: ['lzb', 'lzb-stats'],
    attributes: { 'data-lz-section': 'stats' },
    styles: `${BASE_CSS}
.lzb-stats__list{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin:0;padding:0;list-style:none}
.lzb-stats__item{display:flex;flex-direction:column;gap:6px;padding-top:20px;border-top:var(--lz-border-width,1px) solid var(--lzb-line)}
.lzb-stats__value{font-family:var(--lzb-display);font-size:clamp(40px,6vw,80px);line-height:1;color:var(--lzb-accent-text);font-variant-numeric:tabular-nums}
.lzb-stats__label{color:var(--lzb-muted)}
@media (max-width:992px){.lzb-stats__list{grid-template-columns:repeat(2,1fr)}}`,
    components: [
      {
        tagName: 'div',
        classes: ['lzb__inner'],
        components: [
          {
            tagName: 'ul',
            classes: ['lzb-stats__list'],
            attributes: { 'data-lz-stagger': '120' },
            components: [
              stat('12', '', '', 'años de oficio'),
              stat('4800', '+', '', 'clientes atendidos'),
              stat('4.9', '', '★', 'calificación promedio'),
              stat('15', '', ' min', 'de espera promedio'),
            ],
          },
        ],
      },
    ],
  },
};

const countdownDefault = new Date(Date.now() + 14 * 86_400_000)
  .toISOString()
  .replace(/\.\d{3}Z$/, 'Z');

const promoBar: SectionBlock = {
  id: 'lzb-promo-bar',
  label: 'Barra de promoción',
  category: CATEGORY,
  media: ICONS.promo,
  content: {
    tagName: 'section',
    classes: ['lzb', 'lzb-promo'],
    attributes: { 'data-lz-section': 'cta' },
    styles: `${BASE_CSS}
.lzb-promo{padding:14px 0;background:var(--lzb-text);color:var(--lzb-bg)}
.lzb-promo__inner{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px 20px;text-align:center}
.lzb-promo__text{margin:0;font-weight:600}
.lzb-promo__time{font-family:var(--lz-font-mono,ui-monospace,monospace);font-variant-numeric:tabular-nums;font-weight:700}
.lzb-promo .lzb__btn{min-height:38px;padding:8px 16px}`,
    components: [
      {
        tagName: 'div',
        classes: ['lzb__inner', 'lzb-promo__inner'],
        components: [
          {
            tagName: 'p',
            classes: ['lzb-promo__text'],
            components: '2x1 en servicios seleccionados · termina en',
          },
          {
            tagName: 'span',
            classes: ['lzb-promo__time'],
            attributes: {
              'data-lz-countdown': countdownDefault,
              'data-lz-expired-text': 'Promoción terminada',
            },
            traits: [
              {
                type: 'text',
                name: 'data-lz-countdown',
                label: 'Termina (AAAA-MM-DDTHH:MM:SS-06:00)',
              },
              {
                type: 'text',
                name: 'data-lz-expired-text',
                label: 'Texto al terminar',
              },
            ],
            components: 'Pronto',
          },
          '<a class="lzb__btn" href="{{lz:whatsapp_url}}">Aprovechar</a>',
        ],
      },
    ],
  },
};

const openNowBadge: SectionBlock = {
  id: 'lzb-open-now',
  label: 'Abierto ahora',
  category: CATEGORY,
  media: ICONS.clock,
  content: {
    tagName: 'div',
    classes: ['lzb-open'],
    styles: `
.lzb-open{display:inline-flex;align-items:center;gap:10px;padding:8px 14px;border-radius:var(--lz-radius-pill,999px);background:var(--lz-color-surface-2,#f0efea);color:var(--lz-color-text,#1a1a1a);font-weight:600;font-size:14px}
.lzb-open__dot{width:9px;height:9px;border-radius:50%;background:var(--lz-color-muted,#8a867d)}
.lzb-open:has([data-lz-state="open"]) .lzb-open__dot{background:#1f9d55}
.lzb-open:has([data-lz-state="closed"]) .lzb-open__dot{background:#c2410c}
.lzb-open__hours{color:var(--lz-color-muted,#5c5c57);font-weight:400}`,
    components: `<span class="lzb-open__dot" aria-hidden="true"></span><span data-lz-open-now>Horario</span><span class="lzb-open__hours">{{lz:hours_summary}}</span>`,
  },
};

const whatsappCards: SectionBlock = {
  id: 'lzb-whatsapp-cards',
  label: 'Menú con pedido por WhatsApp',
  category: CATEGORY,
  media: ICONS.whatsapp,
  content: {
    tagName: 'section',
    classes: ['lzb', 'lzb-menu'],
    attributes: { 'data-lz-section': 'cards' },
    styles: `${BASE_CSS}
.lzb-menu__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin:32px 0 0;padding:0;list-style:none}
.lzb-menu__card{display:flex;flex-direction:column;overflow:hidden;border-radius:var(--lzb-radius);background:var(--lzb-surface);border:var(--lz-border-width,1px) solid var(--lzb-line)}
.lzb-menu__card img{width:100%;aspect-ratio:4/3;object-fit:cover}
.lzb-menu__body{display:flex;flex-direction:column;gap:8px;flex:1;padding:20px}
.lzb-menu__body h3{margin:0;font-size:20px}
.lzb-menu__body p{margin:0;color:var(--lzb-muted)}
.lzb-menu__row{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:auto;padding-top:12px}
.lzb-menu__price{font-weight:700;font-size:18px}
.lzb-menu__order{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:8px 14px;border-radius:var(--lzb-pill);background:#25D366;color:#0b3d1f;font-weight:700;text-decoration:none}
@media (max-width:992px){.lzb-menu__grid{grid-template-columns:repeat(2,1fr)}}
@media (max-width:480px){.lzb-menu__grid{grid-template-columns:1fr}}`,
    components: `
<div class="lzb__inner">
  <p class="lzb__eyebrow">Menú</p>
  <h2 class="lzb__title" data-lz-reveal="fade-up">Pide directo por WhatsApp</h2>
  <ul class="lzb-menu__grid" data-lz-stagger="100">
    ${['Producto uno', 'Producto dos', 'Producto tres']
      .map(
        (name, i) =>
          `<li class="lzb-menu__card">${img(800, 600, name)}<div class="lzb-menu__body"><h3>${name}</h3><p>Descripción breve: ingredientes, tamaño o qué incluye.</p><div class="lzb-menu__row"><span class="lzb-menu__price">$${(i + 1) * 90 + 39} MXN</span><a class="lzb-menu__order" href="{{lz:whatsapp_url}}?text=${encodeURIComponent(`Hola, quiero pedir: ${name}`)}">Pedir</a></div></div></li>`,
      )
      .join('\n    ')}
  </ul>
</div>`,
  },
};

/** Pro section kit: editorial structure plus Lattiz Motion attributes (inert in the editor). */
export const PRO_BLOCKS: SectionBlock[] = [
  heroEditorial,
  marquee,
  stackedCards,
  snapGallery,
  beforeAfter,
  statsCounters,
  promoBar,
  openNowBadge,
  whatsappCards,
];
