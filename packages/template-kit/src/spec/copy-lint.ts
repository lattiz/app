import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { GIROS } from '../../giros';
import { KIT_ROOT, paths } from '../lib/paths';
import type { ContentObject, ContentPack, ContentValue } from '../types';
import { branchName, businessOf, contentName, specTargets } from './compile';
import type { Spec, SpecProblem, SpecTier } from './schema';
import { mergedCopy } from './validate';

/**
 * Visible-text limits (characters, tags stripped, variables filled with the spec's data) per copy
 * key. Calibrated ~20 % above the longest copy the existing templates fit with at 1366×768 and
 * 390×844; past them a layout risks wrapping out of the viewport fit or breaking a card grid.
 */
export const COPY_LIMITS: Record<string, number> = {
  'navbar.cta': 16,
  // Extended variants (WP6): keys only the new variants read.
  'navbar.notice': 40,
  'hero.note': 40,
  'hero.detailAlt': 125,
  'testimonials.scoreNote': 32,
  'cta.title': 48,
  'cta.text': 140,
  'cta.primaryCta': 24,
  'cta.secondaryCta': 18,
  'cta.badge': 40,
  'cta.kicker': 32,
  'cta.panelTitle': 32,
  'cta.items[]': 56,
  'cta.phoneLabel': 24,
  'cta.hours[].label': 16,
  'cta.hours[].value': 20,
  'cta.summary': 120,
  'cta.steps[].title': 36,
  'cta.steps[].text': 120,
  'cta.steps[].duration': 14,
  'cta.shows[].day': 8,
  'cta.shows[].date': 12,
  'cta.shows[].time': 12,
  'cta.shows[].title': 40,
  'cta.shows[].text': 90,
  'cta.shows[].badge': 16,
  'cta.shows[].cta': 16,
  // A2 heroes: bento facts and rail details.
  'hero.facts[].value': 10,
  'hero.facts[].label': 40,
  'hero.details[].label': 14,
  'hero.details[].value': 32,
  'hero.eyebrow': 48,
  'hero.title': 56,
  'hero.text': 150,
  'hero.primaryCta': 24,
  'hero.secondaryCta': 18,
  'hero.sticker': 24,
  'about.title': 56,
  'about.summary': 240,
  'about.statement': 140,
  'about.paragraphs[]': 230,
  'about.stats[].value': 14,
  'about.stats[].label': 24,
  'about.sticker': 30,
  'about.steps[].title': 36,
  'about.steps[].text': 120,
  'about.steps[].tag': 24,
  'about.primaryCta': 24,
  'about.moments[].time': 8,
  'about.moments[].title': 28,
  'about.moments[].text': 90,
  'services.title': 32,
  'services.intro': 120,
  'services.unit': 40,
  'services.prices[].name': 36,
  'services.prices[].includes[]': 40,
  'services.prices[].badge': 20,
  'services.extras[].name': 28,
  'services.extras[].price': 14,
  'services.prices[].price': 12,
  'services.prices[].description': 96,
  'services.prices[].duration': 16,
  'services.prices[].imageAlt': 125,
  'services.prices[].tags[]': 18,
  'services.promos[].tag': 16,
  'services.promos[].title': 48,
  'services.promos[].text': 120,
  'services.promos[].cta': 16,
  'services.prices[].features[]': 48,
  'services.prices[].cta': 20,
  'services.promos[].slots[].label': 24,
  'services.promos[].slots[].value': 28,
  'services.schedule.title': 32,
  'services.schedule.intro': 120,
  'services.plans.kicker': 24,
  'services.plans.title': 32,
  'services.plans.intro': 120,
  'services.cta': 14,
  'services.badge': 36,
  'services.featuredName': 36,
  'services.featuredText': 200,
  'services.chipsLabel': 30,
  'services.chips[]': 24,
  'services.featuredPrice': 12,
  'services.featuredCta': 18,
  'services.imageAlt': 125,
  'services.products[].name': 30,
  'services.products[].price': 12,
  'services.products[].description': 80,
  'services.products[].imageAlt': 125,
  'gallery.title': 32,
  'gallery.intro': 160,
  'gallery.items[].caption': 34,
  'gallery.items[].alt': 125,
  'gallery.items[].tag': 24,
  'team.title': 32,
  'team.members[].name': 24,
  'team.members[].role': 30,
  'team.members[].tags[]': 24,
  'testimonials.summary': 44,
  'testimonials.reviews[].text': 190,
  'testimonials.reviews[].author': 32,
  'faq.title': 32,
  'faq.intro': 140,
  'faq.cta': 24,
  'faq.items[].question': 70,
  'faq.items[].answer': 220,
  'locations.title': 32,
  'locations.contactText': 160,
  'locations.whatsappValue': 20,
  'locations.whatsappCta': 24,
  'marquee.label': 34,
  'marquee.items[]': 28,
  'floating-whatsapp.label': 34,
  'footer.about': 160,
  'head.title': 60,
  'head.description': 160,
};

