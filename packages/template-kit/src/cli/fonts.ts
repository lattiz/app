/**
 * Font pair audit: for every pair (legacy and extended) fetches the Google Fonts css2 a modern
 * browser gets, and reports families, files and KB a Spanish page downloads (latin subset), whether
 * the latin subset covers the Spanish glyphs, variable or static faces, and (extended) the license
 * and latin-ext subset from google/fonts METADATA.pb. Network via curl (honors the proxy); cached in
 * .lattiz/cache/fonts/.
 *
 *   pnpm --filter @lattiz/template-kit kit:fonts [--json] [--only <pair>]
 *   pnpm --filter @lattiz/template-kit kit:fonts --cls <pair>[,<pair>…]   (font swap CLS/LCP, fonts held back 1.2 s)
 *
 * Exit 1 when an extended pair breaks a rule (> 2 families, > 4 files, glyphs or license missing).
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { EXTENDED_FONT_PAIRS } from '../../font-pairs';
import { parseArgs, runCli } from '../lib/args';
import { fontCls } from '../lib/font-cls';
import { REPO_ROOT } from '../lib/paths';
import { FONT_PAIRS, type FontPairPreset } from '../spec/presets';

const CACHE = resolve(REPO_ROOT, '.lattiz/cache/fonts');
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
/** ñ Ñ á é í ó ú ü Á É Í Ó Ú Ü ¿ ¡ “ ” — … */
const SPANISH = [
  0xf1, 0xd1, 0xe1, 0xe9, 0xed, 0xf3, 0xfa, 0xfc, 0xc1, 0xc9, 0xcd, 0xd3, 0xda,
  0xdc, 0xbf, 0xa1, 0x201c, 0x201d, 0x2014, 0x2026,
];

function fetchText(url: string): string | null {
  mkdirSync(CACHE, { recursive: true });
  const file = resolve(
    CACHE,
    `${createHash('sha256').update(url).digest('hex').slice(0, 16)}.txt`,
  );
  if (existsSync(file)) return readFileSync(file, 'utf8');
  const r = spawnSync('curl', ['-sS', '-f', '-A', UA, url], {
    encoding: 'utf8',
    maxBuffer: 1 << 24,
  });
  if (r.status !== 0) return null;
  writeFileSync(file, r.stdout);
  return r.stdout;
}

function fetchBytes(url: string): number | null {
  mkdirSync(CACHE, { recursive: true });
  const file = resolve(
    CACHE,
    `${createHash('sha256').update(url).digest('hex').slice(0, 16)}.woff2`,
  );
  if (!existsSync(file)) {
    const r = spawnSync('curl', ['-sS', '-f', '-o', file, url]);
    if (r.status !== 0) return null;
  }
  return statSync(file).size;
}

interface Face {
  family: string;
  style: string;
  weight: string;
  subset: string;
  url: string;
  ranges: [number, number][];
}

function parseCss(css: string): Face[] {
  const faces: Face[] = [];
  const re = /\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g;
  for (const m of css.matchAll(re)) {
    const body = m[2];
    const get = (k: string) =>
      new RegExp(`${k}:\\s*([^;]+);`).exec(body)?.[1].trim() ?? '';
    const url = /url\(([^)]+)\)/.exec(body)?.[1] ?? '';
    const ranges = get('unicode-range')
      .split(',')
      .map((r) => r.trim().replace(/^U\+/i, ''))
      .map((r): [number, number] => {
        const [a, b] = r.split('-');
        return [parseInt(a, 16), parseInt(b ?? a, 16)];
      });
    faces.push({
      family: get('font-family').replace(/['"]/g, ''),
      style: get('font-style'),
      weight: get('font-weight'),
      subset: m[1],
      url,
      ranges,
    });
  }
  return faces;
}

function license(
  family: string,
): { license: string; latinExt: boolean } | null {
  const slug = family.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [dir, lic] of [
    ['ofl', 'OFL-1.1'],
    ['apache', 'Apache-2.0'],
    ['ufl', 'UFL-1.0'],
  ] as const) {
    const meta = fetchText(
      `https://raw.githubusercontent.com/google/fonts/main/${dir}/${slug}/METADATA.pb`,
    );
    if (meta)
      return { license: lic, latinExt: /subsets:\s*"latin-ext"/.test(meta) };
  }
  return null;
}

export interface PairAudit {
  id: string;
  extended: boolean;
  families: string[];
  files: number;
  kb: number;
  kbLatinExt: number;
  variable: string[];
  spanish: boolean;
  licenses: Record<string, string>;
  latinExt: Record<string, boolean>;
  problems: string[];
}

