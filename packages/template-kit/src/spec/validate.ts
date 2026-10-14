import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { ARCHETYPES } from '../../archetypes';
import { DIRECTIONS } from '../../directions';
import { GIROS } from '../../giros';
import { loadBlueprint, loadSectionMeta } from '../lib/load';
import { paths } from '../lib/paths';
import { countedSlots, TIERS, type Role } from '../tiers';
import type { ContentObject } from '../types';
import { catalogOf, fontPairIds, paletteById, paletteIds } from './catalog';
import { missingPaths } from './copy-keys';
import {
  allowedVariants,
  deepMerge,
  KIT_TIER,
  specTargets,
  TIER_LABEL,
} from './compile';
import { SHAPES } from './presets';
import { closest, type Spec, type SpecProblem, type SpecTier } from './schema';
import { resolveFontPair } from './theme';

export function mergedCopy(
  spec: Spec,
  tier: SpecTier,
): Record<string, ContentObject> {
  const giro = GIROS[spec.giro];
  const out: Record<string, ContentObject> = {};
  const slots = new Set([
    ...Object.keys(giro?.copy ?? {}),
    ...Object.keys(spec.copy ?? {}),
    ...Object.keys(spec.overrides?.[tier]?.copy ?? {}),
  ]);
  for (const slot of slots) {
    let v = (giro?.copy[slot] ?? {}) as ContentObject;
    if (spec.copy?.[slot]) v = deepMerge(v, spec.copy[slot] as ContentObject);
    const over = spec.overrides?.[tier]?.copy?.[slot];
    if (over) v = deepMerge(v, over as ContentObject);
    out[slot] = v;
  }
  return out;
}

/**
 * What `lattiz spec validate` reports beyond the schema: giro and presets, sections against the
 * blueprints, copy completeness against each variant's contentKeys, images and Motion.
 */
