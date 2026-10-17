/**
 * Alta, cambio de rol, revocación y listado de admin.members.
 * Los ids de auth.users no van en migraciones: el primer owner se crea aquí.
 * Ejecutar: `pnpm --filter @lattiz/api admin:grant -- --help`
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { parseEnv } from 'node:util';
import postgres, { type Sql, type TransactionSql } from 'postgres';

export const LOCAL_DATABASE_URL =
  'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

const ROLES = ['owner', 'operator', 'viewer'] as const;

export type AdminRole = (typeof ROLES)[number];

export type ParsedCommand =
  | { kind: 'help' }
  | { kind: 'list'; local: boolean }
  | {
      kind: 'grant';
      email: string;
      role: AdminRole;
      by?: string;
      local: boolean;
      yes: boolean;
    }
  | { kind: 'revoke'; email: string; local: boolean; yes: boolean };

export type ParseResult =
  | { ok: true; command: ParsedCommand }
  | { ok: false; message: string };

export interface ResolvedDatabase {
  url: string;
  line: string;
}

export type ResolveResult =
  | { ok: true; database: ResolvedDatabase }
  | { ok: false; message: string };

export type Confirmation =
  | { action: 'skip' }
  | { action: 'ask'; prompt: string }
  | { action: 'refuse'; message: string };

export interface MemberListRow {
  email: string;
  role: string;
  createdAt: Date | string;
  revokedAt: Date | string | null;
}

const VALUE_FLAGS = ['email', 'role', 'by'] as const;
const BOOLEAN_FLAGS = ['local', 'yes'] as const;

type ValueFlag = (typeof VALUE_FLAGS)[number];
type BooleanFlag = (typeof BOOLEAN_FLAGS)[number];

class OperationError extends Error {
  readonly exitCode: 1 | 2;

  constructor(exitCode: 1 | 2, message: string) {
    super(message);
    this.name = 'OperationError';
    this.exitCode = exitCode;
  }
}

export function usageText(): string {
  return [
    'Uso:',
    '  admin:grant grant --email <correo> --role owner|operator|viewer [--by <correo>] [--local] [--yes]',
    '  admin:grant revoke --email <correo> [--local] [--yes]',
    '  admin:grant list [--local]',
    '  admin:grant --help',
    '',
    'Da de alta, cambia el rol, revoca o lista miembros de admin.members.',
    'Al dar de alta, el tenant de esa persona queda marcado como interno.',
    '',
    '  --email   Correo del miembro. Tiene que existir ya en la app.',
    '  --role    owner, operator o viewer.',
    '  --by      Correo de quien otorga el alta (created_by).',
    '  --local   Base local de Supabase (127.0.0.1:54322). No pide confirmación.',
    '  --yes     Confirma sin preguntar. Obligatorio sin terminal interactiva, salvo --local.',
    '',
    'Códigos de salida: 0 correcto, 1 no encontrado o fallo de base de datos, 2 uso o entorno.',
  ].join('\n');
}

export function parseArgs(argv: string[]): ParseResult {
  const values = new Map<ValueFlag, string>();
  const booleans = new Set<BooleanFlag>();
  const positionals: string[] = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--') continue;
    if (arg === '--help' || arg === '-h' || arg === 'help') {
      return { ok: true, command: { kind: 'help' } };
    }
    if (arg.startsWith('--')) {
      const name = arg.slice(2);
      if (isBooleanFlag(name)) {
        if (booleans.has(name))
          return usageError(`Opción repetida: --${name}.`);
        booleans.add(name);
        continue;
      }
      if (!isValueFlag(name))
        return usageError(`Opción desconocida: --${name}.`);
      if (values.has(name)) return usageError(`Opción repetida: --${name}.`);
      const value = argv[index + 1];
      if (value === undefined || value.startsWith('--')) {
        return usageError(`Falta el valor de --${name}.`);
      }
      values.set(name, value);
      index += 1;
      continue;
    }
    if (arg.startsWith('-')) return usageError(`Opción desconocida: ${arg}.`);
    positionals.push(arg);
  }

  if (positionals.length === 0) return usageError('Falta el subcomando.');
  if (positionals.length > 1)
    return usageError('Solo se admite un subcomando.');

  const [subcommand] = positionals;
  const local = booleans.has('local');
  const yes = booleans.has('yes');

  if (subcommand === 'list') {
    const extra = firstExtra(values, booleans, [], false);
    if (extra) return usageError(`${extra} no aplica a list.`);
    return { ok: true, command: { kind: 'list', local } };
  }

  if (subcommand === 'grant') {
    const extra = firstExtra(values, booleans, ['email', 'role', 'by'], true);
    if (extra) return usageError(`${extra} no aplica a grant.`);
    const email = requiredEmail(values.get('email'), '--email');
    if (typeof email !== 'string') return email;
    const role = values.get('role')?.trim();
    if (!role) return usageError('Falta --role.');
    if (!isAdminRole(role)) {
      return usageError(
        `Rol no válido: ${role}. Usa owner, operator o viewer.`,
      );
    }
    const byRaw = values.get('by');
    let by: string | undefined;
    if (byRaw !== undefined) {
      const parsedBy = requiredEmail(byRaw, '--by');
      if (typeof parsedBy !== 'string') return parsedBy;
      by = parsedBy;
    }
    return {
      ok: true,
      command: { kind: 'grant', email, role, by, local, yes },
    };
  }

  if (subcommand === 'revoke') {
    const extra = firstExtra(values, booleans, ['email'], true);
    if (extra) return usageError(`${extra} no aplica a revoke.`);
    const email = requiredEmail(values.get('email'), '--email');
    if (typeof email !== 'string') return email;
    return { ok: true, command: { kind: 'revoke', email, local, yes } };
  }

  return usageError(`Subcomando desconocido: ${subcommand}.`);
}

export function databaseUrlFromEnvText(text: string): string | undefined {
  const value = parseEnv(text).DATABASE_URL;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function databaseUrlFromEnvFile(filePath: string): string | undefined {
  if (!existsSync(filePath)) return undefined;
  return databaseUrlFromEnvText(readFileSync(filePath, 'utf8'));
}

export function resolveDatabase(input: {
  local: boolean;
  shellUrl: string | undefined;
  fileUrl: string | undefined;
}): ResolveResult {
  if (input.local) {
    return {
      ok: true,
      database: { url: LOCAL_DATABASE_URL, line: 'Base de datos: local' },
    };
  }

  const shellUrl = blankToUndefined(input.shellUrl);
  if (shellUrl) return describeDatabase('shell', shellUrl);
  const fileUrl = blankToUndefined(input.fileUrl);
  if (fileUrl) return describeDatabase('apps/api/.env', fileUrl);

  return {
    ok: false,
    message:
      'No hay DATABASE_URL en el entorno ni en apps/api/.env. Pasa --local para usar Supabase local.',
  };
}

export function decideConfirmation(input: {
  kind: ParsedCommand['kind'];
  local: boolean;
  yes: boolean;
  interactive: boolean;
}): Confirmation {
  if (
    input.kind === 'help' ||
    input.kind === 'list' ||
    input.local ||
    input.yes
  ) {
    return { action: 'skip' };
  }
  if (input.interactive) return { action: 'ask', prompt: '¿Continuar? (s/N) ' };
  return {
    action: 'refuse',
    message:
      'Esta terminal no es interactiva. Añade --yes para confirmar, o usa --local.',
  };
}

export function planText(
  command: Extract<ParsedCommand, { kind: 'grant' | 'revoke' }>,
): string {
  if (command.kind === 'revoke') {
    return `Se revocará el acceso de ${command.email} (revoked_at = ahora). La fila no se borra y tenant_flags no cambia.`;
  }
  const by = command.by ? `, otorgado por ${command.by}` : '';
  return `Se dará de alta a ${command.email} con el rol ${command.role}${by}. Si tiene tenant, quedará marcado como interno.`;
}

export function formatMemberTable(rows: MemberListRow[]): string {
  if (rows.length === 0) return 'No hay miembros.';
  const header = ['email', 'rol', 'alta', 'revocado'];
  const body = rows.map((row) => [
    row.email,
    row.role,
    formatTimestamp(row.createdAt),
    row.revokedAt == null ? '—' : formatTimestamp(row.revokedAt),
  ]);
  const widths = header.map((label, index) =>
    Math.max(label.length, ...body.map((cells) => cells[index].length)),
  );
  const render = (cells: string[]) =>
    cells.map((cell, index) => cell.padEnd(widths[index])).join('  ');
  return [render(header), ...body.map(render)].join('\n');
}

function usageError(detail: string): ParseResult {
  return { ok: false, message: `${detail}\n\n${usageText()}` };
}

function requiredEmail(
  value: string | undefined,
  flag: '--email' | '--by',
): string | ParseResult {
  const email = value?.trim();
  if (!email) return usageError(`Falta ${flag}.`);
  if (/\s/.test(email)) return usageError(`${flag} no puede tener espacios.`);
  return email;
}

function firstExtra(
  values: Map<ValueFlag, string>,
  booleans: Set<BooleanFlag>,
  allowedValues: readonly ValueFlag[],
  allowYes: boolean,
): string | undefined {
  for (const name of values.keys()) {
    if (!allowedValues.includes(name)) return `--${name}`;
  }
  if (booleans.has('yes') && !allowYes) return '--yes';
  return undefined;
}

function isValueFlag(name: string): name is ValueFlag {
  return (VALUE_FLAGS as readonly string[]).includes(name);
}

function isBooleanFlag(name: string): name is BooleanFlag {
  return (BOOLEAN_FLAGS as readonly string[]).includes(name);
}

function isAdminRole(value: string): value is AdminRole {
  return (ROLES as readonly string[]).includes(value);
}

function blankToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function describeDatabase(
  origin: 'shell' | 'apps/api/.env',
  url: string,
): ResolveResult {
  let host = '';
  try {
    host = new URL(url).hostname;
  } catch {
    return { ok: false, message: 'DATABASE_URL no es una URL válida.' };
  }
  if (!host) return { ok: false, message: 'DATABASE_URL no tiene host.' };
  return {
    ok: true,
    database: {
      url,
      line: `Base de datos: DATABASE_URL (origen: ${origin}), host ${host}`,
    },
  };
}

function formatTimestamp(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toISOString();
}

interface UserRow {
  id: string;
  email: string;
}

async function findUsers(
  sql: TransactionSql,
  email: string,
): Promise<UserRow[]> {
  return sql<UserRow[]>`
    SELECT id::text AS id, email
    FROM auth.users
    WHERE email IS NOT NULL AND lower(email) = lower(${email})
  `;
}

async function requireUser(
  sql: TransactionSql,
  email: string,
  label: string,
): Promise<UserRow> {
  const users = await findUsers(sql, email);
  if (users.length === 0) {
    throw new OperationError(
      1,
      `No existe ${label}: el usuario debe registrarse primero en la app.`,
    );
  }
  if (users.length > 1) {
    throw new OperationError(
      1,
      `Hay más de un usuario con el correo ${email}.`,
    );
  }
  const user = users[0];
  if (!user) {
    throw new OperationError(
      1,
      `No existe ${label}: el usuario debe registrarse primero en la app.`,
    );
  }
  return user;
}

async function runGrant(
  sql: Sql,
  command: Extract<ParsedCommand, { kind: 'grant' }>,
): Promise<void> {
  const outcome = await sql.begin(async (tx) => {
    const user = await requireUser(tx, command.email, command.email);
    const actor = command.by
      ? await requireUser(tx, command.by, `el usuario de --by (${command.by})`)
      : undefined;

    await tx`
      INSERT INTO admin.members (user_id, role, created_by, revoked_at)
      VALUES (
        ${user.id}::uuid,
        ${command.role},
        ${actor?.id ?? null}::uuid,
        NULL
      )
      ON CONFLICT (user_id) DO UPDATE
      SET role = EXCLUDED.role,
          revoked_at = NULL,
          created_by = COALESCE(EXCLUDED.created_by, admin.members.created_by)
    `;

    const tenants = await tx<{ id: string }[]>`
      SELECT id::text AS id
      FROM public.tenants
      WHERE user_id = ${user.id}::uuid
    `;
    const tenant = tenants[0];
    if (!tenant) return { email: user.email, internal: false };

    await tx`
      INSERT INTO admin.tenant_flags (tenant_id, is_internal, updated_by)
      VALUES (${tenant.id}::uuid, true, ${actor?.id ?? null}::uuid)
      ON CONFLICT (tenant_id) DO UPDATE
      SET is_internal = true,
          updated_by = COALESCE(EXCLUDED.updated_by, admin.tenant_flags.updated_by)
    `;
    return { email: user.email, internal: true };
  });

  const tenantNote = outcome.internal
    ? 'Tenant interno: sí.'
    : 'Sin tenant; no se actualizó tenant_flags.';
  console.log(`Listo: ${outcome.email} es ${command.role}. ${tenantNote}`);
}

async function runRevoke(
  sql: Sql,
  command: Extract<ParsedCommand, { kind: 'revoke' }>,
): Promise<void> {
  const updated = await sql<{ email: string }[]>`
    UPDATE admin.members AS m
    SET revoked_at = now()
    FROM auth.users AS u
    WHERE m.user_id = u.id
      AND u.email IS NOT NULL
      AND lower(u.email) = lower(${command.email})
    RETURNING u.email
  `;
  const row = updated[0];
  if (!row) {
    throw new OperationError(1, 'No hay un miembro admin con ese correo.');
  }
  console.log(`Listo: se revocó ${row.email}.`);
}

async function runList(sql: Sql): Promise<void> {
  const rows = await sql<
    {
      email: string;
      role: string;
      created_at: Date | string;
      revoked_at: Date | string | null;
    }[]
  >`
    SELECT u.email, m.role, m.created_at, m.revoked_at
    FROM admin.members AS m
    JOIN auth.users AS u ON u.id = m.user_id
    ORDER BY m.created_at ASC, u.email ASC
  `;
  console.log(
    formatMemberTable(
      rows.map((row) => ({
        email: row.email,
        role: row.role,
        createdAt: row.created_at,
        revokedAt: row.revoked_at,
      })),
    ),
  );
}

async function confirm(prompt: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = (await rl.question(prompt)).trim().toLowerCase();
    return answer === 's';
  } finally {
    rl.close();
  }
}

function databaseFailureMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = error.code;
    if (typeof code === 'string' && /^[0-9A-Z]{5}$/.test(code)) {
      return `Error de base de datos (${code}).`;
    }
  }
  return 'Error de base de datos.';
}

async function flushStdout(): Promise<void> {
  if (!process.stdout.writable) return;
  await new Promise<void>((resolve) => {
    process.stdout.write('', () => resolve());
  });
}

function invokedDirectly(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  const base = path.basename(entry);
  return base === 'admin-grant.ts' || base === 'admin-grant.js';
}

async function main(): Promise<void> {
  let sql: Sql | undefined;
  let code = 0;
  try {
    const parsed = parseArgs(process.argv.slice(2));
    if (!parsed.ok) {
      console.error(parsed.message);
      code = 2;
      return;
    }
    if (parsed.command.kind === 'help') {
      console.log(usageText());
      return;
    }

    const command = parsed.command;
    const confirmation = decideConfirmation({
      kind: command.kind,
      local: command.local,
      yes: command.kind === 'list' ? false : command.yes,
      interactive: Boolean(process.stdin.isTTY && process.stdout.isTTY),
    });
    if (confirmation.action === 'refuse') {
      console.error(confirmation.message);
      code = 2;
      return;
    }
    if (confirmation.action === 'ask' && command.kind !== 'list') {
      console.log(planText(command));
      const accepted = await confirm(confirmation.prompt);
      if (!accepted) {
        console.log('Cancelado.');
        return;
      }
    } else if (command.kind !== 'list') {
      console.log(planText(command));
    }

    const resolved = resolveDatabase({
      local: command.local,
      shellUrl: command.local ? undefined : process.env.DATABASE_URL,
      fileUrl: command.local
        ? undefined
        : databaseUrlFromEnvFile(path.resolve(__dirname, '../.env')),
    });
    if (!resolved.ok) {
      console.error(resolved.message);
      code = 2;
      return;
    }

    console.log(resolved.database.line);
    sql = postgres(resolved.database.url, { max: 1, connect_timeout: 10 });
    if (command.kind === 'list') await runList(sql);
    else if (command.kind === 'grant') await runGrant(sql, command);
    else await runRevoke(sql, command);
  } catch (error) {
    if (error instanceof OperationError) {
      console.error(error.message);
      code = error.exitCode;
    } else {
      console.error(databaseFailureMessage(error));
      code = 1;
    }
  } finally {
    process.exitCode = code;
    if (sql) await sql.end({ timeout: 5 });
    await flushStdout();
  }
}

if (invokedDirectly()) {
  void main();
}
