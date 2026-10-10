import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import {
  colorDistance,
  loadRaster,
  ssim,
  visualDistance,
  type Raster,
} from '../src/lib/visual';

function solid(
  width: number,
  height: number,
  rgb: [number, number, number],
): Raster {
  const data = new Uint8Array(width * height * 3);
  for (let i = 0; i < width * height; i += 1) data.set(rgb, i * 3);
  return { width, height, data };
}

/** Left half `a`, right half `b`. */
function split(
  width: number,
  height: number,
  a: [number, number, number],
  b: [number, number, number],
): Raster {
  const r = solid(width, height, a);
  for (let y = 0; y < height; y += 1)
    for (let x = width / 2; x < width; x += 1)
      r.data.set(b, (y * width + x) * 3);
  return r;
}

describe('visual distance', () => {
  it('is 0 for identical renders', () => {
    const a = split(32, 16, [240, 235, 225], [20, 20, 20]);
    expect(ssim(a, a)).toBeCloseTo(1);
    expect(visualDistance(a, a)).toBeCloseTo(0);
  });

  it('separates a light page from a dark page mostly by color', () => {
    const light = solid(32, 16, [243, 239, 230]);
    const dark = solid(32, 16, [11, 11, 12]);
    expect(colorDistance(light, dark)).toBeGreaterThan(0.9);
    expect(visualDistance(light, dark)).toBeGreaterThan(0.45);
  });

  it('ranks a recolored layout closer than a different layout in the same colors', () => {
    const base = split(32, 16, [240, 235, 225], [45, 91, 255]);
    const recolored = split(32, 16, [240, 235, 225], [31, 91, 61]);
    const flipped = split(32, 16, [45, 91, 255], [240, 235, 225]);
    expect(visualDistance(base, recolored)).toBeLessThan(
      visualDistance(base, flipped),
    );
  });

  it('loads and downscales image files to a fixed raster', async () => {
    const file = resolve(mkdtempSync(resolve(tmpdir(), 'lz-vis-')), 'a.png');
    await sharp({
      create: { width: 400, height: 250, channels: 3, background: '#FF4F1F' },
    })
      .png()
      .toFile(file);
    const r = await loadRaster(file, 16, 10);
    expect(r.data.length).toBe(16 * 10 * 3);
    expect([r.data[0], r.data[1], r.data[2]]).toEqual([255, 79, 31]);
  });
});
