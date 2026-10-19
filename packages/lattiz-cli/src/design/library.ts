import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { REPO_ROOT } from '../lib/paths';
import { usage } from '../lib/errors';
import {
  CANDIDATE_STATUSES,
  type Candidate,
  type CandidateStatus,
  type Harvest,
  type LibraryIndex,
  STATUS_MOVES,
  validateCandidate,
  validateHarvest,
} from './types';

/** LATTIZ_DESIGN_LIBRARY redirects the whole library (tests, dry runs); the default is versioned. */
export const libraryRoot = () =>
  process.env.LATTIZ_DESIGN_LIBRARY
    ? resolve(process.env.LATTIZ_DESIGN_LIBRARY)
    : resolve(REPO_ROOT, 'design-library');
export const stitchRoot = () => join(libraryRoot(), 'stitch');
export const indexFile = () => join(libraryRoot(), 'index.json');
/** Untracked intermediate state (briefs, MCP downloads). */
export const workDir = (...parts: string[]) =>
  resolve(REPO_ROOT, '.lattiz', 'stitch', ...parts);

export const LICENSE_REF = 'docs/design-stitch-flow.md#licencia';

export const candidateDir = (giro: string, id: string) =>
  join(stitchRoot(), giro, id);

export function writeJson(file: string, data: unknown): void {
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

export interface Located {
  candidate: Candidate;
  dir: string;
}

function listDirs(dir: string): string[] {
  return existsSync(dir)
    ? readdirSync(dir).filter((n) => statSync(join(dir, n)).isDirectory())
    : [];
}

export function allCandidates(): Located[] {
  const out: Located[] = [];
  for (const giro of listDirs(stitchRoot()))
    for (const id of listDirs(join(stitchRoot(), giro))) {
      const dir = join(stitchRoot(), giro, id);
      const file = join(dir, 'candidate.json');
      if (!existsSync(file)) continue;
      out.push({
        candidate: validateCandidate(
          JSON.parse(readFileSync(file, 'utf8')),
          relative(REPO_ROOT, file),
        ),
        dir,
      });
    }
  return out.sort((a, b) => a.candidate.id.localeCompare(b.candidate.id));
}

export function findCandidate(id: string | undefined): Located {
  if (!id)
    throw usage('Falta el id del candidato.', 'Lista: pnpm lattiz design list');
  const hit = allCandidates().find((x) => x.candidate.id === id);
  if (!hit)
    throw usage(
      `No existe el candidato "${id}".`,
      'Lista: pnpm lattiz design list',
    );
  return hit;
}

export function saveCandidate(
  loc: Located,
  patch: Partial<Candidate>,
): Candidate {
  const next = validateCandidate({ ...loc.candidate, ...patch });
  writeJson(join(loc.dir, 'candidate.json'), next);
  loc.candidate = next;
  return next;
}

export function setStatus(
  loc: Located,
  status: CandidateStatus,
  patch: Partial<Candidate> = {},
): Candidate {
  const from = loc.candidate.status;
  if (!STATUS_MOVES[from].includes(status))
    throw usage(
      `"${loc.candidate.id}" está en ${from}: no puede pasar a ${status}.`,
      `Desde ${from}: ${STATUS_MOVES[from].join(', ') || 'ninguno (terminal)'}.`,
    );
  return saveCandidate(loc, { ...patch, status });
}

export function readHarvest(loc: Located): Harvest {
  const file = join(loc.dir, 'harvest.json');
  if (!existsSync(file))
    throw usage(
      `"${loc.candidate.id}" no tiene harvest.json.`,
      `Primero: pnpm lattiz design harvest ${loc.candidate.id}`,
    );
  return validateHarvest(JSON.parse(readFileSync(file, 'utf8')));
}

export function nextId(giro: string, slug: string): string {
  const taken = new Set(allCandidates().map((x) => x.candidate.id));
  for (let n = 1; ; n += 1) {
    const id = `${giro}-${slug}-${String(n).padStart(2, '0')}`;
    if (!taken.has(id)) return id;
  }
}

export const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'diseno';

export function buildIndex(): LibraryIndex {
  const found = allCandidates();
  const by_status = Object.fromEntries(
    CANDIDATE_STATUSES.map((s) => [s, 0]),
  ) as Record<CandidateStatus, number>;
  for (const { candidate } of found) by_status[candidate.status] += 1;
  return {
    version: 1,
    count: found.length,
    by_status,
    candidates: found.map(({ candidate: c, dir }) => ({
      id: c.id,
      giro: c.giro,
      status: c.status,
      tags: c.tags,
      ...(c.spin ? { spin: c.spin } : {}),
      ...(c.reuse_of ? { reuse_of: c.reuse_of } : {}),
      created_at: c.created_at,
      harvested: existsSync(join(dir, 'harvest.json')),
      path: relative(libraryRoot(), dir),
    })),
  };
}

export function reindex(): LibraryIndex {
  const index = buildIndex();
  writeJson(indexFile(), index);
  return index;
}

export function readIndex(): LibraryIndex {
  return existsSync(indexFile())
    ? (JSON.parse(readFileSync(indexFile(), 'utf8')) as LibraryIndex)
    : buildIndex();
}