/** Copy rules for every giro (`lattiz giro show` prints them with the giro's own). */
export const COPY_RULES: string[] = [
  'Negocio, personas, reseñas y marcas ficticios: nunca un negocio, marca, logo o persona real.',
  'Sin promesas ni superlativos: nada de «garantizado», «el/la mejor», «número uno», «100 %», curas o resultados.',
  'Teléfono, WhatsApp, correo, dirección y ciudad van como variables ({{phone}}, {{whatsappUrl:mensaje}}, {{email}}, {{address}}, {{city}}): se vuelven tokens {{lz:*}} y el cliente pone los suyos. Teléfonos de demo con 0000.',
  'Precios como ejemplo, en pesos mexicanos («Desde $350»); nunca precios de un negocio real.',
  'Español de México, tuteo, frases cortas; cada clave respeta su límite de caracteres (lattiz giro show).',
  'Cada sección dice algo distinto; la Básica y la Pro no repiten el texto del hero; nada copiado de otra plantilla del giro.',
];

// Marker words are uppercase on purpose: «todo» is ordinary Spanish.
const PLACEHOLDER_RE =
  /[Ll]orem|[Ii]psum|\bTODO\b|\bTBD\b|\bFIXME\b|\bPENDIENTE\b|\b[Xx]{3,}\b|<nombre>|\[[^\]]{1,40}\]|\.\.\.\s*$/;

