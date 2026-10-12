import { existsSync, mkdirSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import sharp from 'sharp';
import type { PlaceholderStyle, Theme } from '../types';
import { contrastRatio, toHex, type Rgba } from './color';
import { escapeHtml } from './dom';
import { tokenColor } from './theme';

/**
 * Art-directed placeholders: the theme's palette + its pattern + a motif of the vertical picked from
 * the file name, so heroes and cards of different templates already differ before real photos arrive.
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

type Motif =
  | 'scissors'
  | 'comb'
  | 'razor'
  | 'pole'
  | 'person'
  | 'plate'
  | 'cutlery'
  | 'bowl'
  | 'chili'
  | 'cross'
  | 'heart'
  | 'pill'
  | 'stethoscope'
  | 'flower'
  | 'leaf'
  | 'tulip'
  | 'pot';

const MOTIFS: Record<Motif, string> = {
  scissors:
    '<circle cx="30" cy="74" r="12"/><circle cx="70" cy="74" r="12"/><path d="M38 65 72 8M62 65 28 8"/>',
  comb: '<rect x="12" y="30" width="76" height="18" rx="3"/><path d="M18 48v26M26 48v26M34 48v26M42 48v26M50 48v26M58 48v26M66 48v26M74 48v26M82 48v26"/>',
  razor:
    '<path d="M14 62h44l10-10H24z"/><path d="M58 62c10 0 20 6 28 22"/><path d="M24 52l6-10h30l8 10"/>',
  pole: '<rect x="38" y="6" width="24" height="88" rx="12"/><path d="M38 26 62 10M38 46 62 30M38 66 62 50M38 86 62 70"/>',
  person:
    '<circle cx="50" cy="34" r="17"/><path d="M16 96c0-22 15-34 34-34s34 12 34 34"/>',
  plate: '<circle cx="50" cy="50" r="40"/><circle cx="50" cy="50" r="26"/>',
  cutlery:
    '<path d="M34 8v34c0 6 4 10 8 10v40M26 8v26M42 8v26"/><path d="M66 92V8c-8 6-12 18-12 32 0 8 4 12 12 12"/>',
  bowl: '<path d="M10 50h80c0 22-18 38-40 38S10 72 10 50z"/><path d="M36 38c-4-6 4-10 0-18M52 38c-4-6 4-10 0-18M68 38c-4-6 4-10 0-18"/>',
  chili:
    '<path d="M30 30c-14 24-6 54 26 60 10-14 16-36 6-58-8-8-24-10-32-2z"/><path d="M44 26c0-10 6-16 14-18"/>',
  cross: '<path d="M38 12h24v26h26v24H62v26H38V62H12V38h26z"/>',
  heart:
    '<path d="M50 86 16 52c-10-10-10-26 2-34 10-6 24-4 32 8 8-12 22-14 32-8 12 8 12 24 2 34z"/><path d="M22 50h16l6-12 8 24 6-12h20"/>',
  pill: '<rect x="14" y="34" width="72" height="32" rx="16" transform="rotate(-35 50 50)"/><path d="M40 36 60 64"/>',
  stethoscope:
    '<path d="M26 10v28c0 14 10 24 22 24s22-10 22-24V10"/><path d="M48 62v10c0 10 8 16 18 16s16-6 16-16v-8"/><circle cx="82" cy="58" r="7"/>',
  flower:
    '<circle cx="50" cy="40" r="9"/><circle cx="50" cy="20" r="11"/><circle cx="69" cy="34" r="11"/><circle cx="62" cy="56" r="11"/><circle cx="38" cy="56" r="11"/><circle cx="31" cy="34" r="11"/><path d="M50 67v27"/>',
  leaf: '<path d="M18 82C18 40 44 16 84 16c0 42-26 66-66 66z"/><path d="M18 82 64 36"/>',
  tulip:
    '<path d="M32 18l9 12 9-14 9 14 9-12v22c0 12-8 20-18 20s-18-8-18-20z"/><path d="M50 60v34M50 80c-10-10-22-10-26-8M50 74c8-8 18-8 22-6"/>',
  pot: '<path d="M24 54h52l-8 38H32z"/><path d="M20 46h60v8H20z"/><path d="M50 46c0-16 8-28 22-34M50 46c-2-14-10-24-22-26"/>',
};

/** hero, about and the gallery cycle per vertical; barbería keeps the original set. */
const VERTICAL_MOTIFS: Record<
  string,
  { hero: Motif; about: Motif; cycle: Motif[] }
> = {
  barberia: {
    hero: 'pole',
    about: 'comb',
    cycle: ['scissors', 'razor', 'comb', 'pole'],
  },
  restaurante: {
    hero: 'plate',
    about: 'cutlery',
    cycle: ['bowl', 'plate', 'chili', 'cutlery'],
  },
  clinica: {
    hero: 'stethoscope',
    about: 'cross',
    cycle: ['heart', 'cross', 'pill', 'stethoscope'],
  },
  floreria: {
    hero: 'flower',
    about: 'tulip',
    cycle: ['leaf', 'flower', 'pot', 'tulip'],
  },
};

function motifFor(name: string, vertical: string): Motif {
  const set = VERTICAL_MOTIFS[vertical] ?? VERTICAL_MOTIFS.barberia;
  if (name.startsWith('team')) return 'person';
  if (name.startsWith('hero')) return set.hero;
  if (name.startsWith('about')) return set.about;
  const n = Number(/\d+/.exec(name)?.[0] ?? 0);
  return set.cycle[n % 4];
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
  vertical: string,
): string {
  const p = palette(theme);
  const m = Math.min(width, height);
  const size = m * 0.42;
  const font = Math.round(Math.max(12, m / 48));
  const motif = MOTIFS[motifFor(label, vertical)];
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
  vertical = 'barberia',
): Promise<boolean> {
  if (existsSync(file)) return false;
  mkdirSync(dirname(file), { recursive: true });
  const label = `${basename(file)} · ${width}×${height} · placeholder`;
  await sharp(
    Buffer.from(placeholderSvg(width, height, label, theme, vertical)),
  )
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(file);
  return true;
}
