import {
  kitCapacity,
  type Catalog,
} from '../../../template-kit/src/spec/capacity';
import { bool, type Command, type Context, str } from '../lib/command';
import { EXIT, type ExitCode, usage } from '../lib/errors';
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

export const kit: Command = {
  name: 'kit',
  summary:
    'El kit por dentro: capacidad por giro (cuántas plantillas más caben sin chocar)',
  usage: 'kit capacity [--giro <giro>] [--catalog legacy|extended] [--json]',
  help: [
    'kit capacity            por giro: plantillas, paletas, pares tipográficos y portadas Pro libres, tonos',
    '                        de acento que aún caben y cuántas plantillas más acepta el compilador (simula',
    '                        specs una tras otra hasta que una regla de unicidad lo detiene). Solo lectura.',
    '  --giro <giro>         un solo giro',
    '  --catalog <c>         legacy (por defecto: lo que ve un spec sin brand.catalog) o extended',
    '  --json                salida estable',
  ],
  options: {
    json: { type: 'boolean' },
    giro: { type: 'string' },
    catalog: { type: 'string' },
  },
  async run(ctx) {
    setQuiet(bool(ctx.flags, 'json'));
    const sub = ctx.positionals[0];
    if (sub === 'capacity') return runCapacity(ctx);
    throw usage(
      sub ? `Subcomando desconocido: ${sub}` : 'Falta el subcomando.',
      'pnpm lattiz kit capacity',
    );
  },
};
