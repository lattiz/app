import { describe, expect, it } from 'vitest';
import { heroPhotoMessage, heroPlaceholder } from '../src/lib/hero-photo';
import type { ImageCredit } from '../../template-kit/src/spec/images';

const credit = (file: string, source: ImageCredit['source']): ImageCredit => ({
  file,
  source,
  sha256: 'x',
});

describe('hero photo gate', () => {
  it('flags a placeholder hero, whatever its extension', () => {
    expect(heroPlaceholder([credit('hero.jpg', 'placeholder')])?.file).toBe(
      'hero.jpg',
    );
    expect(heroPlaceholder([credit('hero.webp', 'placeholder')])?.file).toBe(
      'hero.webp',
    );
  });
  it('lets a real photo through (url, file, pixabay or legacy pexels)', () => {
    for (const source of ['url', 'file', 'pixabay', 'pexels'] as const)
      expect(heroPlaceholder([credit('hero.jpg', source)])).toBeUndefined();
  });
  it('only cares about the hero: other placeholders are not the gate', () => {
    expect(
      heroPlaceholder([
        credit('gallery-01.jpg', 'placeholder'),
        credit('hero.jpg', 'url'),
      ]),
    ).toBeUndefined();
    expect(
      heroPlaceholder([credit('hero-detail.jpg', 'placeholder')]),
    ).toBeUndefined();
  });
  it('names the exact images[] key in es-MX', () => {
    expect(heroPhotoMessage('barberia-x-v1', 'hero.jpg')).toMatch(
      /images\[\] «hero» del spec no tiene foto/,
    );
  });
});
