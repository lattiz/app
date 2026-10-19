import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import {
  candidateDir,
  findCandidate,
  LICENSE_REF,
  nextId,
  readIndex,
  reindex,
  setStatus,
  slugify,
  writeJson,
} from '../design/library';
import { harvestFolder } from '../design/harvest';
import { promote } from '../design/promote';
import type { Candidate, CandidateStatus } from '../design/types';
import { GIROS } from '../../../template-kit/giros';
import { bool, type Command, type Context, str } from '../lib/command';
import { EXIT, type ExitCode, usage } from '../lib/errors';
import { c, log, setQuiet, table } from '../lib/ui';

const csv = (v: string | undefined) =>
  v
    ? v
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
    : [];

function runList(ctx: Context): ExitCode {
  const giro = str(ctx.flags, 'giro');
  const status = str(ctx.flags, 'status');
  const tag = str(ctx.flags, 'tag');
  const spin = str(ctx.flags, 'spin');
  const rows = readIndex().candidates.filter(
    (e) =>
      (!giro || e.giro === giro) &&
      (!status || e.status === status) &&
      (!tag || e.tags.includes(tag)) &&
      (!spin || e.spin === spin),
  );
  if (bool(ctx.flags, 'json')) {
    console.log(JSON.stringify(rows, null, 2));
    return EXIT.OK;
  }
  log.title('lattiz design list');
  if (rows.length === 0) {
    log.plain(c.gray('  Sin candidatos con ese filtro.'));
    return EXIT.OK;
  }
  log.plain(
    table(
      ['Id', 'Giro', 'Estado', 'Giro de estilo', 'Etiquetas'],
      rows.map((e) => [
        e.id,
        e.giro,
        e.harvested && e.status === 'collected' ? 'collected*' : e.status,
        e.spin ?? '—',
        e.tags.join(', ') || '—',
      ]),
    ),
  );
  return EXIT.OK;
}

function runReindex(): ExitCode {
  const index = reindex();
  log.ok(
    `design-library/index.json: ${index.count} candidato(s) · ${Object.entries(
      index.by_status,
    )
      .filter(([, n]) => n > 0)
      .map(([s, n]) => `${s} ${n}`)
      .join(' · ')}`,
  );
  return EXIT.OK;
}

function runFlag(ctx: Context, status: CandidateStatus): ExitCode {
  const loc = findCandidate(ctx.positionals[1]);
  const note = str(ctx.flags, 'note');
  setStatus(loc, status, note ? { notes: note } : {});
  reindex();
  log.ok(`${loc.candidate.id} → ${status}`);
  return EXIT.OK;
}

function runHarvest(ctx: Context): ExitCode {
  const loc = findCandidate(ctx.positionals[1]);
  if (loc.candidate.status === 'rejected')
    throw usage(`"${loc.candidate.id}" está rechazado: no se extrae.`);
  const harvest = harvestFolder(loc.candidate, loc.dir);
  writeJson(join(loc.dir, 'harvest.json'), harvest);
  setStatus(loc, 'harvested');
  reindex();
  if (bool(ctx.flags, 'json')) {
    console.log(JSON.stringify(harvest, null, 2));
    return EXIT.OK;
  }
  log.title(`lattiz design harvest ${loc.candidate.id}`);
  const p = harvest.palette;
  if (p)
    log.plain(
      `${c.bold('Paleta')} ${p.mode} · fondo ${p.bg} · texto ${p.text} · acento ${p.accent} ${
        p.aa.ok ? c.green('AA ✓') : c.red(`AA ✗ ${p.aa.problems.join('; ')}`)
      }`,
    );
  else log.warn('Sin paleta: faltan tokens de color en la fuente.');
  const t = harvest.typography;
  log.plain(
    `${c.bold('Tipografía')} ${t.displayFamily ?? '—'} + ${t.bodyFamily ?? '—'} · ${t.scale.length} niveles${
      t.unsupportedFamilies.length
        ? c.yellow(
            ` · sin fuente utilizable: ${t.unsupportedFamilies.join(', ')}`,
          )
        : ''
    }`,
  );
  for (const s of harvest.sections)
    log.plain(
      `${c.bold('Sección')} ${s.slot}/${s.layout} · ${s.ref} · ${s.items} ítem(s) · ${s.surface}${s.notes ? c.gray(` · ${s.notes.join('; ')}`) : ''}`,
    );
  for (const n of harvest.not_mappable)
    log.plain(c.yellow(`No mapeable: ${n.ref} — ${n.reason}`));
  log.plain(
    c.gray(
      `${harvest.images_ignored} imagen(es) ignorada(s): nunca se copian.`,
    ),
  );
  log.hint(
    `Revisa y promueve: pnpm lattiz design promote ${loc.candidate.id} --palette`,
  );
  return EXIT.OK;
}

