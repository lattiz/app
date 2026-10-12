import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import type { Browser } from 'playwright';
import { open, primeLazyContent } from '../../../template-kit/src/lib/shoot';
import { specTargets } from '../../../template-kit/src/spec/compile';
import { readSpecFile } from '../../../template-kit/src/spec/build';
import { FONT_PAIRS } from '../../../template-kit/src/spec/presets';
import { launchBrowser } from '../lib/browser';
import { bool, type Command } from '../lib/command';
import { EXIT, gate, type ExitCode } from '../lib/errors';
import { KIT, paths, REPO_ROOT } from '../lib/paths';
import { renderPreview } from '../lib/preview';
import { startPreviewServer } from '../lib/preview-server';
import { GIROS, originOf } from '../lib/spec';
import {
  assertTemplate,
  cleanOutput,
  compile,
  readDist,
  tierLabel,
} from '../lib/templates';
import { c, duration, log, setQuiet } from '../lib/ui';

const SHOTS = [
  { file: 'movil-390x844.png', w: 390, h: 844, full: false, mobile: true },
  { file: 'movil-390-completa.png', w: 390, h: 844, full: true, mobile: true },
  { file: 'laptop-1366x768.png', w: 1366, h: 768, full: false, mobile: false },
  {
    file: 'escritorio-1440x900.png',
    w: 1440,
    h: 900,
    full: false,
    mobile: false,
  },
  {
    file: 'escritorio-1440-completa.png',
    w: 1440,
    h: 900,
    full: true,
    mobile: false,
  },
] as const;

interface SectionCopy {
  slot: string;
  variant: string;
  texts: string[];
  /** 1440 px screenshot of just this section (relative to the bundle). */
  shot: string;
}

export interface ReviewBundle {
  id: string;
  tier: string;
  dir: string;
  spec: string | null;
  shots: Record<string, string>;
  choices: {
    theme: string;
    palette: string | null;
    scheme: string;
    accent: string;
    fontPair: string;
    shape: Record<string, string>;
    density: string;
    motion: string;
    sections: string[];
  };
  copy: SectionCopy[];
  twin: { other: string; summary: string[] } | null;
  ms: number;
}

/** Runs in the page: visible copy per section. */
function sectionCopy(): { slot: string; variant: string; texts: string[] }[] {
  return Array.from(document.querySelectorAll('[data-lz-slot]')).map((el) => {
    const seen = new Set<string>();
    const texts: string[] = [];
    for (const node of Array.from(
      el.querySelectorAll(
        'h1, h2, h3, h4, p, li, a, button, summary, dt, dd, figcaption, blockquote, span',
      ),
    )) {
      if (
        node.querySelector(
          'h1, h2, h3, h4, p, li, a, button, summary, dt, dd, figcaption, blockquote',
        )
      )
        continue;
      const t = (node.textContent ?? '').replace(/\s+/g, ' ').trim();
      if (!t || seen.has(t)) continue;
      seen.add(t);
      texts.push(`${node.tagName.toLowerCase()}: ${t}`);
    }
    return {
      slot: el.getAttribute('data-lz-slot') ?? '?',
      variant: el.getAttribute('data-lz-variant') ?? '?',
      texts: texts.slice(0, 60),
    };
  });
}

function theme(name: string) {
  return JSON.parse(
    readFileSync(resolve(KIT, 'themes', `${name}.json`), 'utf8'),
  ) as {
    fontPair: string;
    colors: Record<string, string>;
    shape: Record<string, string>;
    density: string;
  };
}

function choicesOf(id: string): ReviewBundle['choices'] {
  const dist = readDist(id);
  const t = theme(dist.manifest.theme);
  const giro = GIROS[dist.manifest.vertical];
  const palette = giro
    ? (Object.entries(giro.palettes).find(
        ([, p]) =>
          p.colors.accent.toLowerCase() === t.colors.accent?.toLowerCase(),
      )?.[0] ?? null)
    : null;
  const bg = t.colors.bg ?? '';
  const dark = /^#([0-3])/i.test(bg);
  return {
    theme: dist.manifest.theme,
    palette,
    scheme: dark ? 'oscuro' : 'claro',
    accent: t.colors.accent,
    fontPair: `${t.fontPair} (${FONT_PAIRS[t.fontPair]?.label ?? 'propia'})`,
    shape: t.shape,
    density: t.density,
    motion:
      dist.meta.tier === 'pro'
        ? (dist.meta.motion?.preset ?? 'none')
        : 'sin Motion (Básico)',
    sections: dist.meta.slots.map((s) => `${s.slot}/${s.variant}`),
  };
}

