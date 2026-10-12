import { z } from 'zod';
import { ROLES } from '../tiers';
import { RHYTHM_TOKENS, type RhythmToken } from '../types';

/**
 * template.spec.json, specVersion 1: one business → the generated manifest(s), theme(s), copy pack
 * and demo profile(s). Shape only; giro/blueprint/copy rules live in ./validate.ts.
 */

export const SPEC_VERSION = 1;
export const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
/** Image keys the kit's sections reference (`<key>.jpg` in assets/<giro>/<theme>/). */
export const IMAGE_KEY_RE = /^(hero|about|team-[1-4]|gallery-0[1-8])$/;
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

const text = (description: string) =>
  z.string().trim().min(1).describe(description);

const Id = z
  .string()
  .regex(ID_RE, 'minúsculas, números y guiones simples')
  .max(60)
  .describe(
    'Id de la plantilla: Pro `<giro>-<nombre>-v1`, Básico `<giro>-base-<nombre>-v1`.',
  );

const Hex = z.string().regex(HEX_RE, 'color hex de 6 dígitos, p. ej. #1F5B3D');

export const SectionEntrySchema = z
  .strictObject({
    role: z
      .enum(ROLES)
      .describe(
        'Rol del blueprint (header, hero, about, catalog, proof, team, testimonials, faq, contact, whatsapp, footer, marquee).',
      ),
    slot: z
      .string()
      .optional()
      .describe(
        'Slot del kit; se deduce del rol y el giro. Si lo pones, debe coincidir.',
      ),
    variant: z
      .string()
      .optional()
      .describe(
        'Variante del slot (sections/<slot>/<variante>); sin ella el compilador elige.',
      ),
  })
  .describe('Una sección, en orden de página.');

const PaletteSchema = z
  .union([
    z.strictObject({
      preset: text(
        'Paleta curada del giro (`pnpm lattiz spec init` las lista).',
      ),
    }),
    z.strictObject({
      custom: z.strictObject({
        bg: Hex.describe('Fondo de la página.'),
        accent: Hex.describe('Color de marca (botones, rellenos).'),
        text: Hex.optional().describe(
          'Texto; por defecto casi negro o casi blanco según el fondo.',
        ),
        scheme: z
          .enum(['light', 'dark'])
          .optional()
          .describe('Se deduce del fondo.'),
      }),
    }),
  ])
  .describe(
    'Paleta: `{ "preset": "<id>" }` o `{ "custom": { "bg", "accent" } }` (se derivan tokens AA o se rechaza).',
  );

const FontPairSchema = z
  .union([
    z
      .string()
      .min(1)
      .describe('Par curado, p. ej. `cormorant-garamond+work-sans`.'),
    z.strictObject({
      display: text(
        'Familia para títulos (lista permitida en src/spec/presets.ts › CUSTOM_FONTS).',
      ),
      body: text('Familia para texto.'),
    }),
  ])
  .describe(
    'Par tipográfico: id curado o `{ display, body }` con fuentes permitidas.',
  );

const RhythmSchema = z
  .partialRecord(
    z.enum(Object.keys(RHYTHM_TOKENS) as [RhythmToken, ...RhythmToken[]]),
    z.string().trim().min(1),
  )
  .describe(
    'Ajuste fino del ritmo del tema (docs/template-workflow.md §6): sectionPad, gutter, space, textScale, title*.',
  );

export const BrandSchema = z
  .strictObject({
    palette: PaletteSchema.optional(),
    fontPair: FontPairSchema.optional(),
    shape: z
      .string()
      .min(1)
      .optional()
      .describe(
        'Forma: filete, urbano, sutil, redondo, suave, organico, brutal.',
      ),
    density: z
      .enum(['airy', 'regular', 'compact'])
      .optional()
      .describe('Aire entre secciones; por defecto el de la forma.'),
    photoTreatment: z.enum(['none', 'duotone', 'grayscale', 'warm']).optional(),
    placeholder: z
      .enum(['grain', 'rules', 'stripes', 'blobs', 'arches', 'dots'])
      .optional(),
    container: z
      .string()
      .regex(/^\d{3,4}px$/)
      .optional()
      .describe('Ancho máximo, p. ej. 1200px.'),
    displayScale: z
      .string()
      .regex(/^\d(\.\d+)?$/)
      .optional()
      .describe('Multiplica el tamaño de los títulos (fuentes anchas < 1).'),
    rhythm: RhythmSchema.optional(),
  })
  .describe(
    'Identidad visual. Lo que falte lo elige el compilador entre lo curado del giro, sin chocar con el rubro.',
  );

