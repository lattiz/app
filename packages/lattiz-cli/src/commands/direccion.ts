import { DIRECTIONS } from '../../../template-kit/directions';
import { closest } from '../../../template-kit/src/spec/schema';
import { bool, type Command, type Context } from '../lib/command';
import { EXIT, type ExitCode, usage } from '../lib/errors';
import { c, log, setQuiet, table } from '../lib/ui';

function runList(ctx: Context): ExitCode {
  const list = Object.values(DIRECTIONS);
  if (bool(ctx.flags, 'json')) {
    console.log(JSON.stringify(list, null, 2));
    return EXIT.OK;
  }
  log.title('lattiz direccion list');
  log.plain(
    table(
      ['Id', 'Nombre', 'V/M/D', 'Motion', 'Giros'],
      list.map((d) => [
        d.id,
        d.name,
        `${d.dials.variance}/${d.dials.motion}/${d.dials.density}`,
        d.motion,
        d.giros.join(', '),
      ]),
    ),
  );
  log.plain(c.gray('\nDetalle: pnpm lattiz direccion show <id> [--json]'));
  return EXIT.OK;
}

function runShow(ctx: Context): ExitCode {
  const id = ctx.positionals[1];
  if (!id)
    throw usage(
      'Falta la dirección.',
      'Ejemplo: pnpm lattiz direccion show cantera-editorial',
    );
  const d = DIRECTIONS[id];
  if (!d) {
    const guess = closest(id, Object.keys(DIRECTIONS));
    throw usage(
      `Dirección desconocida: "${id}".`,
      `${guess ? `¿Quisiste decir "${guess}"? ` : ''}Direcciones: ${Object.keys(DIRECTIONS).join(', ')}`,
    );
  }
  if (bool(ctx.flags, 'json')) {
    console.log(JSON.stringify(d, null, 2));
    return EXIT.OK;
  }
  log.title(`lattiz direccion show ${id}`);
  log.plain(`${c.bold(d.name)} · ${d.intent}`);
  log.plain(
    `\n${c.bold('Diales')} variación ${d.dials.variance} · movimiento ${d.dials.motion} · densidad ${d.dials.density} · Motion Pro ${d.motion} (Básico sin Motion)`,
  );
  log.plain(
    `${c.bold('Estilo')} ${Object.entries(d.style)
      .map(([k, v]) => `${k} ${v}`)
      .join(' · ')}`,
  );
  log.plain(
    `${c.bold('Primitivos')} ${Object.entries(d.primitives)
      .map(([k, v]) => `${k} ${v}`)
      .join(' · ')}`,
  );
  log.plain(
    `${c.bold('Arquetipos')} ${d.archetypes.join(', ')} · ${c.bold('Portadas')} Pro ${d.heroes.pro.join(', ')} · Básico ${d.heroes.basic.join(', ')}`,
  );
  log.plain(`${c.bold('Paletas')} ${d.palettes.default.join(', ')}`);
  for (const [giro, list] of Object.entries(d.palettes.byGiro ?? {}))
    log.plain(c.gray(`  ${giro}: ${list.join(', ')}`));
  log.plain(`${c.bold('Tipografías')} ${d.fontPairs.default.join(', ')}`);
  log.plain(
    `${c.bold('Giros')} ${d.giros.join(', ')} · ${c.bold('Reglas')} ${d.rules.join(', ') || '—'}`,
  );
  log.plain(`\n${c.bold('Voz')} ${d.voice.register}`);
  for (const r of d.voice.rules) log.plain(`  · ${r}`);
  log.plain(c.gray(`  Evitar: ${d.voice.avoid.join(', ')}`));
  log.plain(c.gray(`  Ejemplo: «${d.voice.headline}» · CTA «${d.voice.cta}»`));
  return EXIT.OK;
}

export const direccion: Command = {
  name: 'direccion',
  summary:
    'Direcciones de arte (paleta, tipografía, estilos, primitivos, portadas, Motion y voz)',
  usage: 'direccion list|show <id> [--json]',
  help: [
    'direccion list          las direcciones con diales, Motion y giros afines',
    'direccion show <id>     todo lo que fija una dirección, con la voz del copy',
    '',
    'En un spec: "layout": { "direction": "<id>" } (con "brand": { "catalog": "extended" }).',
    '  --json                salida estable para la skill de Claude Code',
  ],
  options: { json: { type: 'boolean' } },
  async run(ctx) {
    setQuiet(bool(ctx.flags, 'json'));
    const sub = ctx.positionals[0];
    if (sub === 'list' || sub === undefined) return runList(ctx);
    if (sub === 'show') return runShow(ctx);
    throw usage(
      `Subcomando desconocido: "${sub}".`,
      'pnpm lattiz direccion list|show <id>',
    );
  },
};
