import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  LOCAL_DATABASE_URL,
  databaseUrlFromEnvText,
  decideConfirmation,
  formatMemberTable,
  parseArgs,
  resolveDatabase,
} from './admin-grant';

const SECRET_URL =
  'postgresql://secretuser:secretpass@db.example.com:6543/postgres';

describe('parseArgs', () => {
  it('pide un subcomando y muestra la ayuda', () => {
    const result = parseArgs([]);
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.match(result.message, /Falta el subcomando/);
    assert.match(result.message, /Códigos de salida/);
  });

  it('acepta --help, -h y help', () => {
    for (const argv of [['--help'], ['-h'], ['help'], ['grant', '--help']]) {
      const result = parseArgs(argv);
      assert.equal(result.ok, true);
      if (!result.ok) return;
      assert.equal(result.command.kind, 'help');
    }
  });

  it('rechaza un subcomando desconocido y las opciones repetidas', () => {
    const unknown = parseArgs(['borrar']);
    assert.equal(unknown.ok, false);
    if (unknown.ok) return;
    assert.match(unknown.message, /Subcomando desconocido: borrar/);

    const repeated = parseArgs([
      'grant',
      '--email',
      'a@b.test',
      '--email',
      'c@d.test',
      '--role',
      'owner',
    ]);
    assert.equal(repeated.ok, false);
    if (repeated.ok) return;
    assert.match(repeated.message, /Opción repetida: --email/);
  });

  it('exige email y un rol del conjunto en grant', () => {
    const missingEmail = parseArgs(['grant', '--role', 'owner']);
    assert.equal(missingEmail.ok, false);
    if (!missingEmail.ok) assert.match(missingEmail.message, /Falta --email/);

    const missingRole = parseArgs(['grant', '--email', 'a@b.test']);
    assert.equal(missingRole.ok, false);
    if (!missingRole.ok) assert.match(missingRole.message, /Falta --role/);

    const badRole = parseArgs([
      'grant',
      '--email',
      'a@b.test',
      '--role',
      'admin',
    ]);
    assert.equal(badRole.ok, false);
    if (!badRole.ok) assert.match(badRole.message, /Rol no válido: admin/);

    const missingValue = parseArgs(['grant', '--email', '--role', 'owner']);
    assert.equal(missingValue.ok, false);
    if (!missingValue.ok)
      assert.match(missingValue.message, /Falta el valor de --email/);
  });

  it('parsea grant, revoke y list con banderas en cualquier orden', () => {
    const grant = parseArgs([
      '--local',
      'grant',
      '--role',
      'viewer',
      '--by',
      'Boss@Example.test',
      '--yes',
      '--email',
      'Ana@Example.test',
    ]);
    assert.deepEqual(grant, {
      ok: true,
      command: {
        kind: 'grant',
        email: 'Ana@Example.test',
        role: 'viewer',
        by: 'Boss@Example.test',
        local: true,
        yes: true,
      },
    });

    const revoke = parseArgs(['revoke', '--email', 'ana@example.test']);
    assert.deepEqual(revoke, {
      ok: true,
      command: {
        kind: 'revoke',
        email: 'ana@example.test',
        local: false,
        yes: false,
      },
    });

    const list = parseArgs(['--local', 'list']);
    assert.deepEqual(list, {
      ok: true,
      command: { kind: 'list', local: true },
    });
  });

  it('rechaza banderas que no aplican al subcomando', () => {
    const list = parseArgs(['list', '--yes']);
    assert.equal(list.ok, false);
    if (!list.ok) assert.match(list.message, /--yes no aplica a list/);

    const revoke = parseArgs([
      'revoke',
      '--email',
      'a@b.test',
      '--role',
      'owner',
    ]);
    assert.equal(revoke.ok, false);
    if (!revoke.ok) assert.match(revoke.message, /--role no aplica a revoke/);
  });
});

