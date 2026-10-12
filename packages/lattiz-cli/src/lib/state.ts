import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { stateFile } from './paths';

export interface CheckSummary {
  at: string;
  result: 'PASS' | 'WARN' | 'FAIL';
  fail: number;
  warn: number;
  ms: number;
  forced?: boolean;
  shots: string;
  rules: { rule: string; viewport: string; status: string; detail: string }[];
}

/** `.lattiz/state/<id>.json` (untracked): what the CLI last did for a template. */
export interface TemplateState {
  id: string;
  lastCheck?: CheckSummary;
  lastSeed?: { at: string; tier: string; deployed: boolean };
  /** Seeded with --no-deploy; `lattiz deploy` still has to verify, thumbnail and activate it. */
  pendingFinalize?: boolean;
  lastDeploy?: { at: string; url: string; ok: boolean };
}

export function readState(id: string): TemplateState {
  const file = stateFile(id);
  if (!existsSync(file)) return { id };
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as TemplateState;
  } catch {
    return { id };
  }
}

export function writeState(id: string, patch: Partial<TemplateState>): TemplateState {
  const next = { ...readState(id), ...patch, id };
  const file = stateFile(id);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`);
  return next;
}