function runPromote(ctx: Context): ExitCode {
  const loc = findCandidate(ctx.positionals[1]);
  const dryRun = bool(ctx.flags, 'dry-run');
  const report = promote(loc, {
    palette: bool(ctx.flags, 'palette'),
    fonts: bool(ctx.flags, 'fonts'),
    section: bool(ctx.flags, 'section'),
    pattern: str(ctx.flags, 'pattern'),
    regenerateManifest: bool(ctx.flags, 'regenerate-manifest'),
    dryRun,
  });
  if (bool(ctx.flags, 'json')) {
    console.log(JSON.stringify(report, null, 2));
    return EXIT.OK;
  }
  log.title(`lattiz design promote ${loc.candidate.id}`);
  for (const [kind, list] of Object.entries(report.gates)) {
    log.plain(c.bold(kind));
    for (const g of list) log.ok(g);
  }
  if (report.kept) {
    log.ok(
      `Promovido: ${Object.entries(report.refs)
        .map(([k, v]) => `${k} ${v}`)
        .join(' · ')}`,
    );
    log.hint(
      'Revisa el diff y commitea los archivos del kit explícitos (git add por ruta).',
    );
  } else
    log.info(
      dryRun
        ? 'Prueba en seco: pasó todas las compuertas y no quedó nada escrito.'
        : 'Nada se conservó (una sección sin --regenerate-manifest es solo una prueba).',
    );
  return EXIT.OK;
}

/** `gen --import`: registers a candidate from files the MCP (or a person) already produced. */
function runImport(ctx: Context): ExitCode {
  const giro = str(ctx.flags, 'giro');
  const file = str(ctx.flags, 'import');
  if (!giro || !GIROS[giro])
    throw usage(
      `Giro desconocido: "${giro ?? ''}".`,
      `Giros: ${Object.keys(GIROS).join(', ')}`,
    );
  if (!file || !existsSync(file))
    throw usage(`No existe el archivo a importar: ${file ?? ''}`);
  const source = resolve(file);
  const isMd = source.endsWith('.md');
  const designMdFile = str(ctx.flags, 'design-md');
  const text = readFileSync(source, 'utf8');
  const title =
    str(ctx.flags, 'name') ??
    /<title>([^<]+)<\/title>/i.exec(text)?.[1] ??
    /^name:\s*(.+)$/m.exec(text)?.[1] ??
    basename(source).replace(/\.[^.]+$/, '');
  const id = nextId(giro, slugify(title));
  const dir = candidateDir(giro, id);
  mkdirSync(dir, { recursive: true });
  copyFileSync(source, join(dir, isMd ? 'design.md' : 'source.html'));
  if (designMdFile) {
    if (!existsSync(designMdFile))
      throw usage(`No existe --design-md: ${designMdFile}`);
    copyFileSync(designMdFile, join(dir, 'design.md'));
  }
  const shot = str(ctx.flags, 'screenshot');
  if (shot) {
    if (!existsSync(shot)) throw usage(`No existe --screenshot: ${shot}`);
    copyFileSync(shot, join(dir, 'screenshot.png'));
  }
  const reuse = str(ctx.flags, 'reuse-of');
  if (reuse) findCandidate(reuse);
  const screens = csv(str(ctx.flags, 'screen'));
  const candidate: Candidate = {
    id,
    giro,
    source: 'stitch',
    status: 'collected',
    tags: csv(str(ctx.flags, 'tags')),
    ...(str(ctx.flags, 'spin') ? { spin: str(ctx.flags, 'spin') } : {}),
    license_ref: LICENSE_REF,
    ...(reuse ? { reuse_of: reuse } : {}),
    created_at: new Date().toISOString(),
    stitch: {
      ...(str(ctx.flags, 'project')
        ? { project_id: str(ctx.flags, 'project') }
        : {}),
      ...(screens.length ? { screen_ids: screens } : {}),
    },
    ...(str(ctx.flags, 'direccion')
      ? { direction: str(ctx.flags, 'direccion') }
      : {}),
  };
  writeJson(join(dir, 'candidate.json'), candidate);
  reindex();
  log.ok(`Candidato ${c.bold(id)} (collected) en ${dir}`);
  log.hint(`Siguiente: pnpm lattiz design harvest ${id}`);
  return EXIT.OK;
}