function twinSummary(id: string, other: string): string[] {
  const a = readDist(id);
  const b = readDist(other);
  const [pro, basic] = a.meta.tier === 'pro' ? [a, b] : [b, a];
  const proIds = pro === a ? id : other;
  const basicIds = pro === a ? other : id;
  const ps = pro.meta.slots.map((s) => `${s.slot}/${s.variant}`);
  const bs = basic.meta.slots.map((s) => `${s.slot}/${s.variant}`);
  const onlyPro = pro.meta.slots
    .filter((s) => !basic.meta.slots.some((x) => x.slot === s.slot))
    .map((s) => `${s.slot}/${s.variant}`);
  const changed = pro.meta.slots
    .filter((s) =>
      basic.meta.slots.some(
        (x) => x.slot === s.slot && x.variant !== s.variant,
      ),
    )
    .map(
      (s) =>
        `${s.slot}: Pro ${s.variant} · Básico ${basic.meta.slots.find((x) => x.slot === s.slot)?.variant}`,
    );
  const tp = theme(pro.manifest.theme);
  const tb = theme(basic.manifest.theme);
  return [
    `Pro ${proIds}: ${ps.length} bloques (${pro.meta.slots.filter((s) => s.counted).length} contados); Básico ${basicIds}: ${bs.length} (${basic.meta.slots.filter((s) => s.counted).length} contados).`,
    `Solo en Pro: ${onlyPro.join(', ') || 'nada'}.`,
    `Misma sección, otra variante: ${changed.join('; ') || 'ninguna'}.`,
    `Paleta: Pro acento ${tp.colors.accent} sobre ${tp.colors.bg} · Básico acento ${tb.colors.accent} sobre ${tb.colors.bg}.`,
    `Tipografía: Pro ${tp.fontPair} · Básico ${tb.fontPair}.`,
    `Forma: Pro radio ${tp.shape.radiusCard}/${tp.shape.radiusPill}, borde ${tp.shape.border}, sombra ${tp.shape.shadow} · Básico radio ${tb.shape.radiusCard}/${tb.shape.radiusPill}, borde ${tb.shape.border}, sombra ${tb.shape.shadow}.`,
    `Motion: Pro ${pro.meta.motion?.preset ?? 'none'} · Básico estático.`,
  ];
}

export async function runReview(id: string): Promise<ReviewBundle> {
  const started = Date.now();
  const built = await compile(id);
  if (built.code !== 0)
    throw gate(
      `kit:compile falló para ${id}.`,
      cleanOutput(built.output).split('\n').slice(-5).join(' · '),
    );
  const dist = readDist(id);
  const dir = resolve(paths.work, 'review', id);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(resolve(dir, 'secciones'), { recursive: true });

  const server = await startPreviewServer({
    id,
    port: 0,
    render: (params) =>
      renderPreview(id, {
        origin: 'http://localhost',
        motion: params.get('motion') !== 'off',
      }).html,
  });
  let browser: Browser | null = null;
  const shots: Record<string, string> = {};
  let copy: SectionCopy[] = [];
  try {
    browser = await launchBrowser();
    for (const s of SHOTS) {
      // Reduced motion: every Motion target in its final state, as a still review needs.
      const context = await browser.newContext({
        viewport: { width: s.w, height: s.h },
        isMobile: s.mobile,
        hasTouch: s.mobile,
        reducedMotion: 'reduce',
      });
      const page = await context.newPage();
      await open(page, `${server.url}/site`);
      await primeLazyContent(page);
      if (!s.full) await page.evaluate(() => window.scrollTo(0, 0));
      const file = resolve(dir, s.file);
      await page.screenshot({ path: file, fullPage: s.full });
      shots[s.file.replace(/\.png$/, '')] = relative(REPO_ROOT, file);
      if (s.file === 'escritorio-1440-completa.png') {
        await page.evaluate('window.__name = (fn) => fn');
        const texts = await page.evaluate(sectionCopy);
        // A sticky header would cover the top of every section shot.
        await page.addStyleTag({
          content:
            '[data-lz-slot="navbar"]{position:static!important}[data-lz-slot="floating-whatsapp"]{display:none!important}',
        });
        const handles = await page.$$('[data-lz-slot]');
        copy = [];
        for (const [i, t] of texts.entries()) {
          const shot = resolve(
            dir,
            'secciones',
            `${String(i + 1).padStart(2, '0')}-${t.slot}.png`,
          );
          const box = await handles[i]?.boundingBox();
          // floating-whatsapp is fixed and tiny; the page shots already show it.
          if (box && box.height > 40)
            await handles[i].screenshot({ path: shot });
          copy.push({
            ...t,
            shot: box && box.height > 40 ? relative(REPO_ROOT, shot) : '',
          });
        }
      }
      await context.close();
    }
  } finally {
    await browser?.close();
    await server.close();
  }

  const origin = await originOf(id);
  let twin: ReviewBundle['twin'] = null;
  if (origin.spec) {
    const { spec } = readSpecFile(resolve(KIT, origin.spec));
    const other = spec
      ? specTargets(spec).find((t) => t.id !== id)?.id
      : undefined;
    if (other) {
      const otherBuilt = await compile(other);
      if (otherBuilt.code === 0)
        twin = { other, summary: twinSummary(id, other) };
    }
  }
  const bundle: ReviewBundle = {
    id,
    tier: dist.meta.tier,
    dir: relative(REPO_ROOT, dir),
    spec: origin.spec ?? null,
    shots,
    choices: choicesOf(id),
    copy,
    twin,
    ms: Date.now() - started,
  };
  writeFileSync(
    resolve(dir, 'review.json'),
    `${JSON.stringify(bundle, null, 2)}\n`,
  );
  writeFileSync(resolve(dir, 'review.md'), markdown(bundle));
  return bundle;
}

