export interface ParsedArgs {
  positional: string[];
  flags: Map<string, string>;
}

/** `--key value`, `--key=value` and bare `--flag` (stored as "true"). */
export function parseArgs(argv: string[]): ParsedArgs {
  const positional: string[] = [];
  const flags = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      positional.push(token);
      continue;
    }
    const eq = token.indexOf('=');
    if (eq !== -1) {
      flags.set(token.slice(2, eq), token.slice(eq + 1));
      continue;
    }
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) {
      flags.set(token.slice(2), next);
      i += 1;
    } else flags.set(token.slice(2), 'true');
  }
  return { positional, flags };
}

export class KitError extends Error {}

/** Runs a CLI entry point, printing KitErrors without a stack trace. */
export function runCli(main: () => Promise<void>): void {
  main().catch((error: unknown) => {
    if (error instanceof KitError) console.error(`\n✗ ${error.message}`);
    else console.error(error);
    process.exit(1);
  });
}
