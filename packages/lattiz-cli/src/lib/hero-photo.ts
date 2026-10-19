import { resolve } from 'node:path';
import {
  CREDITS_FILE,
  type ImageCredit,
  readCredits,
} from '../../../template-kit/src/spec/images';
import { gate } from './errors';
import { KIT } from './paths';
import { readState } from './state';
import { readDist } from './templates';

/** The hero photo of a spec build, when it is still the art-directed placeholder. */
export function heroPlaceholder(
  images: ImageCredit[],
): ImageCredit | undefined {
  return images.find(
    (i) => /^hero\.[a-z0-9]+$/i.test(i.file) && i.source === 'placeholder',
  );
}

/** Spec builds only (hand-made templates have no CREDITS.json); null when the hero has a real photo. */
export function heroPlaceholderOf(id: string): ImageCredit | null {
  const { manifest } = readDist(id);
  const dir = resolve(KIT, 'assets', manifest.vertical, manifest.theme);
  if (!readCredits(dir).images.length) return null;
  return heroPlaceholder(readCredits(dir).images) ?? null;
}

export const heroPhotoMessage = (id: string, file: string) =>
  `La foto de portada de ${id} (${file}) sigue siendo un placeholder: images[] «${file.replace(/\.[a-z0-9]+$/i, '')}» del spec no tiene foto.`;

export const HERO_PHOTO_HINT = (id: string) => {
  const spec =
    readState(id).spec?.file ?? 'packages/template-kit/specs/<spec>.spec.json';
  return `En ${spec} pon { "key": "hero", "source": { "url": "https://images.pexels.com/…" } } (o { "file": "…" }) y corre pnpm lattiz build ${spec
    .split('/')
    .pop()
    ?.replace(/\.spec\.json$/, '')}. Archivo: ${CREDITS_FILE}.`;
};

/** ship / publish: a template whose hero is still a placeholder is not published. */
export function assertHeroPhotos(ids: string[]): void {
  for (const id of ids) {
    const p = heroPlaceholderOf(id);
    if (p) throw gate(heroPhotoMessage(id, p.file), HERO_PHOTO_HINT(id));
  }
}