const BranchSchema = z.strictObject({
  name: text('Nombre corto de la sucursal o colonia.'),
  address: text('Dirección completa; `{{address}}` usa la del negocio.'),
  shortAddress: z.string().optional().describe('Dirección corta para el pie.'),
  hours: text('Horario legible, p. ej. "Lun–Sáb 9:00–19:00".'),
  mapsQuery: z
    .string()
    .optional()
    .describe('Búsqueda de Google Maps; por defecto la dirección.'),
});

export const BusinessSchema = z
  .strictObject({
    name: z.string().trim().min(2).describe('Nombre comercial que se muestra.'),
    shortName: z.string().optional(),
    tagline: z
      .string()
      .optional()
      .describe('Subtítulo de la marca en el navbar.'),
    city: z.string().optional(),
    branch: z
      .string()
      .optional()
      .describe('Colonia o sucursal principal (aparece en antetítulos).'),
    address: z.string().optional(),
    hours: z.string().optional().describe('Horario de la sucursal principal.'),
    phone: z
      .string()
      .optional()
      .describe('Teléfono visible, p. ej. +52 55 1234 5678.'),
    whatsapp: z
      .string()
      .regex(
        /^\d{10,15}$/,
        'solo dígitos con lada de país, p. ej. 5215512345678',
      )
      .optional(),
    whatsappMessage: z.string().optional(),
    email: z.string().email().optional(),
    year: z
      .string()
      .regex(/^\d{4}$/)
      .optional(),
    instagramUrl: z.string().url().optional(),
    facebookUrl: z.string().url().optional(),
    tiktokUrl: z.string().url().optional(),
    googleReviewsUrl: z.string().url().optional(),
    googleReviewUrl: z.string().url().optional(),
    branches: z
      .array(BranchSchema)
      .min(1)
      .max(4)
      .optional()
      .describe('Sucursales (Pro las muestra todas; Básico solo la primera).'),
  })
  .describe(
    'Datos del negocio; el copy los usa como {{name}}, {{phone}}, {{address}}, {{city}}.',
  );

const ImageSourceSchema = z.union([
  z.literal('placeholder'),
  z.strictObject({
    pexels: z.string().trim().min(2).describe('Búsqueda en Pexels.'),
  }),
  z.strictObject({
    file: z.string().trim().min(1).describe('Ruta local (relativa al spec).'),
  }),
]);

export const ImageSchema = z.strictObject({
  key: z
    .string()
    .regex(IMAGE_KEY_RE, 'hero, about, team-1…team-4 o gallery-01…gallery-08'),
  source: ImageSourceSchema,
  alt: z
    .string()
    .trim()
    .min(3)
    .optional()
    .describe('Texto alternativo; sustituye al del copy.'),
  orientation: z.enum(['landscape', 'portrait', 'square']).optional(),
});

const MotionTypeSchema = z.enum([
  'hero',
  'about',
  'cards',
  'steps',
  'timeline',
  'gallery',
  'stats',
  'testimonials',
  'pricing',
  'team',
  'faq',
  'contact',
  'cta',
  'footer',
  'none',
]);
const MotionPatternSchema = z.enum([
  'cascade',
  'alternate',
  'converge',
  'center-out',
  'wave',
  'none',
]);

export const MotionSchema = z
  .strictObject({
    preset: z.enum(['calm', 'editorial', 'none']).optional(),
    progress: z.boolean().optional().describe('Barra de progreso de scroll.'),
    overrides: z
      .record(
        z.string(),
        z.union([
          MotionTypeSchema,
          z.strictObject({
            type: MotionTypeSchema.optional(),
            pattern: MotionPatternSchema.optional(),
          }),
        ]),
      )
      .optional()
      .describe(
        'Correcciones al clasificador: slot, #id o índice → tipo o { type, pattern }.',
      ),
  })
  .describe('Lattiz Motion (solo Pro) → motion del manifiesto.');

const ContentJson = z.json();
export const CopySchema = z
  .record(z.string(), z.record(z.string(), ContentJson))
  .describe(
    'Copy es-MX por slot con las claves del kit (meta.ts › contentKeys) y `head` { title, description }.',
  );

const TierOverrideSchema = z.strictObject({
  name: z
    .string()
    .optional()
    .describe('Nombre de la plantilla en la galería para este tier.'),
  description: z.string().optional(),
  brand: BrandSchema.optional(),
  copy: CopySchema.optional(),
});