export const design: Command = {
  name: 'design',
  summary:
    'Biblioteca de diseños Stitch: traer, listar, extraer (harvest) y promover al kit',
  usage:
    'design gen|list|harvest|promote|shelve|reject|reindex|system [id] [opciones]',
  help: [
    'design gen --giro <g> --import <html|md> [--design-md f] [--screenshot f] [--name n] [--tags a,b] [--spin s] [--direccion d] [--project id] [--screen id,id] [--reuse-of id]',
    '                          registra un candidato (collected) desde archivos locales',
    'design promote <id> [--palette] [--fonts] [--section [--pattern slot/layout]] [--dry-run] [--regenerate-manifest]',
    '                          pasa los borradores del harvest por las compuertas del kit; si una falla no queda nada',
    '                          --section sin --regenerate-manifest es solo una prueba (esa bandera reescribe archivos generados de apps/api y apps/web)',
    'design list [--giro g] [--status s] [--tag t] [--spin s] [--json]',
    'design shelve|reject <id> [--note texto]     mueve la bandera',
    'design reindex            regenera design-library/index.json',
    '',
    'Stitch no es parte del pipeline de publicación: solo alimenta el paso de diseño. Guía: docs/design-stitch-flow.md',
  ],
  options: {
    json: { type: 'boolean' },
    giro: { type: 'string' },
    status: { type: 'string' },
    tag: { type: 'string' },
    tags: { type: 'string' },
    spin: { type: 'string' },
    import: { type: 'string' },
    'design-md': { type: 'string' },
    screenshot: { type: 'string' },
    name: { type: 'string' },
    direccion: { type: 'string' },
    project: { type: 'string' },
    screen: { type: 'string' },
    'reuse-of': { type: 'string' },
    note: { type: 'string' },
    palette: { type: 'boolean' },
    fonts: { type: 'boolean' },
    section: { type: 'boolean' },
    pattern: { type: 'string' },
    'dry-run': { type: 'boolean' },
    'regenerate-manifest': { type: 'boolean' },
  },
  async run(ctx) {
    setQuiet(bool(ctx.flags, 'json'));
    const sub = ctx.positionals[0];
    switch (sub) {
      case 'list':
      case undefined:
        return runList(ctx);
      case 'reindex':
        return runReindex();
      case 'harvest':
        return runHarvest(ctx);
      case 'promote':
        return runPromote(ctx);
      case 'shelve':
        return runFlag(ctx, 'shelved');
      case 'reject':
        return runFlag(ctx, 'rejected');
      case 'gen':
        if (str(ctx.flags, 'import')) return runImport(ctx);
        throw usage('design gen necesita --import <archivo> por ahora.');
      default:
        throw usage(
          `Subcomando desconocido: "${sub}".`,
          'pnpm lattiz design --help',
        );
    }
  },
};
