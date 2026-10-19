export const PREVIEW_WIDTHS = [360, 768, 1440] as const;

export type PreviewWidth = (typeof PREVIEW_WIDTHS)[number];

export const PREVIEW_FRAME_HEIGHT = 960;

export const PREVIEW_WIDTH_LABEL: Record<PreviewWidth, string> = {
  360: 'Teléfono',
  768: 'Tableta',
  1440: 'Escritorio',
};

/**
 * Shrinks the iframe so a fixed device width fits the card. Never enlarges it.
 * An unmeasured container (width 0) stays at 0 so the first paint is not 1440px wide.
 */
export function previewScale(containerWidth: number, frameWidth: number): number {
  if (!Number.isFinite(containerWidth) || !Number.isFinite(frameWidth)) return 1;
  if (frameWidth <= 0) return 1;
  if (containerWidth <= 0) return 0;
  return Math.min(1, containerWidth / frameWidth);
}

export function isPreviewWidth(value: number): value is PreviewWidth {
  return PREVIEW_WIDTHS.some((width) => width === value);
}
