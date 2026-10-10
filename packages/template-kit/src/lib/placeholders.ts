import { existsSync, mkdirSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import sharp from 'sharp';
import type { PlaceholderStyle, Theme } from '../types';
import { contrastRatio, toHex, type Rgba } from './color';
import { escapeHtml } from './dom';
import { tokenColor } from './theme';

/**
 * Art-directed placeholders: the theme's palette + its pattern + a barbería motif picked from the
 * file name, so heroes and cards of different templates already differ before real photos arrive.
 */

interface Palette {
  bg: string;
  mid: string;
  accent: string;
  ink: string;
  /** Motif stroke: ink on light palettes, the theme's text color on dark ones. */
  stroke: string;
}

const WHITE: Rgba = { r: 255, g: 255, b: 255, a: 1 };

type Motif = 'scissors' | 'comb' | 'razor' | 'pole' | 'person';

const MOTIFS: Record<Motif, string> = {
  scissors:
    '<circle cx="30" cy="74" r="12"/><circle cx="70" cy="74" r="12"/><path d="M38 65 72 8M62 65 28 8"/>',
  comb: '<rect x="12" y="30" width="76" height="18" rx="3"/><path d="M18 48v26M26 48v26M34 48v26M42 48v26M50 48v26M58 48v26M66 48v26M74 48v26M82 48v26"/>',
  razor:
    '<path d="M14 62h44l10-10H24z"/><path d="M58 62c10 0 20 6 28 22"/><path d="M24 52l6-10h30l8 10"/>',
  pole: '<rect x="38" y="6" width="24" height="88" rx="12"/><path d="M38 26 62 10M38 46 62 30M38 66 62 50M38 86 62 70"/>',
  person:
    '<circle cx="50" cy="34" r="17"/><path d="M16 96c0-22 15-34 34-34s34 12 34 34"/>',
};

function motifFor(name: string): Motif {
  if (name.startsWith('team')) return 'person';
  if (name.startsWith('hero')) return 'pole';
  if (name.startsWith('about')) return 'comb';
  const n = Number(/\d+/.exec(name)?.[0] ?? 0);
  return (['scissors', 'razor', 'comb', 'pole'] as const)[n % 4];
}

function palette(theme: Theme): Palette {
  const hex = (token: Parameters<typeof tokenColor>[1], fallback: string) => {
    const c = tokenColor(theme, token);
    return c ? toHex(c) : fallback;
  };
  const surface = tokenColor(theme, 'surface-2');
  const dark = surface ? contrastRatio(surface, WHITE) > 4.5 : false;
  return {
    bg: hex('surface-2', '#888888'),
    mid: hex('bg', '#666666'),
    accent: hex('accent', '#999999'),
    ink: hex('ink', '#000000'),
    stroke: dark ? hex('text', '#FFFFFF') : hex('ink', '#000000'),
  };
}

function patternLayer(
  style: PlaceholderStyle,
  w: number,
  h: number,
  p: Palette,
): string {
  const m = Math.min(w, h);
  switch (style) {
    case 'grain':
      return `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.bg}"/><stop offset="1" stop-color="${p.ink}"/></linearGradient><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.18 0"/></filter></defs>
<rect width="100%" height="100%" fill="url(#g)"/><rect width="100%" height="100%" filter="url(#n)"/>
<path d="M${w * 0.62} ${h} L${w * 0.86} 0 L${w * 0.94} 0 L${w * 0.7} ${h}Z" fill="${p.accent}" opacity=".85"/>`;
    case 'rules': {
      const step = Math.max(14, Math.round(m / 40));
      return `<defs><pattern id="r" width="${step}" height="${step}" patternUnits="userSpaceOnUse"><path d="M0 ${step - 0.5}H${step}" stroke="${p.ink}" stroke-opacity=".14"/></pattern></defs>
<rect width="100%" height="100%" fill="${p.bg}"/><rect width="100%" height="100%" fill="url(#r)"/>
<circle cx="${w * 0.72}" cy="${h * 0.38}" r="${m * 0.34}" fill="none" stroke="${p.accent}" stroke-width="${m / 160}"/>
<circle cx="${w * 0.72}" cy="${h * 0.38}" r="${m * 0.24}" fill="${p.accent}" opacity=".16"/>`;
    }
    case 'stripes': {
      const s = Math.round(m / 14);
      return `<defs><pattern id="s" width="${s * 2}" height="${s * 2}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="${s}" height="${s * 2}" fill="${p.ink}"/></pattern></defs>
<rect width="100%" height="100%" fill="${p.accent}"/>
<rect x="${w * 0.08}" y="${h * 0.1}" width="${w * 0.42}" height="${h * 0.8}" fill="url(#s)"/>
<rect x="${w * 0.56}" y="${h * 0.56}" width="${w * 0.36}" height="${h * 0.34}" fill="${p.ink}"/>`;
    }
    case 'blobs':
      return `<rect width="100%" height="100%" fill="${p.bg}"/>
<circle cx="${w * 0.22}" cy="${h * 0.78}" r="${m * 0.42}" fill="${p.accent}" opacity=".9"/>
<circle cx="${w * 0.84}" cy="${h * 0.18}" r="${m * 0.3}" fill="${p.mid}"/>
<circle cx="${w * 0.7}" cy="${h * 0.84}" r="${m * 0.16}" fill="${p.ink}" opacity=".12"/>`;
    case 'arches': {
      const cx = w * 0.5;
      const arcs = [0.46, 0.36, 0.26, 0.16]
        .map((f, i) => {
          const r = m * f;
          return `<path d="M${cx - r} ${h} V${h * 0.62} A${r} ${r} 0 0 1 ${cx + r} ${h * 0.62} V${h}" fill="${i % 2 ? p.mid : p.accent}" opacity="${i % 2 ? 1 : 0.85}"/>`;
        })
        .join('');
      return `<rect width="100%" height="100%" fill="${p.bg}"/>${arcs}`;
    }
    case 'dots': {
      const step = Math.max(16, Math.round(m / 28));
      return `<defs><pattern id="d" width="${step}" height="${step}" patternUnits="userSpaceOnUse"><circle cx="${step / 2}" cy="${step / 2}" r="${step / 7}" fill="${p.ink}" fill-opacity=".22"/></pattern></defs>
<rect width="100%" height="100%" fill="${p.bg}"/><rect width="100%" height="100%" fill="url(#d)"/>
<rect x="${w * 0.52}" y="${h * 0.12}" width="${w * 0.38}" height="${h * 0.76}" rx="${m * 0.06}" fill="${p.accent}"/>`;
    }
  }
}

function placeholderSvg(
  width: number,
  height: number,
  label: string,
  theme: Theme,
): string {
  const p = palette(theme);
  const m = Math.min(width, height);
  const size = m * 0.42;
  const font = Math.round(Math.max(12, m / 48));
  const motif = MOTIFS[motifFor(label)];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${patternLayer(theme.placeholder, width, height, p)}
<g transform="translate(${width * 0.28 - size / 2} ${height * 0.5 - size / 2}) scale(${size / 100})" fill="none" stroke="${p.stroke}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity=".78">${motif}</g>
<rect x="${font}" y="${height - font * 3.2}" width="${label.length * font * 0.6 + font}" height="${font * 2}" fill="${p.ink}" opacity=".55"/>
<text x="${font * 1.5}" y="${height - font * 1.75}" font-family="Helvetica, Arial, sans-serif" font-size="${font}" fill="#FFFFFF">${escapeHtml(label)}</text>
</svg>`;
}

/** Writes a JPEG placeholder unless a real image already exists at `file`; returns true if generated. */
export async function ensurePlaceholder(
  file: string,
  width: number,
  height: number,
  theme: Theme,
): Promise<boolean> {
  if (existsSync(file)) return false;
  mkdirSync(dirname(file), { recursive: true });
  const label = `${basename(file)} · ${width}×${height} · placeholder`;
  await sharp(Buffer.from(placeholderSvg(width, height, label, theme)))
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(file);
  return true;
}