export const SpecSchema = z
  .strictObject({
    $schema: z.string().optional(),
    specVersion: z.literal(SPEC_VERSION),
    id: Id.optional(),
    idBase: z
      .string()
      .regex(ID_RE)
      .max(52)
      .optional()
      .describe(
        '`<giro>-<nombre>`: con twin genera `<giro>-base-<nombre>-v1` y `<giro>-<nombre>-v1`.',
      ),
    twin: z
      .boolean()
      .optional()
      .describe('true: genera el par Básico + Pro desde este spec.'),
    tier: z
      .enum(['pro', 'basico', 'ambos'])
      .optional()
      .describe('Con `id`: pro o basico. Con `twin`: ambos.'),
    giro: text('Giro (restaurante, clinica, floreria, barberia).'),
    name: z
      .string()
      .optional()
      .describe(
        'Nombre de la plantilla en la galería; por defecto el del negocio.',
      ),
    description: z
      .string()
      .optional()
      .describe('Descripción de la galería; por defecto la del giro.'),
    business: BusinessSchema,
    brand: BrandSchema.optional(),
    sections: z
      .strictObject({
        pro: z.array(SectionEntrySchema).optional(),
        basico: z.array(SectionEntrySchema).optional(),
      })
      .optional()
      .describe('Secciones por tier, en orden; sin ellas, las del giro.'),
    copy: CopySchema.optional(),
    images: z.array(ImageSchema).optional(),
    demoProfile: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'Perfil demo (forma de business_profile) para `lattiz dev`/`check`; por defecto se arma con business.',
      ),
    motion: MotionSchema.optional(),
    overrides: z
      .strictObject({
        pro: TierOverrideSchema.optional(),
        basico: TierOverrideSchema.optional(),
      })
      .optional()
      .describe('Diferencias por tier (marca o copy) sobre lo compartido.'),
    todo: z
      .array(z.string())
      .optional()
      .describe(
        'Pendientes de revisar; `spec validate` avisa mientras no esté vacío.',
      ),
  })
  .superRefine((spec, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message });
    if (spec.id && spec.idBase)
      issue(
        'idBase',
        'usa `id` (un tier) o `idBase` + `twin` (el par), no ambos',
      );
    if (!spec.id && !spec.idBase)
      issue('id', 'falta `id` (un tier) o `idBase` + `twin: true` (el par)');
    if (spec.idBase && spec.twin !== true)
      issue('twin', '`idBase` va con `twin: true`');
    if (spec.twin && spec.tier && spec.tier !== 'ambos')
      issue('tier', 'con `twin: true` el tier es `ambos`');
    if (spec.id && spec.tier !== 'pro' && spec.tier !== 'basico')
      issue('tier', 'con `id` indica `tier`: "pro" o "basico"');
  });

export type Spec = z.infer<typeof SpecSchema>;
export type SpecSection = z.infer<typeof SectionEntrySchema>;
export type SpecBrand = z.infer<typeof BrandSchema>;
export type SpecBusiness = z.infer<typeof BusinessSchema>;
export type SpecImage = z.infer<typeof ImageSchema>;
export type SpecCopy = z.infer<typeof CopySchema>;
export type SpecTier = 'pro' | 'basico';

export interface SpecProblem {
  level: 'error' | 'warn';
  /** JSON path, e.g. `copy.hero.title`. */
  path: string;
  message: string;
  hint?: string;
}

export function jsonPath(path: readonly PropertyKey[]): string {
  return (
    path
      .map((p, i) =>
        typeof p === 'number' ? `[${p}]` : `${i === 0 ? '' : '.'}${String(p)}`,
      )
      .join('') || '(raíz)'
  );
}

function closest(word: string, options: readonly string[]): string | undefined {
  const distance = (a: string, b: string) => {
    const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i += 1) {
      let prev = dp[0];
      dp[0] = i;
      for (let j = 1; j <= b.length; j += 1) {
        const tmp = dp[j];
        dp[j] = Math.min(
          dp[j] + 1,
          dp[j - 1] + 1,
          prev + (a[i - 1] === b[j - 1] ? 0 : 1),
        );
        prev = tmp;
      }
    }
    return dp[b.length];
  };
  const best = options
    .map((o) => ({ o, d: distance(word, o) }))
    .sort((a, b) => a.d - b.d)[0];
  return best && best.d <= Math.max(2, Math.floor(word.length / 3))
    ? best.o
    : undefined;
}

export { closest };

