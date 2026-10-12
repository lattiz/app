import type { ParseArgsOptionsConfig } from 'node:util';
import type { ExitCode } from './errors';
import type { PromptMode } from './prompt';

export type Flags = Record<string, string | boolean | undefined>;

export interface Context extends PromptMode {
  positionals: string[];
  flags: Flags;
}

export interface Command {
  name: string;
  aliases?: string[];
  /** One line for `pnpm lattiz --help`. */
  summary: string;
  usage: string;
  /** Extra help lines (flags, examples). */
  help: string[];
  options: ParseArgsOptionsConfig;
  run(ctx: Context): Promise<ExitCode>;
}

export const GLOBAL_OPTIONS: ParseArgsOptionsConfig = {
  help: { type: 'boolean', short: 'h' },
  yes: { type: 'boolean', short: 'y' },
  'non-interactive': { type: 'boolean' },
  'no-color': { type: 'boolean' },
};

export function str(flags: Flags, key: string): string | undefined {
  const v = flags[key];
  return typeof v === 'string' ? v : undefined;
}

export function bool(flags: Flags, key: string): boolean {
  return flags[key] === true;
}