/** Claims a template must never make (ground rules: no guarantees, superlatives or outcomes). */
const BANNED: [RegExp, string][] = [
  [/garantizad[oa]s?|garantizamos/, 'promete resultados («garantizado»)'],
  [/\b(el|la|los|las) mejor(es)?\b/, 'superlativo («el/la mejor»)'],
  [/numero (uno|1)\b|#1\b|\bno\.? ?1 en\b/, 'superlativo («número uno»)'],
  [
    /100 ?% (efectiv|garantizad|segur|natural|libre de)/,
    'promesa absoluta («100 %…»)',
  ],
  [/\bcura(r|mos|n)?\b|\bsana(r|mos)\b/, 'promete curar'],
  [
    /sin dolor|indolor[oa]|elimina(mos|r)? (el |la |las |los )?(dolor|arrugas|celulitis|grasa|caries|manchas)/,
    'promesa de resultado clínico o estético',
  ],
  [/antes y despues/, 'antes/después de salud o estética'],
  [/adelgaz|baja(r|s)? de peso|bajar \d+ ?kg/, 'promesa de peso'],
  [
    /resultados? (inmediat|permanente|definitiv|asegurad)/,
    'promete resultados',
  ],
  [/milagro|infalible|sin riesgos?\b|cero riesgos?/, 'promesa absoluta'],
  [
    /gan(amos|aras|ar) (tu |el )?(juicio|caso|demanda|litigio)|recupera(mos)? tu dinero|evita(r|mos)? (la carcel|multas)/,
    'promete un resultado legal o fiscal',
  ],
  [
    /(avalad|certificad|aprobad)[oa]s? por (la )?(cofepris|sat|ssa|sep|profeco)/,
    'aval de autoridad',
  ],
];

/** Generic AI-sounding phrasing (docs/template-kit-design-principles.md §3), on accent-folded text. WARN only. */
const SLOP: [RegExp, string][] = [
  [
    /\b(eleva|elevamos|lleva|llevamos|llevara)\b.{0,40}\bsiguiente nivel\b|\bal siguiente nivel\b/,
    '«al siguiente nivel»',
  ],
  [/\bsin complicaciones\b/, '«sin complicaciones»'],
  [/\bdesata\b|\bdesatar\b/, '«desata»'],
  [/\bde vanguardia\b/, '«de vanguardia»'],
  [/\brevoluciona(mos|r)?\b/, '«revoluciona»'],
  [/\b(sumergete|adentrate|sumérgete|adéntrate)\b/, '«sumérgete / adéntrate»'],
  [/\bun tapiz de\b/, '«un tapiz de»'],
  [/^en el mundo de\b/, 'apertura «En el mundo de…»'],
  [
    /\bexperiencia(s)? (unica|unicas|inigualable|inigualables|inolvidable)\b/,
    '«experiencia única / inigualable»',
  ],
  [/\bmas que (un|una)\b/, '«más que un…»'],
  [/\btu mejor version\b/, '«tu mejor versión»'],
  [/\bcalidad premium\b/, '«calidad premium»'],
  [/\btransforma (tu|tus)\b/, '«transforma tu…»'],
  [
    /\b(descubre|explora) (el|la|los|las|un|una|nuestro|nuestra)\b.{0,30}\b(mundo|universo|magia)\b/,
    '«descubre el mundo / la magia…»',
  ],
];

/** High-confidence words written without their accent (ambiguous ones like más/está are left out). */
const ACCENTS: Record<string, string> = Object.fromEntries(
  [
    'teléfono días atención también aquí fácil envío envíos médico médica médicos clínica crédito débito',
    'dirección información ubicación sábado sábados miércoles méxico garantía revisión valoración',
    'consultoría asesoría declaración nómina física jurídico jurídica técnica único única rápido',
    'rápida último número página música café menú depilación pestañas cancelación vacunación',
    'esterilización cirugía odontología extracción prótesis estética fotografía mamá papá niños',
    'cotización',
  ]
    .join(' ')
    .split(' ')
    .filter((w) => /[áéíóúñ]/.test(w))
    .map((w) => [fold(w), w]),
);

const BRANDS: string[] = (
  JSON.parse(
    readFileSync(resolve(KIT_ROOT, 'src/spec/brand-blocklist.json'), 'utf8'),
  ) as { brands: string[] }
).brands;

function fold(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const NON_TEXT_KEY =
  /(^|\.)(href|image|images|secondaryHref|url|mapUrl|directionsUrl|mapTitle)$|Url$/;

interface Leaf {
  /** Copy path with indexes, e.g. `services.prices[2].name`. */
  path: string;
  /** Limit key, e.g. `services.prices[].name`. */
  key: string;
  raw: string;
}

const DERIVED_KEYS = new Set(['links', 'branch', 'branches']);

function leaves(copy: Record<string, ContentObject>): Leaf[] {
  const out: Leaf[] = [];
  const walk = (v: ContentValue | undefined, path: string, key: string) => {
    if (typeof v === 'string') {
      if (!NON_TEXT_KEY.test(key)) out.push({ path, key, raw: v });
      return;
    }
    if (Array.isArray(v))
      return v.forEach((x, i) => walk(x, `${path}[${i}]`, `${key}[]`));
    if (v && typeof v === 'object')
      for (const [k, x] of Object.entries(v)) {
        // links/branch/branches are rebuilt from business and sections: not copy the spec writes.
        if (key === path && DERIVED_KEYS.has(k)) continue;
        walk(x, `${path}.${k}`, `${key}.${k}`);
      }
  };
  for (const [slot, value] of Object.entries(copy)) walk(value, slot, slot);
  return out;
}

const sentences = (text: string): string[] =>
  fold(text)
    .split(/[.!?¿¡:;]+/)
    .map((s) =>
      s
        .replace(/[^a-z0-9ñ ]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter((s) => s.split(' ').length >= 5);

/** Content packs of the giro other than this spec's own (hand-made or generated). */
async function otherPacks(spec: Spec): Promise<[string, ContentPack][]> {
  const own = contentName(spec);
  const out: [string, ContentPack][] = [];
  for (const file of readdirSync(paths.content).filter(
    (f) => f.startsWith(`${spec.giro}.`) && f.endsWith('.es-MX.ts'),
  )) {
    const name = file.replace(/\.ts$/, '');
    if (name === own) continue;
    const mod = (await import(resolve(paths.content, file))) as {
      default: ContentPack;
    };
    out.push([name, mod.default]);
  }
  return out;
}

/**
 * `spec validate --strict`: copy rules a model or a person must meet before a build is worth
 * reviewing. Errors block; warnings are judgment calls the review should look at.
 */
export async function lintCopy(spec: Spec): Promise<SpecProblem[]> {
  const giro = GIROS[spec.giro];
  if (!giro) return [];
  const problems: SpecProblem[] = [];
  const add = (
    level: SpecProblem['level'],
    rule: string,
    path: string,
    message: string,
    hint?: string,
  ) => {
    if (problems.some((p) => p.path === path && p.rule === rule)) return;
    problems.push({ level, rule, path, message, ...(hint ? { hint } : {}) });
  };
  const business = businessOf(spec, giro);
  const branch = branchName(spec, giro);
  const fill = (text: string) =>
    text
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\{\{\s*index\s*\}\}/g, '01')
      .replace(/\{\{\s*branch\s*\}\}/g, branch)
      .replace(/\{\{\s*whatsappUrl(:[^}]*)?\s*\}\}/g, 'https://wa.me/x')
      .replace(
        /\{\{\s*(\w+)\s*\}\}/g,
        (_m, k: string) =>
          ((business as unknown as Record<string, string>)[k] ?? k) as string,
      )
      .trim();

  // Business data: fictional and in the right fields.
  const digits = (business.phone + business.whatsapp).replace(/\D/g, '');
  if (!/0000/.test(digits))
    add(
      'warn',
      'datos-ficticios',
      'business.phone',
      'el teléfono o WhatsApp no parece de demostración',
      'Usa números ficticios con 0000 (p. ej. +52 55 0000 0000 / 5215500000000): las plantillas nunca llevan teléfonos reales.',
    );
  if (/ejemplo/i.test(business.address))
    add(
      'warn',
      'placeholder',
      'business.address',
      'la dirección es la de ejemplo del giro',
      'Pon una dirección ficticia con calle y colonia de la ciudad del negocio.',
    );
  for (const brand of BRANDS)
    if (
      new RegExp(
        `(^|[^\\p{L}])${escapeRe(fold(brand))}($|[^\\p{L}])`,
        'u',
      ).test(fold(business.name))
    )
      add(
        'error',
        'marca-real',
        'business.name',
        `«${brand}» es una marca real`,
        'Inventa un nombre ficticio.',
      );

  const tiers = specTargets(spec).map((t) => t.tier);
  const copies = {} as Record<SpecTier, Record<string, ContentObject>>;
  for (const t of tiers)
    copies[t] = { ...mergedCopy(spec, t), head: headCopy(spec, t) };
  const where = (tier: SpecTier, path: string) =>
    spec.overrides?.[tier]?.copy && hasPath(spec.overrides[tier].copy, path)
      ? `overrides.${tier}.copy.${path}`
      : `copy.${path}`;

  const seenInPage = new Map<string, string>();
  for (const tier of tiers) {
    for (const leaf of leaves(copies[tier])) {
      const at = where(tier, leaf.path);
      const text = fill(leaf.raw);
      const folded = fold(text);
      if (PLACEHOLDER_RE.test(leaf.raw))
        add(
          'error',
          'placeholder',
          at,
          `texto de relleno: «${text.slice(0, 60)}»`,
          'Escribe el texto final.',
        );
      const limit = COPY_LIMITS[leaf.key];
      if (limit && text.length > limit)
        add(
          'error',
          'longitud',
          at,
          `${text.length} caracteres; el máximo para ${leaf.key} es ${limit}`,
          'Acórtalo: un texto más largo rompe el encaje o la retícula de la variante.',
        );
      for (const [re, what] of BANNED)
        if (re.test(folded))
          add(
            'error',
            'promesa',
            at,
            `${what}: «${text.slice(0, 70)}»`,
            'Las plantillas no prometen resultados ni usan superlativos; describe el servicio.',
          );
      if (
        /(\+?52[\s-]?)?\(?\d{2,3}\)?[\s-]?\d{3,4}[\s-]\d{4}\b/.test(leaf.raw) ||
        /wa\.me\/|tel:\+?\d/.test(leaf.raw)
      )
        add(
          'error',
          'contacto-literal',
          at,
          'teléfono escrito a mano',
          'Usa {{phone}}, {{phoneUrl}} o {{whatsappUrl:mensaje}}: se vuelven tokens {{lz:*}} y el cliente pone los suyos.',
        );
      if (/[\w.+-]+@[\w-]+\.[\w.]+/.test(leaf.raw))
        add(
          'error',
          'contacto-literal',
          at,
          'correo escrito a mano',
          'Usa {{email}} / {{emailUrl}}.',
        );
      for (const brand of BRANDS)
        if (
          new RegExp(
            `(^|[^\\p{L}])${escapeRe(fold(brand))}($|[^\\p{L}])`,
            'u',
          ).test(folded)
        )
          add(
            'error',
            'marca-real',
            at,
            `menciona la marca real «${brand}»`,
            'Solo negocios, productos y personas ficticios.',
          );
      // Anti-slop (WARN): phrasing, dashes, shouting, title case.
      for (const [re, what] of SLOP)
        if (re.test(folded))
          add(
            'warn',
            'muletilla',
            at,
            `muletilla de texto generado: ${what}`,
            'Dilo con un dato concreto del negocio (qué, dónde, cuándo).',
          );
      if ((text.match(/—/g) ?? []).length > 1)
        add(
          'warn',
          'rayas',
          at,
          'más de una raya (—) en el mismo texto',
          'Un punto, coma, dos puntos o paréntesis casi siempre leen mejor.',
        );
      const shouted = (text.match(/\b[A-ZÁÉÍÓÚÑ]{5,}\b/g) ?? []).length;
      if (shouted >= 2 && !/(kicker|eyebrow|label|tag)$/i.test(leaf.key))
        add(
          'warn',
          'mayusculas',
          at,
          'palabras en mayúsculas sostenidas',
          'Las mayúsculas las pone el estilo display; el copy va en mayúsculas de oración.',
        );
      // head.title carries the business's proper name: not a title-case check.
      if (/(title|question)$/.test(leaf.key) && leaf.key !== 'head.title') {
        const words = text.split(/\s+/).slice(1);
        const capped = words.filter((w) =>
          /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{3,}/.test(w),
        );
        if (
          words.length >= 2 &&
          capped.length >= 2 &&
          capped.length >= words.length / 2
        )
          add(
            'warn',
            'mayusculas',
            at,
            'título en Mayúsculas De Título',
            'Mayúsculas de oración: «Nuestros servicios», no «Nuestros Servicios».',
          );
      }
      for (const word of text.toLowerCase().match(/\p{L}+/gu) ?? []) {
        const fixed = ACCENTS[word];
        if (fixed)
          add('warn', 'acentos', at, `«${word}» sin acento → «${fixed}»`);
      }
      if (
        /question$/.test(leaf.key) &&
        text.endsWith('?') &&
        !text.startsWith('¿')
      )
        add('warn', 'ortografia', at, 'pregunta sin «¿» de apertura');
      if (/\s{2,}| ,|,,|\.\./.test(text.replace(/\.\.\.$/, '')))
        add('warn', 'ortografia', at, 'espacios o signos repetidos');
      for (const s of sentences(text)) {
        const first = seenInPage.get(`${tier}|${s}`);
        if (first && first !== leaf.path.split(/[.[]/)[0])
          add(
            'warn',
            'repetido',
            at,
            `la misma frase ya está en ${first}: «${s.slice(0, 60)}»`,
            'Cada sección dice algo distinto.',
          );
        else seenInPage.set(`${tier}|${s}`, leaf.path.split(/[.[]/)[0]);
      }
    }
  }

  // Repeated sentence skeletons: «Somos X. Somos Y. Somos Z.» inside one text, or four body
  // sentences of a page opening with the same two words (alts, labels and titles don't count).
  const BODY =
    /(text|summary|statement|paragraphs\[\]|answer|intro|description|about)$/;
  for (const tier of tiers) {
    const openers = new Map<string, string[]>();
    for (const leaf of leaves(copies[tier])) {
      // Own split: the shared one drops sentences under five words, and «Somos sabor.» is short.
      const short = fold(fill(leaf.raw))
        .split(/[.!?¿¡:;]+/)
        .map((x) =>
          x
            .replace(/[^a-z0-9ñ ]+/g, ' ')
            .trim()
            .split(/\s+/),
        )
        .filter((w) => w.length >= 2);
      const list = sentences(fill(leaf.raw)).map((x) => fold(x).split(/\s+/));
      const first = new Map<string, number>();
      for (const w of short) first.set(w[0], (first.get(w[0]) ?? 0) + 1);
      for (const [word, n] of first)
        if (n >= 3)
          add(
            'warn',
            'esqueleto',
            where(tier, leaf.path),
            `${n} frases seguidas empiezan con «${word}»`,
            'Varía el arranque: una frase corta, una con dato, una con verbo.',
          );
      if (!BODY.test(leaf.key)) continue;
      for (const w of list)
        if (w.length >= 2) {
          const key = w.slice(0, 2).join(' ');
          openers.set(key, [...(openers.get(key) ?? []), leaf.path]);
        }
    }
    for (const [key, paths] of openers)
      if (paths.length >= 4)
        add(
          'warn',
          'esqueleto',
          where(tier, paths[0]),
          `${paths.length} frases de la página empiezan igual («${key}…»): ${paths.slice(0, 3).join(', ')}`,
          'Varía el arranque: una frase corta, una con dato, una con verbo.',
        );
  }

  if (tiers.length === 2) {
    const pro = fill(String(copies.pro.hero?.text ?? ''));
    const basico = fill(String(copies.basico.hero?.text ?? ''));
    if (pro && pro === basico)
      add(
        'warn',
        'repetido',
        'overrides.basico.copy.hero.text',
        'la Básica y la Pro dicen lo mismo bajo el titular',
        'Dale a la Básica un texto propio en overrides.basico.copy.hero.text (más directo; la Pro, más de marca).',
      );
  }

  // Against the giro's default copy (generic) and the other templates of the giro.
  const keys = [
    'hero.title',
    'hero.text',
    'about.summary',
    'about.statement',
    'footer.about',
    'head.description',
  ];
  const giroCopy = { ...giro.copy, head: giro.head } as Record<
    string,
    ContentObject
  >;
  for (const tier of tiers)
    for (const key of keys) {
      const [slot, k] = key.split('.');
      const mine = copies[tier][slot]?.[k];
      if (typeof mine === 'string' && mine === giroCopy[slot]?.[k])
        add(
          'warn',
          'generico',
          where(tier, key),
          'es el texto por defecto del giro',
          'Escríbelo para este negocio: el copy por defecto se repite en todas las plantillas del giro.',
        );
    }
  const mineSentences = new Map<string, string>();
  for (const tier of tiers)
    for (const leaf of leaves(copies[tier]))
      if (
        !/(kicker|label|cta|title|caption|alt|name|tags|question)$/i.test(
          leaf.key.split('.').pop() ?? '',
        )
      )
        for (const s of sentences(fill(leaf.raw)))
          mineSentences.set(s, where(tier, leaf.path));
  for (const [name, pack] of await otherPacks(spec)) {
    const theirs = new Set(
      leaves({
        ...pack.sections,
        head: pack.head as unknown as ContentObject,
      }).flatMap((l) => sentences(l.raw.replace(/<[^>]+>/g, ''))),
    );
    // One warning per slot: the review needs where, not every sentence.
    const bySlot = new Map<string, string[]>();
    for (const [s, at] of mineSentences)
      if (theirs.has(s)) {
        const slot = at
          .replace(/^(overrides\.\w+\.)?copy\./, '')
          .split(/[.[]/)[0];
        bySlot.set(slot, [...(bySlot.get(slot) ?? []), s]);
      }
    for (const [slot, list] of bySlot)
      add(
        'warn',
        'repetido',
        `copy.${slot}`,
        `${list.length} frase(s) iguales a content/${name}: ${list
          .slice(0, 3)
          .map((x) => `«${x.slice(0, 50)}»`)
          .join(', ')}`,
        'Reescríbelas: dos plantillas del giro no deben sonar igual.',
      );
  }
  return problems;
}

function headCopy(spec: Spec, tier: SpecTier): ContentObject {
  const giro = GIROS[spec.giro];
  return {
    ...giro.head,
    ...((spec.copy?.head ?? {}) as ContentObject),
    ...((spec.overrides?.[tier]?.copy?.head ?? {}) as ContentObject),
  };
}

function hasPath(obj: unknown, path: string): boolean {
  let cur: unknown = obj;
  for (const part of path.replace(/\[(\d+)\]/g, '.$1').split('.')) {
    if (cur === null || typeof cur !== 'object') return false;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur !== undefined;
}

function escapeRe(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
