/** 0 ok · 1 a gate failed (check, verification) · 2 usage or environment problem. */
export const EXIT = { OK: 0, GATE: 1, USAGE: 2 } as const;
export type ExitCode = (typeof EXIT)[keyof typeof EXIT];

export class CliError extends Error {
  constructor(
    message: string,
    readonly code: ExitCode = EXIT.USAGE,
    readonly hint?: string,
  ) {
    super(message);
  }
}

export const usage = (message: string, hint?: string) =>
  new CliError(message, EXIT.USAGE, hint);
export const gate = (message: string, hint?: string) =>
  new CliError(message, EXIT.GATE, hint);