/** Keys a strict object accepts at `path`, for "¿quisiste decir…?" hints. */
function knownKeysAt(path: readonly PropertyKey[]): string[] {
  let node: z.ZodType | undefined = SpecSchema;
  const unwrap = (t: z.ZodType): z.ZodType =>
    t instanceof z.ZodOptional || t instanceof z.ZodDefault
      ? unwrap(t.unwrap() as z.ZodType)
      : t;
  for (const part of path) {
    if (!node) return [];
    node = unwrap(node);
    if (node instanceof z.ZodObject)
      node = (node.shape as Record<string, z.ZodType>)[String(part)];
    else if (node instanceof z.ZodArray) node = node.element as z.ZodType;
    else if (node instanceof z.ZodUnion)
      node = (node.options as z.ZodType[]).find(
        (o) => unwrap(o) instanceof z.ZodObject,
      );
    else return [];
  }
  if (!node) return [];
  node = unwrap(node);
  if (node instanceof z.ZodUnion)
    return (node.options as z.ZodType[]).flatMap((o) => {
      const u = unwrap(o);
      return u instanceof z.ZodObject ? Object.keys(u.shape) : [];
    });
  return node instanceof z.ZodObject ? Object.keys(node.shape) : [];
}

/** zod issues → readable Spanish problems with a JSON path and, when possible, a suggestion. */
export function zodProblems(error: z.ZodError): SpecProblem[] {
  const out: SpecProblem[] = [];
  for (const issue of error.issues) {
    const path = jsonPath(issue.path);
    switch (issue.code) {
      case 'invalid_type':
        out.push({
          level: 'error',
          path,
          message:
            issue.input === undefined
              ? 'falta este campo'
              : `se esperaba ${issue.expected}, llegó ${Array.isArray(issue.input) ? 'array' : typeof issue.input}`,
        });
        break;
      case 'unrecognized_keys':
        for (const key of issue.keys) {
          const known = knownKeysAt(issue.path);
          out.push({
            level: 'error',
            path: path === '(raíz)' ? key : `${path}.${key}`,
            message: 'campo desconocido',
            hint: closest(key, known)
              ? `¿Quisiste decir "${closest(key, known)}"?`
              : 'Revisa el nombre o bórralo.',
          });
        }
        break;
      case 'invalid_value':
        out.push({
          level: 'error',
          path,
          message: `valor inválido: ${JSON.stringify(issue.input)}`,
          hint: `Opciones: ${issue.values.map((v) => String(v)).join(', ')}`,
        });
        break;
      case 'invalid_union':
        out.push({
          level: 'error',
          path,
          message: 'forma no válida para este campo',
          hint: path.endsWith('palette')
            ? 'Usa { "preset": "<id>" } o { "custom": { "bg": "#…", "accent": "#…" } }.'
            : path.endsWith('fontPair')
              ? 'Usa un id curado ("lora+figtree") o { "display": "Lora", "body": "Figtree" }.'
              : path.endsWith('source')
                ? 'Usa "placeholder", { "pexels": "búsqueda" } o { "file": "ruta.jpg" }.'
                : undefined,
        });
        break;
      case 'too_small':
        out.push({
          level: 'error',
          path,
          message:
            issue.origin === 'array'
              ? `necesita al menos ${String(issue.minimum)} elemento(s)`
              : 'está vacío o es muy corto',
        });
        break;
      case 'too_big':
        out.push({
          level: 'error',
          path,
          message:
            issue.origin === 'array'
              ? `admite como máximo ${String(issue.maximum)} elemento(s)`
              : `máximo ${String(issue.maximum)} caracteres`,
        });
        break;
      case 'invalid_format':
        out.push({
          level: 'error',
          path,
          message: issue.message || `formato inválido (${issue.format})`,
        });
        break;
      default:
        out.push({ level: 'error', path, message: issue.message });
    }
  }
  return out;
}

export type ParsedSpec =
  | { ok: true; spec: Spec }
  | { ok: false; problems: SpecProblem[] };

export function parseSpec(raw: unknown): ParsedSpec {
  const result = SpecSchema.safeParse(raw);
  return result.success
    ? { ok: true, spec: result.data }
    : { ok: false, problems: zodProblems(result.error) };
}

/** JSON Schema (draft 2020-12) for editors and agents: `pnpm lattiz spec schema`. */
export function specJsonSchema(): Record<string, unknown> {
  return {
    ...z.toJSONSchema(SpecSchema, { io: 'input', unrepresentable: 'any' }),
    $id: 'https://lattiz.app/schemas/template.spec.v1.json',
    title: 'Lattiz template.spec.json (specVersion 1)',
  };
}
