import { closest } from '../../../template-kit/src/spec/schema';
import {
  giroInfo,
  giroList,
  TIER_LABEL,
} from '../../../template-kit/src/spec/giro-info';
import { bool, type Command, type Context } from '../lib/command';
import { EXIT, type ExitCode, usage } from '../lib/errors';
import { GIROS } from '../lib/spec';
import { c, log, setQuiet, table } from '../lib/ui';

async function runList(ctx: Context): Promise<ExitCode> {
  const rows = await giroList();
  if (bool(ctx.flags, 'json')) {
    console.log(JSON.stringify(rows, null, 2));
    return EXIT.OK;
  }
  log.title('lattiz giro list');
  console.log(
    table(
      ['Giro', 'Nombre', 'Paletas libres', 'Plantillas', 'Cubre'],
      rows.map((g) => [
        c.bold(g.id),
        g.label,
        `${g.palettesFree}/${g.palettes}`,
        String(g.templates.length),
        c.gray(g.aliases.slice(0, 6).join(', ')),
      ]),
    ),
  );
  log.plain(c.gray('\nDetalle: pnpm lattiz giro show <giro> [--json]'));
  return EXIT.OK;
}

async function runShow(ctx: Context): Promise<ExitCode> {
  const id = ctx.positionals[1];
  if (!id)
    throw usage('Falta el giro.', 'Ejemplo: pnpm lattiz giro show restaurante');
  const info = await giroInfo(id);
  if (!info) {
    const guess = closest(id, Object.keys(GIROS));
    throw usage(
      `Giro desconocido: "${id}".`,
      `${guess ? `¿"${guess}"? ` : ''}Giros: ${Object.keys(GIROS).join(', ')}`,
    );
  }
  if (bool(ctx.flags, 'json')) {
    console.log(JSON.stringify(info, null, 2));
    return EXIT.OK;
  }
  log.title(`lattiz giro show ${id}`);
  log.plain(
    `${c.bold(info.label)} · categoría ${info.category} · business_profile.category ${info.businessCategory} · schema.org ${info.schemaType}`,
  );
  if (info.aliases.length)
    log.plain(c.gray(`Cubre: ${info.aliases.join(', ')}`));
  log.plain(
    c.gray(`Plantillas del giro: ${info.templates.join(', ') || 'ninguna'}`),
  );
  log.plain(
    `\n${c.bold('Direcciones de arte')} (primero las menos usadas en el giro, luego por afinidad; layout.direction)`,
  );
  for (const d of info.directions)
    log.plain(
      `  ${d.id.padEnd(18)} ${d.name.padEnd(18)} ${c.gray(`usada ${d.used} · afinidad ${d.affinity === null ? '—' : d.affinity + 1}`)}`,
    );
  const archetypes = Object.entries(info.archetypesUsed);
  log.plain(
    c.gray(
      `Arquetipos ya usados: ${archetypes.length ? archetypes.map(([a, n]) => `${a} ×${n}`).join(', ') : 'ninguno (specs con layout)'} · portadas Pro libres: ${info.freeProHeroes.length} (${info.freeProHeroes.join(', ')})`,
    ),
  );
  log.plain(
    `\n${c.bold('Paletas')} (libre = acento a ≥ 30° de las plantillas del giro)`,
  );
  for (const p of info.palettesList)
    log.plain(
      `  ${p.free ? c.green('libre ') : c.gray('usada ')} ${p.id.padEnd(14)} ${p.label} ${c.gray(p.accent)}`,
    );
  log.plain(`\n${c.bold('Tipografías')}`);
  for (const f of info.fontPairsList)
    log.plain(
      `  ${f.free ? c.green('libre ') : c.gray('usada ')} ${f.id.padEnd(34)} ${c.gray(f.label)}`,
    );
  const others = info.otherFontPairs.filter((f) => f.free);
  if (others.length)
    log.plain(
      c.gray(
        `  También permitidas (fuera de la lista del giro): ${others.map((f) => f.id).join(', ')}`,
      ),
    );
  log.plain(
    `\n${c.bold('Formas:')} ${info.shapes.map((s) => s.id).join(', ')}`,
  );
  for (const tier of ['basico', 'pro'] as const) {
    const t = info.tiers[tier];
    log.plain(
      `\n${c.bold(TIER_LABEL[tier])} ${c.gray(`(${t.id}, ${t.counted[0]}–${t.counted[1]} secciones contadas)`)}`,
    );
    log.plain(
      `  Por defecto: ${t.defaultSections.map((s) => `${s.role}:${s.variant}`).join(' · ')}`,
    );
    for (const r of t.roles)
      log.plain(
        `  ${r.required ? c.bold(r.role.padEnd(13)) : r.role.padEnd(13)} ${c.gray(`${r.slot} →`)} ${r.variants.join(', ')}`,
      );
  }
  log.plain(
    `\n${c.bold('Copy por slot')} (clave · máx. caracteres · ejemplo del giro)`,
  );
  for (const [slot, entry] of Object.entries(info.copy)) {
    log.plain(`  ${c.bold(slot)}`);
    for (const k of entry.keys)
      log.plain(
        `    ${k.key.padEnd(26)} ${c.gray(k.limit ? `≤${k.limit}`.padEnd(5) : '     ')} ${c.gray((k.example ?? '').replace(/<[^>]+>/g, '').slice(0, 70))}`,
      );
  }
  log.plain(`\n${c.bold('Reglas de copy')}`);
  for (const r of info.rules) log.plain(`  · ${r}`);
  return EXIT.OK;
}

export const giro: Command = {
  name: 'giro',
  summary:
    'Giros del registro: secciones, variantes, paletas, tipografías y reglas de copy',
  usage: 'giro list|show <giro> [--json]',
  help: [
    'giro list               giros, paletas libres, plantillas existentes y qué negocios cubre',
    'giro show <giro>        roles y variantes por tier, secciones por defecto, paletas y tipografías',
    '                        (con «libre» si nadie del giro las usa), claves de copy por slot con su',
    '                        límite de caracteres y el ejemplo del giro, y las reglas de copy.',
    '  --json                salida estable para la skill de Claude Code',
  ],
  options: { json: { type: 'boolean' } },
  async run(ctx) {
    setQuiet(bool(ctx.flags, 'json'));
    const sub = ctx.positionals[0];
    if (sub === 'list') return runList(ctx);
    if (sub === 'show') return runShow(ctx);
    throw usage(
      sub ? `Subcomando desconocido: ${sub}` : 'Falta el subcomando.',
      'pnpm lattiz giro list|show <giro>',
    );
  },
};
