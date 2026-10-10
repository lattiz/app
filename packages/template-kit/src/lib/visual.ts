import sharp from 'sharp';

/**
 * Perceptual distance between template renders for the squint test: structure (1 − SSIM on
 * luminance) and color (mean CIELAB ΔE) on small downscaled images, both in 0–1.
 */

export interface Raster {
  width: number;
  height: number;
  /** RGB, 3 bytes per pixel. */
  data: Uint8Array;
}

export async function loadRaster(
  file: string,
  width: number,
  height: number,
): Promise<Raster> {
  const data = await sharp(file)
    .resize(width, height, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer();
  return { width, height, data: new Uint8Array(data) };
}

function luma(r: Raster): Float64Array {
  const out = new Float64Array(r.width * r.height);
  for (let i = 0; i < out.length; i += 1)
    out[i] =
      0.2126 * r.data[i * 3] +
      0.7152 * r.data[i * 3 + 1] +
      0.0722 * r.data[i * 3 + 2];
  return out;
}

/** Mean SSIM over non-overlapping 8×8 windows (1 = identical structure). */
export function ssim(a: Raster, b: Raster, win = 8): number {
  const la = luma(a);
  const lb = luma(b);
  const c1 = (0.01 * 255) ** 2;
  const c2 = (0.03 * 255) ** 2;
  let total = 0;
  let count = 0;
  for (let y = 0; y + win <= a.height; y += win) {
    for (let x = 0; x + win <= a.width; x += win) {
      let ma = 0;
      let mb = 0;
      for (let j = 0; j < win; j += 1)
        for (let i = 0; i < win; i += 1) {
          const k = (y + j) * a.width + x + i;
          ma += la[k];
          mb += lb[k];
        }
      const n = win * win;
      ma /= n;
      mb /= n;
      let va = 0;
      let vb = 0;
      let cov = 0;
      for (let j = 0; j < win; j += 1)
        for (let i = 0; i < win; i += 1) {
          const k = (y + j) * a.width + x + i;
          va += (la[k] - ma) ** 2;
          vb += (lb[k] - mb) ** 2;
          cov += (la[k] - ma) * (lb[k] - mb);
        }
      va /= n - 1;
      vb /= n - 1;
      cov /= n - 1;
      total +=
        ((2 * ma * mb + c1) * (2 * cov + c2)) /
        ((ma ** 2 + mb ** 2 + c1) * (va + vb + c2));
      count += 1;
    }
  }
  return count === 0 ? 1 : total / count;
}

function toLab(r: number, g: number, b: number): [number, number, number] {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const [lr, lg, lb] = [lin(r), lin(g), lin(b)];
  const x = (0.4124 * lr + 0.3576 * lg + 0.1805 * lb) / 0.95047;
  const y = 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
  const z = (0.0193 * lr + 0.1192 * lg + 0.9505 * lb) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const [fx, fy, fz] = [f(x), f(y), f(z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/** Mean CIELAB ΔE76 between pixels, divided by 100 and capped at 1. */
export function colorDistance(a: Raster, b: Raster): number {
  let total = 0;
  const n = a.width * a.height;
  for (let i = 0; i < n; i += 1) {
    const [l1, a1, b1] = toLab(
      a.data[i * 3],
      a.data[i * 3 + 1],
      a.data[i * 3 + 2],
    );
    const [l2, a2, b2] = toLab(
      b.data[i * 3],
      b.data[i * 3 + 1],
      b.data[i * 3 + 2],
    );
    total += Math.hypot(l1 - l2, a1 - a2, b1 - b2);
  }
  return Math.min(1, total / n / 100);
}

/** 0 = same picture; equal parts structure and color. */
export function visualDistance(a: Raster, b: Raster): number {
  if (a.width !== b.width || a.height !== b.height)
    throw new Error('visualDistance needs rasters of the same size');
  return 0.5 * (1 - Math.max(0, ssim(a, b))) + 0.5 * colorDistance(a, b);
}

/** Sizes the renders are reduced to: the squint test happens at thumbnail scale. */
export const FOLD_SIZE = { width: 160, height: 100 } as const;
export const PAGE_SIZE = { width: 64, height: 320 } as const;

/**
 * Above-the-fold pairs under this distance fail. Calibrated on real renders: the phase-2 clones
 * (Trazo/Norte on one theme, FILO/ÓXIDO on one theme) scored 0.168 and 0.250; the phase-3 set's
 * closest pair scores 0.408. The full-page distance is reported, not gated: at strip size it mostly
 * measures light vs dark page and ranked a phase-3 pair (0.384) below a phase-2 clone (0.431).
 */
export const MIN_VISUAL_DISTANCE = 0.33;