describe('resolveDatabase', () => {
  it('con --local ignora el entorno y no describe credenciales', () => {
    const result = resolveDatabase({
      local: true,
      shellUrl: SECRET_URL,
      fileUrl: SECRET_URL,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.database.url, LOCAL_DATABASE_URL);
    assert.equal(result.database.line, 'Base de datos: local');
    assert.equal(result.database.line.includes('secret'), false);
  });

  it('prefiere DATABASE_URL del shell y solo publica el host', () => {
    const result = resolveDatabase({
      local: false,
      shellUrl: `  ${SECRET_URL}  `,
      fileUrl: 'postgresql://fileuser:filepass@file.example.com/postgres',
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.database.url, SECRET_URL);
    assert.equal(
      result.database.line,
      'Base de datos: DATABASE_URL (origen: shell), host db.example.com',
    );
    assert.equal(result.database.line.includes('secret'), false);
  });

  it('usa el archivo solo si el shell no trae la clave', () => {
    const fileUrl = 'postgresql://fileuser:filepass@file.example.com/postgres';
    const result = resolveDatabase({
      local: false,
      shellUrl: '   ',
      fileUrl,
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.database.url, fileUrl);
    assert.equal(
      result.database.line,
      'Base de datos: DATABASE_URL (origen: apps/api/.env), host file.example.com',
    );
  });

  it('falla con código de uso cuando no hay ninguna URL, sin filtrar el valor', () => {
    const missing = resolveDatabase({
      local: false,
      shellUrl: undefined,
      fileUrl: undefined,
    });
    assert.equal(missing.ok, false);
    if (missing.ok) return;
    assert.match(missing.message, /No hay DATABASE_URL/);
    assert.equal(missing.message.includes('postgresql://'), false);

    const invalid = resolveDatabase({
      local: false,
      shellUrl: 'no-es-una-url',
      fileUrl: undefined,
    });
    assert.equal(invalid.ok, false);
    if (invalid.ok) return;
    assert.equal(invalid.message, 'DATABASE_URL no es una URL válida.');
    assert.equal(invalid.message.includes('no-es-una-url'), false);
  });
});

describe('databaseUrlFromEnvText', () => {
  it('lee solo DATABASE_URL y no carga el resto en el entorno', () => {
    const before = process.env.DATABASE_URL;
    const other = process.env.ADMIN_GRANT_SHOULD_NOT_EXIST;
    const url = databaseUrlFromEnvText(
      [
        '# comentario',
        'OTHER_SECRET=no-cargar',
        'DATABASE_URL="postgresql://user:pass@env.example.com/postgres"',
        'ADMIN_GRANT_SHOULD_NOT_EXIST=filtrado',
      ].join('\n'),
    );
    assert.equal(url, 'postgresql://user:pass@env.example.com/postgres');
    assert.equal(process.env.DATABASE_URL, before);
    assert.equal(process.env.ADMIN_GRANT_SHOULD_NOT_EXIST, other);
    assert.equal(databaseUrlFromEnvText('OTHER_SECRET=x\n'), undefined);
  });
});

describe('decideConfirmation', () => {
  it('no pregunta con --local, --yes, list o help', () => {
    assert.equal(
      decideConfirmation({
        kind: 'grant',
        local: true,
        yes: false,
        interactive: false,
      }).action,
      'skip',
    );
    assert.equal(
      decideConfirmation({
        kind: 'revoke',
        local: false,
        yes: true,
        interactive: false,
      }).action,
      'skip',
    );
    assert.equal(
      decideConfirmation({
        kind: 'list',
        local: false,
        yes: false,
        interactive: false,
      }).action,
      'skip',
    );
  });

  it('pregunta en una terminal y se niega si no hay TTY ni --yes', () => {
    const ask = decideConfirmation({
      kind: 'grant',
      local: false,
      yes: false,
      interactive: true,
    });
    assert.equal(ask.action, 'ask');
    if (ask.action === 'ask') assert.match(ask.prompt, /s\/N/);

    const refuse = decideConfirmation({
      kind: 'revoke',
      local: false,
      yes: false,
      interactive: false,
    });
    assert.equal(refuse.action, 'refuse');
    if (refuse.action === 'refuse') assert.match(refuse.message, /--yes/);
  });
});

describe('formatMemberTable', () => {
  it('alinea email, rol, alta y revocado', () => {
    const table = formatMemberTable([
      {
        email: 'ana@example.test',
        role: 'owner',
        createdAt: '2026-10-17T12:00:00.000Z',
        revokedAt: null,
      },
    ]);
    assert.match(table, /^email\s+rol\s+alta\s+revocado/);
    assert.match(
      table,
      /ana@example\.test\s+owner\s+2026-10-17T12:00:00\.000Z\s+—/,
    );
    assert.equal(formatMemberTable([]), 'No hay miembros.');
  });
});
