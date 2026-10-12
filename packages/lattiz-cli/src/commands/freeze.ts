import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  readExisting,
  setMarkerState,
  type FileKind,
} from '../../../template-kit/src/spec/files';
import type { Manifest } from '../../../template-kit/src/types';
import { type Command, type Context } from '../lib/command';
import { EXIT, type ExitCode, usage } from '../lib/errors';
import { KIT, manifestFile } from '../lib/paths';
import { confirm } from '../lib/prompt';
import { rel } from '../lib/spec';
import { writeState } from '../lib/state';
import { assertTemplate, localIds } from '../lib/templates';
import { c, log } from '../lib/ui';

interface Owned {
  kind: FileKind;
  path: string;
}

/** Generated files of a template: manifest, theme, demo profile and the (possibly shared) copy pack. */
async function ownedFiles(
  id: string,
): Promise<{ files: Owned[]; shared: string[] }> {
  const manifest = await readExisting(manifestFile(id), 'manifest');
  if (!manifest.marker)
    throw usage(
      `${id} no es una plantilla generada por un spec (sin marca GENERATED/FROZEN).`,
      'Solo se congelan plantillas hechas con `pnpm lattiz build`.',
    );
  const m = manifest.value as Manifest;
  const files: Owned[] = [
    { kind: 'manifest', path: manifestFile(id) },
    { kind: 'theme', path: resolve(KIT, 'themes', `${m.theme}.json`) },
    { kind: 'demo', path: resolve(KIT, 'demo-profiles', `${id}.json`) },
    { kind: 'pack', path: resolve(KIT, 'content', `${m.content}.ts`) },
  ];
  const shared: string[] = [];
  for (const other of localIds()) {
    if (other === id) continue;
    const o = await readExisting(manifestFile(other), 'manifest').catch(
      () => null,
    );
    if ((o?.value as Manifest | undefined)?.content === m.content)
      shared.push(other);
  }
  return { files: files.filter((f) => existsSync(f.path)), shared };
}

async function toggle(ctx: Context, freeze: boolean): Promise<ExitCode> {
  const id = assertTemplate(ctx.positionals[0]);
  log.title(`lattiz ${freeze ? 'freeze' : 'unfreeze'} ${id}`);
  const { files, shared } = await ownedFiles(id);
  if (!freeze) {
    log.warn(
      'Al descongelar, el próximo `lattiz build` vuelve a generar estos archivos desde el spec y se pierden las ediciones a mano:',
    );
    for (const f of files) log.plain(`    ${rel(f.path)}`);
    if (
      !(await confirm(
        ctx,
        `¿Devolver ${id} al spec (se perderán las ediciones a mano)?`,
      ))
    ) {
      log.warn('Cancelado: sigue congelada.');
      return EXIT.GATE;
    }
  }
  const changed: string[] = [];
  for (const f of files) {
    const existing = await readExisting(f.path, f.kind);
    if (!existing.marker) continue;
    if (freeze ? existing.state === 'frozen' : existing.state === 'generated')
      continue;
    // Unfreezing records the current content as the build's, so the next build replaces it cleanly.
    setMarkerState(
      f.path,
      f.kind,
      freeze ? 'FROZEN' : 'GENERATED',
      [id],
      freeze ? undefined : existing.actualHash,
    );
    changed.push(rel(f.path));
  }
  writeState(
    id,
    freeze
      ? {
          frozen: {
            at: new Date().toISOString(),
            files: files.map((f) => rel(f.path)),
          },
        }
      : { frozen: undefined },
  );
  if (changed.length === 0)
    log.info(
      `Nada que cambiar: ya estaba ${freeze ? 'congelada' : 'generada'}.`,
    );
  for (const f of changed) log.ok(`${freeze ? 'FROZEN' : 'GENERATED'} ${f}`);
  if (shared.length > 0)
    log.warn(
      `El copy (${rel(files.find((f) => f.kind === 'pack')?.path ?? '')}) lo comparte ${shared.join(', ')}: ${freeze ? 'su build tampoco lo sobrescribirá' : 'vuelve a ser del spec para las dos'}.`,
    );
  log.info(
    freeze
      ? `Edita a mano lo que quieras; \`pnpm lattiz build\` ya no lo sobrescribe y muestra el diff contra el spec. ${c.gray(`(pnpm lattiz unfreeze ${id} para volver)`)}`
      : `Siguiente: pnpm lattiz build ${id} --dry-run --diff`,
  );
  return EXIT.OK;
}

export const freeze: Command = {
  name: 'freeze',
  summary:
    'Congela los archivos generados de una plantilla: build ya no los sobrescribe',
  usage: 'freeze <id>',
  help: [
    'Marca manifiesto, tema, perfil demo y copy como FROZEN (la marca va en cada archivo y se',
    'commitea; .lattiz/state guarda cuándo). `lattiz build` se niega a sobrescribirlos y muestra el',
    'diff entre lo congelado y una compilación nueva del spec.',
  ],
  options: {},
  run: (ctx) => toggle(ctx, true),
};

export const unfreeze: Command = {
  name: 'unfreeze',
  summary: 'Devuelve una plantilla congelada al spec (pide confirmación)',
  usage: 'unfreeze <id>',
  help: [
    'Vuelve a marcar los archivos como GENERATED. El siguiente `lattiz build` los regenera desde el',
    'spec y se pierden las ediciones a mano. Pide confirmación (--yes la salta).',
  ],
  options: {},
  run: (ctx) => toggle(ctx, false),
};