export function auditPair(
  id: string,
  pair: FontPairPreset,
  extended: boolean,
): PairAudit {
  const css = fetchText(
    `https://fonts.googleapis.com/css2?${pair.googleFonts}&display=swap`,
  );
  const problems: string[] = [];
  if (!css)
    return {
      id,
      extended,
      families: [],
      files: 0,
      kb: 0,
      kbLatinExt: 0,
      variable: [],
      spanish: false,
      licenses: {},
      latinExt: {},
      problems: ['Google Fonts no respondió (¿query inválida?)'],
    };
  const faces = parseCss(css);
  const latin = faces.filter((f) => f.subset === 'latin');
  const families = [...new Set(faces.map((f) => f.family))];
  const kb = latin.reduce((sum, f) => sum + (fetchBytes(f.url) ?? 0), 0) / 1024;
  const kbLatinExt =
    faces
      .filter((f) => f.subset === 'latin-ext')
      .reduce((sum, f) => sum + (fetchBytes(f.url) ?? 0), 0) / 1024;
  const spanish = families.every((fam) => {
    const ranges = latin
      .filter((f) => f.family === fam)
      .flatMap((f) => f.ranges);
    return SPANISH.every((cp) => ranges.some(([a, b]) => cp >= a && cp <= b));
  });
  const variable = [
    ...new Set(
      latin.filter((f) => /\d+ \d+/.test(f.weight)).map((f) => f.family),
    ),
  ];
  const licenses: Record<string, string> = {};
  const latinExt: Record<string, boolean> = {};
  if (extended)
    for (const fam of families) {
      const l = license(fam);
      licenses[fam] = l?.license ?? 'desconocida';
      latinExt[fam] = l?.latinExt ?? false;
      if (!l) problems.push(`${fam}: no encontré su licencia en google/fonts`);
      else if (!l.latinExt) problems.push(`${fam}: sin subconjunto latin-ext`);
      const declared = (pair as { licenses?: Record<string, string> })
        .licenses?.[fam];
      if (l && declared && declared !== l.license)
        problems.push(
          `${fam}: licencia declarada ${declared}, google/fonts dice ${l.license}`,
        );
    }
  if (extended && families.length > 2)
    problems.push(`${families.length} familias (máx. 2)`);
  if (extended && latin.length > 4)
    problems.push(`${latin.length} archivos de fuente (máx. 4)`);
  if (!spanish)
    problems.push('el subconjunto latin no cubre todos los glifos del español');
  if (!/display=swap/.test(`${pair.googleFonts}&display=swap`))
    problems.push('sin display=swap');
  return {
    id,
    extended,
    families,
    files: latin.length,
    kb: Math.round(kb * 10) / 10,
    kbLatinExt: Math.round(kbLatinExt * 10) / 10,
    variable,
    spanish,
    licenses,
    latinExt,
    problems,
  };
}

async function main(): Promise<void> {
  const { flags } = parseArgs(process.argv.slice(2).filter((a) => a !== '--'));
  const cls = flags.get('cls');
  if (cls && cls !== 'true') {
    const rows = await fontCls(cls.split(',').map((x) => x.trim()));
    if (flags.has('json')) console.log(JSON.stringify(rows, null, 2));
    else
      for (const r of rows)
        console.log(
          `${r.pair.padEnd(40)} ${String(r.width).padEnd(6)} CLS ${r.cls.toFixed(3)} (sin fallback ${r.clsNoFallback.toFixed(3)}) · LCP ${r.lcpMs} ms`,
        );
    return;
  }
  const only = flags.get('only');
  const pairs: [string, FontPairPreset, boolean][] = [
    ...Object.entries(FONT_PAIRS).map(
      ([id, p]): [string, FontPairPreset, boolean] => [id, p, false],
    ),
    ...Object.entries(EXTENDED_FONT_PAIRS).map(
      ([id, p]): [string, FontPairPreset, boolean] => [id, p, true],
    ),
  ].filter(([id]) => !only || id === only);
  const audits = pairs.map(([id, p, ext]) => auditPair(id, p, ext));
  if (flags.has('json')) console.log(JSON.stringify(audits, null, 2));
  else {
    console.log(
      'par'.padEnd(42) +
        'familias  archivos  KB (latin)  variable  español  licencias',
    );
    for (const a of audits)
      console.log(
        `${a.extended ? '+' : ' '} ${a.id.padEnd(40)}${String(a.families.length).padEnd(10)}${String(a.files).padEnd(10)}${String(a.kb).padEnd(12)}${String(a.variable.length).padEnd(10)}${a.spanish ? 'sí' : 'NO'}       ${Object.values(a.licenses).join(', ')}${a.problems.length ? `  ✗ ${a.problems.join('; ')}` : ''}`,
      );
  }
  if (audits.some((a) => a.extended && a.problems.length > 0)) process.exit(1);
}

if (process.argv[1]?.endsWith('fonts.ts')) runCli(main);