export async function validateSpec(
  spec: Spec,
  specFile?: string,
): Promise<SpecProblem[]> {
  const problems: SpecProblem[] = [];
  const err = (path: string, message: string, hint?: string) =>
    problems.push({ level: 'error', path, message, ...(hint ? { hint } : {}) });
  const warn = (path: string, message: string, hint?: string) =>
    problems.push({ level: 'warn', path, message, ...(hint ? { hint } : {}) });

  const giro = GIROS[spec.giro];
  if (!giro) {
    const guess = closest(spec.giro, Object.keys(GIROS));
    err(
      'giro',
      `giro desconocido: "${spec.giro}"`,
      guess
        ? `¿Quisiste decir "${guess}"? Giros: ${Object.keys(GIROS).join(', ')}`
        : `Giros: ${Object.keys(GIROS).join(', ')}`,
    );
    return problems;
  }
  const targets = specTargets(spec);
  for (const t of targets) {
    if (t.id.length > 60)
      err(spec.id ? 'id' : 'idBase', `el id ${t.id} pasa de 60 caracteres`);
    const expect = t.tier === 'pro' ? `${giro.id}-` : `${giro.id}-base-`;
    if (!t.id.startsWith(expect))
      warn(
        spec.id ? 'id' : 'idBase',
        `${t.id} no sigue la convención ${t.tier === 'pro' ? '<giro>-<nombre>-v1' : '<giro>-base-<nombre>-v1'}`,
      );
  }
  if (spec.idBase && !spec.idBase.startsWith(`${giro.id}-`))
    err(
      'idBase',
      `idBase debe empezar con "${giro.id}-"`,
      `p. ej. "${giro.id}-${spec.idBase}"`,
    );

  const brands = [
    ['brand', spec.brand],
    ['overrides.pro.brand', spec.overrides?.pro?.brand],
    ['overrides.basico.brand', spec.overrides?.basico?.brand],
  ] as const;
  for (const [path, brand] of brands) {
    if (!brand) continue;
    if (
      brand.palette &&
      'preset' in brand.palette &&
      !paletteById(giro, brand.palette.preset)
    ) {
      const guess = closest(brand.palette.preset, paletteIds(giro));
      err(
        `${path}.palette.preset`,
        `la paleta "${brand.palette.preset}" no existe para ${giro.label}`,
        `${guess ? `¿"${guess}"? ` : ''}Del giro: ${Object.keys(giro.palettes).join(', ')} (o una de la biblioteca: kit:spec presets)`,
      );
    }
    if (brand.fontPair !== undefined && !resolveFontPair(brand.fontPair)) {
      const guess =
        typeof brand.fontPair === 'string'
          ? closest(brand.fontPair, fontPairIds())
          : undefined;
      err(
        `${path}.fontPair`,
        `par tipográfico no permitido: ${JSON.stringify(brand.fontPair)}`,
        `${guess ? `¿"${guess}"? ` : ''}Curados para ${giro.label}: ${giro.fontPairs.join(', ')}`,
      );
    }
    if (brand.shape && !SHAPES[brand.shape]) {
      const guess = closest(brand.shape, Object.keys(SHAPES));
      err(
        `${path}.shape`,
        `forma desconocida: "${brand.shape}"`,
        `${guess ? `¿"${guess}"? ` : ''}Opciones: ${Object.keys(SHAPES).join(', ')}`,
      );
    }
  }
  if (catalogOf(spec) === 'legacy')
    for (const [path, brand] of brands)
      if (brand?.style)
        err(
          `${path}.style`,
          'los estilos (brand.style) son del catálogo extended',
          'Agrega "catalog": "extended" en brand, o quita style.',
        );
  if (catalogOf(spec) === 'legacy') {
    for (const [path, brand] of brands)
      if (brand?.primitives)
        err(
          `${path}.primitives`,
          'los primitivos (brand.primitives) son del catálogo extended',
          'Agrega "catalog": "extended" en brand, o quita primitives.',
        );
    if (spec.layout)
      err(
        'layout',
        'layout (dirección, arquetipo, variantes, diales) es del catálogo extended',
        'Agrega "catalog": "extended" en brand, o quita layout.',
      );
  }
  if (spec.layout?.direction && !DIRECTIONS[spec.layout.direction]) {
    const guess = closest(spec.layout.direction, Object.keys(DIRECTIONS));
    err(
      'layout.direction',
      `dirección de arte desconocida: "${spec.layout.direction}"`,
      `${guess ? `¿Quisiste decir "${guess}"? ` : ''}Direcciones: ${Object.keys(DIRECTIONS).join(', ')}`,
    );
  }
  if (spec.layout?.archetype && !(spec.layout.archetype in ARCHETYPES)) {
    const guess = closest(spec.layout.archetype, Object.keys(ARCHETYPES));
    err(
      'layout.archetype',
      `arquetipo desconocido: "${spec.layout.archetype}"`,
      `${guess ? `¿Quisiste decir "${guess}"? ` : ''}Arquetipos: ${Object.keys(ARCHETYPES).join(', ')}`,
    );
  }
  if (spec.overrides) {
    for (const tier of Object.keys(spec.overrides) as SpecTier[])
      if (!targets.some((t) => t.tier === tier))
        warn(
          `overrides.${tier}`,
          `este spec no genera ${TIER_LABEL[tier]}; se ignora`,
        );
  }

  const usedImages = new Set<string>();
  for (const { tier } of targets) {
    const blueprint = await loadBlueprint('service-landing', KIT_TIER[tier]);
    const slotsByRole = blueprint.verticals[giro.id]?.slots ?? {};
    const entries = spec.sections?.[tier] ?? giro.sections[tier];
    const path = `sections.${tier}`;
    const seen = new Set<string>();
    const resolved: { slot: string; variant: string }[] = [];
    entries.forEach((entry, i) => {
      const at = `${path}[${i}]`;
      if (!blueprint.roles[entry.role]) {
        err(
          `${at}.role`,
          `el rol "${entry.role}" no existe en ${TIER_LABEL[tier]}`,
          `Roles de ${TIER_LABEL[tier]}: ${Object.keys(blueprint.roles).join(', ')}`,
        );
        return;
      }
      const slot = slotsByRole[entry.role] as string;
      if ('slot' in entry && entry.slot && entry.slot !== slot)
        err(
          `${at}.slot`,
          `el rol ${entry.role} usa el slot "${slot}" en ${giro.label}, no "${entry.slot}"`,
        );
      if (seen.has(entry.role))
        err(`${at}.role`, `el rol ${entry.role} está repetido`);
      seen.add(entry.role);
      const variant =
        ('variant' in entry ? entry.variant : undefined) ??
        giro.sections[tier].find((d) => d.role === entry.role)?.variant ??
        allowedVariants(blueprint, entry.role, slot, catalogOf(spec))[0];
      // Naming a variant works in any catalog; only the compiler's own picks are catalog-bound.
      const allowed = allowedVariants(blueprint, entry.role, slot, 'extended');
      if (!existsSync(resolve(paths.sections, slot, variant)))
        err(
          `${at}.variant`,
          `no existe sections/${slot}/${variant}`,
          `Variantes: ${allowed.join(', ')}`,
        );
      else if (!allowed.includes(variant))
        err(
          `${at}.variant`,
          `${TIER_LABEL[tier]} no permite ${slot}/${variant}`,
          `Permitidas: ${allowed.join(', ')}`,
        );
      resolved.push({ slot, variant });
    });
    for (const [key, variant] of Object.entries(
      spec.layout?.variantOverrides ?? {},
    )) {
      const at = `layout.variantOverrides.${key}`;
      const entry = entries.find(
        (e) => e.role === key || slotsByRole[e.role] === key,
      );
      if (!entry) {
        const keys = entries.flatMap((e) => [e.role, slotsByRole[e.role]]);
        const guess = closest(key, keys.filter(Boolean) as string[]);
        if (tier === targets[0].tier)
          warn(
            at,
            `ninguna sección de ${TIER_LABEL[tier]} tiene el rol o slot "${key}"`,
            guess ? `¿Quisiste decir "${guess}"?` : undefined,
          );
        continue;
      }
      const slot = slotsByRole[entry.role] as string;
      const allowed = allowedVariants(blueprint, entry.role, slot, 'extended');
      if (!allowed.includes(variant)) {
        const guess = closest(variant, allowed);
        err(
          at,
          `${TIER_LABEL[tier]} no permite ${slot}/${variant}`,
          `${guess ? `¿Quisiste decir "${guess}"? ` : ''}Permitidas: ${allowed.join(', ')}`,
        );
      }
    }
    for (const role of TIERS[KIT_TIER[tier]].requiredRoles)
      if (!seen.has(role as Role))
        err(
          path,
          `${TIER_LABEL[tier]} necesita el rol "${role}"`,
          `Agrega { "role": "${role}" }.`,
        );
    const counted = countedSlots(resolved.map((r) => r.slot)).length;
    const { countedMin, countedMax } = TIERS[KIT_TIER[tier]];
    if (counted < countedMin || counted > countedMax)
      err(
        path,
        `${counted} secciones contadas; ${TIER_LABEL[tier]} pide ${countedMin}–${countedMax}`,
        'floating-whatsapp y marquee no cuentan.',
      );
    if (resolved[0] && resolved[0].slot !== 'navbar')
      err(`${path}[0]`, 'la primera sección debe ser el header (navbar)');
    const heroAt = resolved.findIndex((r) => r.slot === 'hero');
    if (heroAt > 1)
      err(`${path}[${heroAt}]`, 'hero debe ir justo después del header');

    // Copy completeness per variant.
    const copy = mergedCopy(spec, tier);
    for (const { slot, variant } of resolved) {
      if (!existsSync(resolve(paths.sections, slot, variant, 'meta.ts')))
        continue;
      const meta = await loadSectionMeta(slot, variant);
      // Layout specs get the variant's sample copy under their own (as the compiler does).
      const slotCopy =
        spec.layout && meta.sample
          ? { ...meta.sample, ...(copy[slot] ?? {}) }
          : (copy[slot] ?? {});
      for (const key of meta.contentKeys)
        for (const miss of missingPaths(slotCopy, key))
          err(
            `copy.${slot}.${miss}`,
            `falta (lo pide ${slot}/${variant} en ${TIER_LABEL[tier]})`,
            `Defínelo en copy.${slot} o en overrides.${tier}.copy.${slot}.`,
          );
      for (const k of ['image', 'items', 'members', 'products']) {
        const v = copy[slot]?.[k];
        if (k === 'image' && typeof v === 'string')
          usedImages.add(v.replace(/\.jpg$/, ''));
        if (Array.isArray(v))
          for (const item of v)
            if (item && typeof item === 'object' && !Array.isArray(item)) {
              const img = (item as ContentObject).image;
              if (typeof img === 'string')
                usedImages.add(img.replace(/\.jpg$/, ''));
            }
      }
    }
  }

  for (const slot of Object.keys(spec.copy ?? {})) {
    if (slot === 'head') continue;
    if (
      !giro.copy[slot] &&
      ![
        'navbar',
        'hero',
        'about',
        'services',
        'gallery',
        'team',
        'testimonials',
        'faq',
        'locations',
        'floating-whatsapp',
        'footer',
        'marquee',
      ].includes(slot)
    )
      warn(
        `copy.${slot}`,
        `"${slot}" no es un slot del kit; se ignora`,
        closest(slot, Object.keys(giro.copy))
          ? `¿"${closest(slot, Object.keys(giro.copy))}"?`
          : undefined,
      );
  }

  // A pasted URL in the copy would ship as a hotlink; photos go through images[] and land in assets/.
  const localName = (path: string): string => {
    const n = Number(/\[(\d+)\]/.exec(path)?.[1] ?? 0) + 1;
    if (/members\[/.test(path)) return `team-${n}`;
    if (/items\[/.test(path)) return `gallery-${String(n).padStart(2, '0')}`;
    if (/products\[/.test(path)) return `product-${String(n).padStart(2, '0')}`;
    return /about\./.test(path) ? 'about' : 'hero';
  };
  const remote = (value: unknown, path: string): void => {
    if (typeof value === 'string') {
      if (/^https?:\/\//.test(value) && /(^|\.)image$/.test(path))
        err(
          path,
          'la imagen es una URL: el kit solo usa archivos locales',
          `Pon "${localName(path)}.jpg" aquí y la URL en images[]: { "key": "${localName(path)}", "source": { "url": "${value}" } }.`,
        );
      return;
    }
    if (Array.isArray(value))
      return value.forEach((v, n) => remote(v, `${path}[${n}]`));
    if (value && typeof value === 'object')
      for (const [k, v] of Object.entries(value)) remote(v, `${path}.${k}`);
  };
  remote(spec.copy ?? {}, 'copy');
  for (const tier of ['pro', 'basico'] as const)
    remote(spec.overrides?.[tier]?.copy ?? {}, `overrides.${tier}.copy`);

  (spec.images ?? []).forEach((img, i) => {
    if (!usedImages.has(img.key))
      warn(
        `images[${i}].key`,
        `ninguna sección de este spec usa ${img.key}.jpg`,
      );
    if (typeof img.source === 'object' && 'file' in img.source && specFile) {
      const from = resolve(dirname(specFile), img.source.file);
      if (!existsSync(from))
        err(
          `images[${i}].source.file`,
          `no existe ${img.source.file} (relativo al spec)`,
        );
    }
  });

  if (spec.motion && !targets.some((t) => t.tier === 'pro'))
    warn('motion', 'Lattiz Motion solo corre en Pro; en Básico se ignora');
  if (spec.todo && spec.todo.length > 0)
    warn(
      'todo',
      `${spec.todo.length} pendiente(s) por revisar: ${spec.todo.join('; ')}`,
      'Bórralos de "todo" cuando estén listos.',
    );
  return problems;
}
