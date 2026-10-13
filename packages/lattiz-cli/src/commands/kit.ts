import { relative } from 'node:path';
import { kitGallery } from '../../../template-kit/src/lib/gallery';
import {
  kitCapacity,
  type Catalog,
} from '../../../template-kit/src/spec/capacity';
import { browserPath } from '../lib/browser';
import { bool, type Command, type Context, str } from '../lib/command';
import { EXIT, type ExitCode, usage } from '../lib/errors';
import { REPO_ROOT } from '../lib/paths';
import { kitProbe } from '../lib/probe';
import { GIROS } from '../lib/spec';
import { c, log, setQuiet, table } from '../lib/ui';

async function runCapacity(ctx: Context): Promise<ExitCode> {
  const catalog = (str(ctx.flags, 'catalog') ?? 'legacy') as Catalog;
  if (catalog !== 'legacy' && catalog !== 'extended')
    throw usage('--catalog acepta legacy o extended.');
  const giro = str(ctx.flags, 'giro');
  if (giro && !GIROS[giro])
    throw usage(
      `Giro desconocido: "${giro}".`,
      `Giros: ${Object.keys(GIROS).join(', ')}`,
    );
  const rows = await kitCapacity(catalog, giro ? [giro] : undefined);
  if (bool(ctx.flags, 'json')) {
    console.log(JSON.stringify(rows, null, 2));
    return EXIT.OK;
  }
  log.title(`lattiz kit capacity · catálogo ${catalog}`);
  console.log(
    table(
      [
        'Giro',
        'Plantillas',
        'Paletas libres',
        'Pares libres',
        'Portadas Pro libres',
        'Tonos libres',
        'Caben: pares',
        '+Pro',
        '+Básico',
        'Total',
      ],
      rows.map((r) => [
        c.bold(r.giro),
        `${r.templates.total} (${r.templates.pro} Pro / ${r.templates.basico} Básico)`,
        `${r.pools.palettesFree}/${r.pools.palettes}`,
        `${r.pools.fontPairsFree}/${r.pools.fontPairs}`,
        `${r.pools.heroFreePro}/${r.pools.heroVariants}`,
        String(r.hueSlots),
        String(r.headroom.twins.added / 2),
        String(r.headroom.pro.added),
        String(r.headroom.basico.added),
        c.bold(String(r.headroom.total.added)),
      ]),
    ),
  );
  log.plain(
    c.gray(
      '\nCaben = plantillas que el compilador todavía acepta en el giro (pares, solo Pro, solo Básico; Total = pares,\n' +
        'luego Básicos, luego Pros). Tonos libres = acentos de color que aún caben a ≥ 30°; los acentos casi grises no cuentan.',
    ),
  );
  log.plain(`\n${c.bold('Qué lo limita')} (Total)`);
  for (const r of rows)
    log.plain(
      `  ${r.giro.padEnd(12)} ${c.gray(r.headroom.total.stop ?? 'tope de la simulación')}`,
    );
  return EXIT.OK;
}

async function runGallery(ctx: Context): Promise<ExitCode> {
  const list = (k: string) =>
    str(ctx.flags, k)
      ?.split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  if (!browserPath() && !process.env.LATTIZ_CHROMIUM_PATH)
    log.warn(
      'No veo el Chromium de Playwright; si falla, define LATTIZ_CHROMIUM_PATH (pnpm lattiz doctor).',
    );
  log.title('lattiz kit gallery');
  const result = await kitGallery({
    slots: list('slot'),
    extendedOnly: bool(ctx.flags, 'extended'),
    palettes: bool(ctx.flags, 'palettes'),
    fonts: bool(ctx.flags, 'fonts'),
    tokens: bool(ctx.flags, 'tokens'),
    themes: list('themes'),
    noImage: bool(ctx.flags, 'sin-imagen'),
    log: (line) => log.plain(line),
  });
  if (bool(ctx.flags, 'json')) {
    console.log(
      JSON.stringify(
        {
          index: relative(REPO_ROOT, result.index),
          pages: result.pages.map((p) => relative(REPO_ROOT, p)),
          shots: result.shots,
          ms: result.ms,
        },
        null,
        2,
      ),
    );
    return EXIT.OK;
  }
  log.ok(
    `${relative(REPO_ROOT, result.index)} ${c.gray(`(${result.shots} capturas, ${(result.ms / 1000).toFixed(1)} s)`)}`,
  );
  log.hint(
    'Ábrela y critica cada captura con docs/template-kit-design-principles.md (pre-vuelo y anti-genérico).',
  );
  return EXIT.OK;
}

