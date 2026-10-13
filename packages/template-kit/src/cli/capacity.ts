/**
 * How many more templates each giro takes before the uniqueness rules refuse (see src/spec/capacity.ts).
 *
 *   pnpm --filter @lattiz/template-kit kit:capacity [--giro <id>] [--catalog legacy|extended] [--json]
 */
import { parseArgs, runCli } from '../lib/args';
import { kitCapacity, type Catalog } from '../spec/capacity';

async function main(): Promise<void> {
  const { flags } = parseArgs(process.argv.slice(2).filter((a) => a !== '--'));
  const catalog = (flags.get('catalog') ?? 'legacy') as Catalog;
  if (catalog !== 'legacy' && catalog !== 'extended') {
    console.error('--catalog legacy|extended');
    process.exit(2);
  }
  const giro = flags.get('giro');
  const rows = await kitCapacity(catalog, giro ? [giro] : undefined);
  if (flags.has('json')) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }
  console.log(`Capacidad por giro (catálogo ${catalog})\n`);
  console.log(
    'giro          plantillas  paletas libres  pares libres  portadas Pro libres  tonos libres  │ pares  +Pro  +Básico  total',
  );
  for (const r of rows) {
    const h = r.headroom;
    console.log(
      [
        r.giro.padEnd(13),
        `${r.templates.total} (${r.templates.pro}/${r.templates.basico})`.padEnd(
          11,
        ),
        `${r.pools.palettesFree}/${r.pools.palettes}`.padEnd(15),
        `${r.pools.fontPairsFree}/${r.pools.fontPairs}`.padEnd(13),
        `${r.pools.heroFreePro}/${r.pools.heroVariants}`.padEnd(20),
        String(r.hueSlots).padEnd(13),
        '│',
        String(h.twins.added / 2).padEnd(6),
        String(h.pro.added).padEnd(5),
        String(h.basico.added).padEnd(8),
        String(h.total.added),
      ].join(' '),
    );
  }
  console.log('\nPor qué se detiene (total):');
  for (const r of rows)
    console.log(
      `  ${r.giro.padEnd(12)} ${r.headroom.total.stop ?? 'tope de la simulación'}`,
    );
}

runCli(main);
