import * as p from '@clack/prompts';
import { usage } from './errors';

/** Interactive only with a TTY and without --yes/--non-interactive; every prompt has a flag. */
export interface PromptMode {
  yes: boolean;
  nonInteractive: boolean;
}

export function interactive(mode: PromptMode): boolean {
  return !mode.yes && !mode.nonInteractive && Boolean(process.stdin.isTTY);
}

function cancelled(): never {
  p.cancel('Cancelado.');
  process.exit(130);
}

/** Remote writes: --yes skips; without a TTY and without --yes it refuses. */
export async function confirm(mode: PromptMode, message: string): Promise<boolean> {
  if (mode.yes) return true;
  if (!interactive(mode))
    throw usage(`Se necesita confirmación: ${message}`, 'Vuelve a correr con --yes para confirmar sin preguntar.');
  const answer = await p.confirm({ message, initialValue: false });
  if (p.isCancel(answer)) cancelled();
  return answer;
}

export async function select<T extends string>(
  mode: PromptMode,
  opts: { message: string; flag: string; value?: T; options: { value: T; label: string; hint?: string }[]; initial?: T },
): Promise<T> {
  if (opts.value !== undefined) {
    if (!opts.options.some((o) => o.value === opts.value))
      throw usage(`Valor inválido para --${opts.flag}: "${opts.value}".`, `Opciones: ${opts.options.map((o) => o.value).join(', ')}`);
    return opts.value;
  }
  if (!interactive(mode)) {
    if (opts.initial !== undefined) return opts.initial;
    throw usage(`Falta --${opts.flag}.`, `Opciones: ${opts.options.map((o) => o.value).join(', ')}`);
  }
  const answer = await p.select({
    message: opts.message,
    options: opts.options as Parameters<typeof p.select<T>>[0]['options'],
    initialValue: opts.initial,
  });
  if (p.isCancel(answer)) cancelled();
  return answer;
}

export async function text(
  mode: PromptMode,
  opts: { message: string; flag: string; value?: string; initial?: string; validate?: (v: string) => string | undefined },
): Promise<string> {
  const check = (v: string) => {
    const problem = opts.validate?.(v);
    if (problem) throw usage(`--${opts.flag}: ${problem}`);
    return v;
  };
  if (opts.value !== undefined) return check(opts.value);
  if (!interactive(mode)) {
    if (opts.initial !== undefined) return check(opts.initial);
    throw usage(`Falta --${opts.flag}.`);
  }
  const answer = await p.text({
    message: opts.message,
    initialValue: opts.initial,
    validate: (v) => opts.validate?.(v ?? ''),
  });
  if (p.isCancel(answer)) cancelled();
  return answer;
}