async function runProbe(ctx: Context): Promise<ExitCode> {
  const list = (k: string) =>
    str(ctx.flags, k)
      ?.split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  const modes = list('modes') as ('demo' | 'largo' | 'corto')[] | undefined;
  log.title('lattiz kit probe');
  const { cases, report, ms } = await kitProbe({
    variants: [...(list('variant') ?? []), ...ctx.positionals.slice(1)],
    themes: list('themes'),
    modes,
    log: (line) => log.plain(line),
  });
  const failed = cases.filter((c) => c.status === 'FAIL');
  if (bool(ctx.flags, 'json')) {
    console.log(
      JSON.stringify({ report: relative(REPO_ROOT, report), cases }, null, 2),
    );
    return failed.length ? EXIT.GATE : EXIT.OK;
  }
  for (const f of failed) {
    log.plain(
      `\n${c.bold(`${f.slot}/${f.variant}`)} · ${f.tier} · ${f.theme} · ${f.mode}`,
    );
    for (const i of f.issues.slice(0, 12))
      log.plain(`  ${i.status} ${i.rule} [${i.viewport}] ${i.detail}`);
  }
  log.plain('');
  const summary = `${cases.length - failed.length}/${cases.length} casos sin FAIL · ${relative(REPO_ROOT, report)} (${(ms / 1000).toFixed(1)} s)`;
  if (failed.length) log.fail(summary);
  else log.ok(summary);
  return failed.length ? EXIT.GATE : EXIT.OK;
}

export const kit: Command = {
  name: 'kit',
  summary:
    'El kit por dentro: capacidad por giro y galería visual (secciones, paletas, tipografías)',
  usage:
    'kit capacity|gallery|probe [--giro <g>] [--catalog legacy|extended] [--slot s] [--palettes] [--fonts] [--json]',
  help: [
    'kit capacity            por giro: plantillas, paletas, pares tipográficos y portadas Pro libres, tonos',
    '                        de acento que aún caben y cuántas plantillas más acepta el compilador (simula',
    '                        specs una tras otra hasta que una regla de unicidad lo detiene). Solo lectura.',
    '  --giro <giro>         un solo giro',
    '  --catalog <c>         legacy (por defecto: lo que ve un spec sin brand.catalog) o extended',
    '  --json                salida estable',
    'kit gallery             .lattiz/gallery/: cada variante con el CSS real del kit en un tema claro y uno',
    '                        oscuro, con copy demo, corto (3 elementos) y largo (8, al límite), a 390 y 1440;',
    '                        paletas con contraste AA; pares tipográficos con glifos del español. Un solo',
    '                        navegador, en serie. Sin flags: todo.',
    '  --slot <s[,s]>        solo esas secciones',
    '  --palettes, --fonts   solo esos especímenes; --tokens: estilos opt-in antes/después',
    '  --themes <a,b>        temas de themes/ (por defecto norte-atelier,oxido)',
    '  --sin-imagen          agrega un modo con imágenes faltantes (respaldo sin foto)',
    '  --extended            solo las variantes del catálogo extended (las nuevas)',
    'kit probe [slot/variante…]  cada variante (por defecto: las del catálogo extended) dentro de una página',
    '                        completa Básico/Pro, en tema claro, oscuro y con estilos, con copy demo y largo:',
    '                        kit:validate + Chromium (overflow, texto < 14 px, táctiles < 44 px, contraste axe,',
    '                        encaje y pliegue en portadas). .lattiz/probe/; sale con 1 si hay FAIL.',
    '  --themes claro,oscuro,estilo   --modes demo,largo,corto',
  ],
  options: {
    json: { type: 'boolean' },
    giro: { type: 'string' },
    catalog: { type: 'string' },
    slot: { type: 'string' },
    palettes: { type: 'boolean' },
    fonts: { type: 'boolean' },
    tokens: { type: 'boolean' },
    themes: { type: 'string' },
    'sin-imagen': { type: 'boolean' },
    extended: { type: 'boolean' },
    variant: { type: 'string' },
    modes: { type: 'string' },
  },
  async run(ctx) {
    setQuiet(bool(ctx.flags, 'json'));
    const sub = ctx.positionals[0];
    if (sub === 'capacity') return runCapacity(ctx);
    if (sub === 'gallery') return runGallery(ctx);
    if (sub === 'probe') return runProbe(ctx);
    throw usage(
      sub ? `Subcomando desconocido: ${sub}` : 'Falta el subcomando.',
      'pnpm lattiz kit capacity|gallery|probe',
    );
  },
};
