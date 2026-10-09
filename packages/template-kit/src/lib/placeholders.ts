import { existsSync, mkdirSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import sharp from 'sharp';
import { escapeHtml } from './dom';

/** Neutral mid-gray so it reads on dark and light themes; the label sits in a corner, clear of overlaid copy. */
function placeholderSvg(width: number, height: number, label: string): string {
  const font = Math.round(Math.max(12, Math.min(width, height) / 48));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8F8B84"/><stop offset="1" stop-color="#5E5B56"/></linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect x="${font}" y="${font}" width="${width - font * 2}" height="${height - font * 2}" fill="none" stroke="#FFFFFF" stroke-opacity=".22" stroke-width="2"/>
  <text x="${width - font * 2}" y="${height - font * 2}" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="${font}" fill="#FFFFFF" fill-opacity=".45">${escapeHtml(label)}</text>
</svg>`;
}

/** Writes a JPEG placeholder unless a real image already exists at `file`; returns true if generated. */
export async function ensurePlaceholder(
  file: string,
  width: number,
  height: number,
): Promise<boolean> {
  if (existsSync(file)) return false;
  mkdirSync(dirname(file), { recursive: true });
  const label = `${basename(file)} · ${width}×${height}`;
  await sharp(Buffer.from(placeholderSvg(width, height, label)))
    .jpeg({ quality: 78, mozjpeg: true })
    .toFile(file);
  return true;
}
