import { BASE_CSS, ICONS, img, type SectionBlock } from './shared';

const CATEGORY = 'Secciones';

const heroSimple: SectionBlock = {
  id: 'lzb-hero-simple',
  label: 'Portada simple',
  category: CATEGORY,
  media: ICONS.hero,
  content: {
    tagName: 'section',
    classes: ['lzb', 'lzb-hero'],
    attributes: { 'data-lz-section': 'hero' },
    styles: `${BASE_CSS}
.lzb-hero__grid{display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(24px,4vw,56px);align-items:center}
.lzb-hero__actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}
.lzb-hero__media img{width:100%;border-radius:var(--lzb-radius);object-fit:cover;aspect-ratio:4/5}
@media (max-width:992px){.lzb-hero__grid{grid-template-columns:1fr}.lzb-hero__media img{aspect-ratio:16/10}}`,
    components: `
<div class="lzb__inner lzb-hero__grid">
  <div>
    <p class="lzb__eyebrow">{{lz:city}}</p>
    <h2 class="lzb__title">Lo que tu negocio hace mejor, en una frase</h2>
    <p class="lzb__lead">Cuenta en dos líneas qué ofreces, para quién y por qué elegirte.</p>
    <div class="lzb-hero__actions">
      <a class="lzb__btn" href="{{lz:whatsapp_url}}">Escríbenos por WhatsApp</a>
      <a class="lzb__btn lzb__btn--ghost" href="{{lz:phone_tel}}">Llamar</a>
    </div>
  </div>
  <div class="lzb-hero__media">${img(800, 1000, 'Foto principal del negocio')}</div>
</div>`,
  },
};

const servicesGrid: SectionBlock = {
  id: 'lzb-services-grid',
  label: 'Servicios en tarjetas',
  category: CATEGORY,
  media: ICONS.grid,
  content: {
    tagName: 'section',
    classes: ['lzb', 'lzb-services'],
    attributes: { 'data-lz-section': 'cards' },
    styles: `${BASE_CSS}
.lzb-services__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin:32px 0 0;padding:0;list-style:none}
.lzb-services__card{display:flex;flex-direction:column;gap:10px;padding:24px;border:var(--lz-border-width,1px) solid var(--lzb-line);border-radius:var(--lzb-radius);background:var(--lzb-surface)}
.lzb-services__card h3{margin:0;font-size:20px}
.lzb-services__card p{margin:0;color:var(--lzb-muted)}
.lzb-services__price{margin-top:auto;color:var(--lzb-accent-text);font-weight:700;font-size:18px}
@media (max-width:992px){.lzb-services__grid{grid-template-columns:repeat(2,1fr)}}
@media (max-width:480px){.lzb-services__grid{grid-template-columns:1fr}}`,
    components: `
<div class="lzb__inner">
  <p class="lzb__eyebrow">Servicios</p>
  <h2 class="lzb__title">Lo que ofrecemos</h2>
  <ul class="lzb-services__grid">
    <li class="lzb-services__card"><h3>Servicio uno</h3><p>Describe en una línea qué incluye.</p><span class="lzb-services__price">$250 MXN</span></li>
    <li class="lzb-services__card"><h3>Servicio dos</h3><p>Describe en una línea qué incluye.</p><span class="lzb-services__price">$350 MXN</span></li>
    <li class="lzb-services__card"><h3>Servicio tres</h3><p>Describe en una línea qué incluye.</p><span class="lzb-services__price">$450 MXN</span></li>
  </ul>
</div>`,
  },
};

const galleryGrid: SectionBlock = {
  id: 'lzb-gallery-grid',
  label: 'Galería en cuadrícula',
  category: CATEGORY,
  media: ICONS.gallery,
  content: {
    tagName: 'section',
    classes: ['lzb', 'lzb-gallery'],
    attributes: { 'data-lz-section': 'gallery' },
    styles: `${BASE_CSS}
.lzb-gallery__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:32px}
.lzb-gallery__grid img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:var(--lzb-radius);transition:transform .4s ease}
.lzb-gallery__grid img:hover{transform:scale(1.03)}
@media (max-width:480px){.lzb-gallery__grid{grid-template-columns:repeat(2,1fr)}}
@media (prefers-reduced-motion:reduce){.lzb-gallery__grid img{transition:none}}`,
    components: `
<div class="lzb__inner">
  <p class="lzb__eyebrow">Galería</p>
  <h2 class="lzb__title">Nuestro trabajo</h2>
  <div class="lzb-gallery__grid">
    ${[1, 2, 3, 4, 5, 6].map((n) => img(600, 600, `Trabajo ${n}`)).join('\n    ')}
  </div>
</div>`,
  },
};

const contactHours: SectionBlock = {
  id: 'lzb-contact-hours',
  label: 'Contacto y horario',
  category: CATEGORY,
  media: ICONS.contact,
  content: {
    tagName: 'section',
    classes: ['lzb', 'lzb-contact'],
    attributes: { 'data-lz-section': 'text' },
    styles: `${BASE_CSS}
.lzb-contact__grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:32px}
.lzb-contact__card{padding:24px;border-radius:var(--lzb-radius);background:var(--lzb-surface-2)}
.lzb-contact__card h3{margin:0 0 8px;font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:var(--lzb-muted)}
.lzb-contact__card p{margin:0 0 6px;font-size:18px}
.lzb-contact__card a{color:inherit}
.lzb-contact .lzb__btn{margin-top:28px}
@media (max-width:480px){.lzb-contact__grid{grid-template-columns:1fr}}`,
    components: `
<div class="lzb__inner">
  <p class="lzb__eyebrow">Contacto</p>
  <h2 class="lzb__title">Visítanos o escríbenos</h2>
  <div class="lzb-contact__grid">
    <div class="lzb-contact__card"><h3>Dónde estamos</h3><p>{{lz:address}}</p></div>
    <div class="lzb-contact__card"><h3>Horario</h3><p>{{lz:hours_summary}}</p></div>
    <div class="lzb-contact__card"><h3>Teléfono</h3><p><a href="{{lz:phone_tel}}">{{lz:phone}}</a></p></div>
    <div class="lzb-contact__card"><h3>Correo</h3><p><a href="mailto:{{lz:email}}">{{lz:email}}</a></p></div>
  </div>
  <a class="lzb__btn" href="{{lz:whatsapp_url}}">Escríbenos por WhatsApp</a>
</div>`,
  },
};

/** Básico section kit: simple, fast and never cheap-looking. */
export const BASIC_BLOCKS: SectionBlock[] = [
  heroSimple,
  servicesGrid,
  galleryGrid,
  contactHours,
];
