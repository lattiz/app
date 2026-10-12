/** Terminal output: colors (off without a TTY, with NO_COLOR or --no-color), status marks and tables. */

const CODES = {
  bold: [1, 22],
  dim: [2, 22],
  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39],
  magenta: [35, 39],
  cyan: [36, 39],
  gray: [90, 39],
} as const;
type Color = keyof typeof CODES;

let colorEnabled =
  process.env.FORCE_COLOR !== undefined
    ? process.env.FORCE_COLOR !== '0'
    : Boolean(process.stdout.isTTY) && process.env.NO_COLOR === undefined;

export function setColor(enabled: boolean): void {
  colorEnabled = enabled;
}

export function paint(color: Color, text: string): string {
  if (!colorEnabled) return text;
  const [open, close] = CODES[color];
  return `\x1b[${open}m${text}\x1b[${close}m`;
}

export const c = Object.fromEntries(
  (Object.keys(CODES) as Color[]).map((k) => [k, (t: string) => paint(k, t)]),
) as Record<Color, (text: string) => string>;

// eslint-disable-next-line no-control-regex
const ANSI_RE = /\x1b\[[0-9;]*m/g;
export function visibleLength(text: string): number {
  return text.replace(ANSI_RE, '').length;
}

export type Status = 'PASS' | 'WARN' | 'FAIL' | 'N/A' | 'INFO';

export function badge(status: Status): string {
  switch (status) {
    case 'PASS':
      return c.green('PASS');
    case 'WARN':
      return c.yellow('WARN');
    case 'FAIL':
      return c.red(c.bold('FAIL'));
    case 'INFO':
      return c.blue('INFO');
    default:
      return c.gray('N/A');
  }
}

export const log = {
  title(text: string): void {
    console.log(`\n${c.bold(c.cyan(`▸ ${text}`))}`);
  },
  ok(text: string): void {
    console.log(`${c.green('✓')} ${text}`);
  },
  warn(text: string): void {
    console.log(`${c.yellow('!')} ${text}`);
  },
  fail(text: string): void {
    console.error(`${c.red('✗')} ${text}`);
  },
  info(text: string): void {
    console.log(`${c.blue('·')} ${text}`);
  },
  hint(text: string): void {
    console.log(`  ${c.gray('→')} ${c.gray(text)}`);
  },
  plain(text = ''): void {
    console.log(text);
  },
};

/** Fixed-width table; cells may carry color codes. */
export function table(head: string[], rows: string[][], indent = '  '): string {
  const widths = head.map((h, i) =>
    Math.max(visibleLength(h), ...rows.map((r) => visibleLength(r[i] ?? ''))),
  );
  const line = (cells: string[]) =>
    indent +
    cells
      .map((cell, i) => cell + ' '.repeat(widths[i] - visibleLength(cell)))
      .join('  ')
      .trimEnd();
  return [
    line(head.map((h) => c.bold(h))),
    indent + widths.map((w) => '─'.repeat(w)).join('  '),
    ...rows.map(line),
  ].join('\n');
}

/** A boxed list of key/value lines, used before every remote write. */
export function plan(title: string, lines: [string, string][]): string {
  const width = Math.max(...lines.map(([k]) => k.length));
  return [
    c.bold(title),
    ...lines.map(([k, v]) => `  ${c.gray(k.padEnd(width))}  ${v}`),
  ].join('\n');
}

export function duration(ms: number): string {
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`;
}