function markdown(b: ReviewBundle): string {
  const lines = [
    `# Revisión de ${b.id} (${tierLabel(b.tier)})`,
    '',
    b.spec
      ? `Spec: \`packages/template-kit/${b.spec}\``
      : 'Sin spec (plantilla a mano o clonada).',
    '',
    '## Capturas',
    ...Object.entries(b.shots).map(([k, v]) => `- ${k}: \`${v}\``),
    '',
    '## Elecciones',
    `- Tema \`${b.choices.theme}\`${b.choices.palette ? ` · paleta \`${b.choices.palette}\`` : ''} · ${b.choices.scheme} · acento ${b.choices.accent}`,
    `- Tipografía ${b.choices.fontPair}`,
    `- Forma: radio ${b.choices.shape.radiusCard}/${b.choices.shape.radiusPill}, borde ${b.choices.shape.border}, sombra ${b.choices.shape.shadow} · densidad ${b.choices.density}`,
    `- Motion: ${b.choices.motion}`,
    `- Secciones: ${b.choices.sections.join(' → ')}`,
    '',
  ];
  if (b.twin)
    lines.push(
      `## Gemela: ${b.twin.other}`,
      ...b.twin.summary.map((s) => `- ${s}`),
      '',
    );
  lines.push('## Copy por sección');
  for (const s of b.copy) {
    lines.push(
      '',
      `### ${s.slot}/${s.variant}${s.shot ? ` — \`${s.shot}\`` : ''}`,
    );
    for (const t of s.texts) lines.push(`- ${t}`);
  }
  return `${lines.join('\n')}\n`;
}

export const review: Command = {
  name: 'review',
  summary:
    'Paquete de revisión visual: capturas (390, 1366, 1440), copy por sección, elecciones y gemela',
  usage: 'review <id> [--json]',
  help: [
    'Compila y renderiza con el pipeline de producción (reduced motion: todo visible) y escribe en',
    '.lattiz/review/<id>/: movil-390x844.png y laptop-1366x768.png (lo que se ve sin scroll),',
    'escritorio-1440x900.png, las páginas completas a 390 y 1440, una captura por sección',
    '(secciones/NN-<slot>.png), review.md y review.json (paleta, tipografía, forma, variantes, copy',
    'visible por sección y, si sale de un spec gemelo, en qué difieren Básico y Pro).',
    'Un navegador, un contexto a la vez: corre las revisiones una tras otra, nunca en paralelo.',
    '  --json   imprime review.json',
  ],
  options: { json: { type: 'boolean' } },
  async run(ctx): Promise<ExitCode> {
    const id = assertTemplate(ctx.positionals[0]);
    const json = bool(ctx.flags, 'json');
    setQuiet(json);
    log.title(`lattiz review ${id}`);
    const bundle = await runReview(id);
    if (json) {
      console.log(JSON.stringify(bundle, null, 2));
      return EXIT.OK;
    }
    log.ok(`${bundle.dir}/ ${c.gray(`(${duration(bundle.ms)})`)}`);
    for (const [k, v] of Object.entries(bundle.shots))
      log.plain(`  ${k.padEnd(26)} ${v}`);
    log.plain(
      `  ${'secciones'.padEnd(26)} ${bundle.dir}/secciones/ (${bundle.copy.filter((s) => s.shot).length})`,
    );
    log.plain(`  ${'resumen'.padEnd(26)} ${bundle.dir}/review.md`);
    if (bundle.twin) {
      log.plain(`\n${c.bold(`Gemela ${bundle.twin.other}:`)}`);
      for (const s of bundle.twin.summary) log.plain(`  · ${s}`);
    }
    return EXIT.OK;
  },
};
