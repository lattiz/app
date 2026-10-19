import type { TemplateGalleryItemDto } from '@lattiz/api-client';
import { describe, expect, it } from 'vitest';
import {
  filterOptions,
  filterTemplates,
  identityFor,
  NO_FILTERS,
} from './template-identity';
import { TEMPLATE_IDENTITIES } from './template-identity.generated';

const item = (id: string, tier: 'basic' | 'pro'): TemplateGalleryItemDto =>
  ({
    id,
    name: id,
    description: null,
    category: null,
    previewUrl: null,
    thumbnailUrl: null,
    sortOrder: 0,
    tier,
    accessible: true,
    lockedReason: null,
  }) as TemplateGalleryItemDto;

const gallery = [
  item('restaurante-la-nota-azul-v1', 'pro'),
  item('restaurante-base-la-nota-azul-v1', 'basic'),
  item('barberia-oxido-v1', 'pro'),
  item('plantilla-fuera-del-kit', 'basic'),
];

describe('template identity', () => {
  it('every kit template has giro, four swatches and a tier', () => {
    for (const t of TEMPLATE_IDENTITIES) {
      expect(t.giroLabel.length, t.id).toBeGreaterThan(2);
      expect(t.swatches, t.id).toHaveLength(4);
      for (const s of t.swatches) expect(s, t.id).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('Pro templates list Animaciones; Básico templates list no Pro feature', () => {
    for (const t of TEMPLATE_IDENTITIES) {
      if (t.tier === 'pro')
        expect(t.proFeatures, t.id).toContain('Animaciones');
      else expect(t.proFeatures, t.id).toEqual([]);
    }
  });

  it('knows the art direction of spec templates, null elsewhere', () => {
    expect(identityFor('restaurante-la-nota-azul-v1')?.direction?.id).toBe(
      'neon-nocturno',
    );
    expect(identityFor('restaurante-la-nota-azul-v1')?.proFeatures).toContain(
      'Portada con cifras',
    );
    expect(identityFor('plantilla-fuera-del-kit')).toBeNull();
  });

  it('filters by giro and direction on top of the tier filter', () => {
    expect(filterTemplates(gallery, NO_FILTERS)).toHaveLength(4);
    expect(
      filterTemplates(gallery, { ...NO_FILTERS, giro: 'restaurante' }).map(
        (t) => t.id,
      ),
    ).toEqual([
      'restaurante-la-nota-azul-v1',
      'restaurante-base-la-nota-azul-v1',
    ]);
    expect(
      filterTemplates(gallery, {
        tier: 'pro',
        giro: 'restaurante',
        direction: 'neon-nocturno',
      }).map((t) => t.id),
    ).toEqual(['restaurante-la-nota-azul-v1']);
  });

  it('offers only the giros and directions present in the gallery', () => {
    const opts = filterOptions(gallery);
    expect(Object.keys(opts.giros).sort()).toEqual(['barberia', 'restaurante']);
    expect(opts.directions).toEqual({ 'neon-nocturno': 'Neón nocturno' });
  });
});
