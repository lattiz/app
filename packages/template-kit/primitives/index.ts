/**
 * Primitives (extended catalog): shared, token-driven pieces that new section variants compose
 * (buttons, cards, tags, image frames, big numbers, pull-quotes, dividers). A variant writes the
 * family's block class (`lz-btn`); the theme's `primitives` choice (an art direction) adds one style
 * modifier (`lz-btn--pill`) at compile time, and the compiler emits only the CSS of the families and
 * styles a template's markup uses. Existing variants use none of these classes, so legacy output is
 * unchanged. CSS: primitives/<family>/base.css + <style>.css.
 */

export interface PrimitiveStyle {
  /** One line: what it looks like and when to use it. */
  intent: string;
  /** Written explicitly in markup for a context (icon, on an image); never a theme-wide choice. */
  contextual?: boolean;
}

export interface PrimitiveFamily {
  label: string;
  /** BEM block every element of the family carries. */
  block: string;
  styles: Record<string, PrimitiveStyle>;
  /** Style added to bare elements when the theme doesn't choose one; null = follow the style tokens. */
  defaultStyle: string | null;
  /** Modifiers that mark a role, not a style: elements carrying one get no theme style. */
  roles?: string[];
}

export const PRIMITIVES = {
  button: {
    label: 'Botón',
    block: 'lz-btn',
    defaultStyle: 'solid',
    roles: ['secondary'],
    styles: {
      solid: { intent: 'Relleno del acento: la acción principal sin rodeos.' },
      outline: {
        intent:
          'Contorno de 2 px en el acento, texto en tinta: sobrio, para direcciones de confianza.',
      },
      pill: {
        intent:
          'Relleno en cápsula con más aire a los lados: amable, para direcciones redondas.',
      },
      underline: {
        intent:
          'Texto con subrayado del acento que se completa al pasar: editorial, sin caja.',
      },
      icon: {
        intent:
          'Con un SVG en línea (flecha, WhatsApp) que se desplaza 2 px al pasar.',
        contextual: true,
      },
      'on-image': {
        intent:
          'Velo del overlay con borde claro, para botones sobre una foto.',
        contextual: true,
      },
    },
  },
  card: {
    label: 'Tarjeta',
    block: 'lz-tile',
    defaultStyle: null,
    styles: {
      flat: {
        intent:
          'Sin caja: filete superior y aire; para listas densas y editoriales.',
      },
      outlined: {
        intent: 'Filete fuerte sin relleno; para precios y comparaciones.',
      },
      tinted: { intent: 'Relleno de superficie 2 sin borde; amable y suave.' },
      elevated: {
        intent: 'Superficie con sombra difusa teñida de tinta; jerarquía real.',
      },
    },
  },
  tag: {
    label: 'Etiqueta / antetítulo',
    block: 'lz-tag',
    defaultStyle: 'plain',
    styles: {
      pill: { intent: 'Cápsula sobre superficie 2.' },
      outlined: { intent: 'Contorno fino con el radio interior del tema.' },
      plain: { intent: 'Mayúsculas espaciadas en gris: antetítulo discreto.' },
      numbered: {
        intent:
          'Cifra tabular y filete corto antes del texto (pasos, no secciones).',
      },
    },
  },
  frame: {
    label: 'Marco de imagen',
    block: 'lz-frame',
    defaultStyle: null,
    styles: {
      arch: { intent: 'Arco arriba, esquinas suaves abajo.' },
      cut: {
        intent: 'Dos esquinas cortadas en diagonal; recorte con clip-path.',
      },
      offset: {
        intent: 'Bloque del acento desplazado 14 px; reserva su margen.',
      },
      framed: {
        intent:
          'Paspartú: relleno de superficie y filete alrededor de la foto.',
      },
      duotone: { intent: 'Foto en grises con velo del acento en multiply.' },
    },
  },
  number: {
    label: 'Cifra grande',
    block: 'lz-bignum',
    defaultStyle: 'plain',
    styles: {
      plain: { intent: 'Cifra display con etiqueta debajo.' },
      ruled: { intent: 'Filete del acento encima de la cifra.' },
    },
  },
  quote: {
    label: 'Cita destacada',
    block: 'lz-pullquote',
    defaultStyle: 'rule',
    styles: {
      rule: { intent: 'Filete vertical del acento a la izquierda.' },
      marks: { intent: 'Comilla de apertura grande en el acento.' },
    },
  },
  divider: {
    label: 'Separador',
    block: 'lz-rule',
    defaultStyle: 'hairline',
    styles: {
      hairline: { intent: 'Filete de 1 px en el color de línea.' },
      rule: { intent: 'Filete de 2 px en tinta.' },
      ornament: { intent: 'Filete con un rombo del acento al centro.' },
    },
  },
} satisfies Record<string, PrimitiveFamily>;

export type PrimitiveFamilyId = keyof typeof PRIMITIVES;
export const PRIMITIVE_FAMILIES = Object.keys(
  PRIMITIVES,
) as PrimitiveFamilyId[];

/** A theme's choice of style per family (only theme-wide, non-contextual styles). */
export type PrimitiveChoices = Partial<Record<PrimitiveFamilyId, string>>;

export function themeStyles(family: PrimitiveFamilyId): string[] {
  const f: PrimitiveFamily = PRIMITIVES[family];
  return Object.entries(f.styles)
    .filter(([, s]) => !s.contextual)
    .map(([id]) => id);
}

/** Problems with a `primitives` object (theme or spec); empty when valid. */
export function primitiveChoiceProblems(
  raw: unknown,
  where = 'theme.primitives',
): string[] {
  if (raw === undefined) return [];
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw))
    return [`${where} must be an object`];
  const out: string[] = [];
  for (const [key, value] of Object.entries(raw)) {
    if (!(key in PRIMITIVES))
      out.push(
        `${where}.${key} is not one of ${PRIMITIVE_FAMILIES.join(' | ')}`,
      );
    else if (!themeStyles(key as PrimitiveFamilyId).includes(String(value)))
      out.push(
        `${where}.${key} must be one of ${themeStyles(key as PrimitiveFamilyId).join(' | ')}`,
      );
  }
  return out;
}
