/**
 * pnpm lattiz <comando> — from a template-kit template to templates.lattiz.app.
 * Commands live in ./commands; docs/lattiz-cli.md is the guide.
 */
import { parseArgs } from 'node:util';
import { check } from './commands/check';
import { deploy } from './commands/deploy';
import { dev } from './commands/dev';
import { doctor } from './commands/doctor';
import { list } from './commands/list';
import { motion } from './commands/motion';
import { newTemplate } from './commands/new';
import { publish, ship } from './commands/publish';
import { seed } from './commands/seed';
import { type Command, GLOBAL_OPTIONS } from './lib/command';
import { CliError, EXIT, type ExitCode } from './lib/errors';
import { env } from './lib/remote';
import { c, log, setColor } from './lib/ui';

const COMMANDS: Command[] = [
  doctor,
  list,
  newTemplate,
  dev,
  motion,
  check,
  seed,
  deploy,
  publish,
  ship,
];

function globalHelp(): string {
  const width = Math.max(...COMMANDS.map((cmd) => cmd.usage.length));
  return [
    `${c.bold('Lattiz CLI')} — de una plantilla del template-kit a ${c.cyan('templates.lattiz.app')}`,
    '',
    `${c.bold('Uso:')} pnpm lattiz <comando> [opciones]`,
    '',
    c.bold('Comandos:'),
    ...COMMANDS.map(
      (cmd) => `  ${cmd.usage.padEnd(width)}  ${c.gray(cmd.summary)}`,
    ),
    '',
    c.bold('Opciones globales:'),
    '  -h, --help           ayuda del comando',
    '  -y, --yes            confirma todo sin preguntar (escrituras remotas incluidas)',
    '  --non-interactive    nunca pregunta; usa flags o valores por defecto y falla si falta algo',
    '  --no-color           salida sin colores',
    '',
    c.bold('Códigos de salida:') +
      ' 0 ok · 1 falló una verificación · 2 uso o entorno',
    '',
    `Flujo de venta: doctor → new → dev → motion → check → publish (o ship). Guía: ${c.cyan('docs/lattiz-cli.md')}`,
  ].join('\n');
}

function commandHelp(cmd: Command): string {
  return [
    `${c.bold('Uso:')} pnpm lattiz ${cmd.usage}`,
    '',
    cmd.summary,
    ...(cmd.help.length > 0 ? ['', ...cmd.help] : []),
    ...(cmd.aliases?.length
      ? ['', `${c.bold('Alias:')} ${cmd.aliases.join(', ')}`]
      : []),
  ].join('\n');
}

async function main(argv: string[]): Promise<ExitCode> {
  const args = argv.filter((a) => a !== '--');
  if (args.includes('--no-color')) setColor(false);
  const [name, ...rest] = args;
  if (!name || name === '--help' || name === '-h' || name === 'help') {
    console.log(globalHelp());
    return name ? EXIT.OK : EXIT.USAGE;
  }
  const cmd = COMMANDS.find(
    (x) => x.name === name || x.aliases?.includes(name),
  );
  if (!cmd) {
    log.fail(`Comando desconocido: ${name}`);
    console.log(`\n${globalHelp()}`);
    return EXIT.USAGE;
  }
  let parsed;
  try {
    parsed = parseArgs({
      args: rest,
      options: { ...GLOBAL_OPTIONS, ...cmd.options },
      allowPositionals: true,
      strict: true,
    });
  } catch (error) {
    const { code, message } = error as NodeJS.ErrnoException;
    const option = /'(-[^']+)'/.exec(message)?.[1] ?? '';
    log.fail(
      code === 'ERR_PARSE_ARGS_UNKNOWN_OPTION'
        ? `Opción desconocida: ${option}`
        : code === 'ERR_PARSE_ARGS_INVALID_OPTION_VALUE'
          ? `Valor inválido para ${option || 'una opción'} (¿falta el valor?)`
          : message.split('\n')[0],
    );
    console.log(`\n${commandHelp(cmd)}`);
    return EXIT.USAGE;
  }
  const flags = parsed.values as Record<string, string | boolean | undefined>;
  if (flags.help) {
    console.log(commandHelp(cmd));
    return EXIT.OK;
  }
  // Same .env files as the seed (also where LATTIZ_CHROMIUM_PATH can live).
  env();
  return cmd.run({
    positionals: parsed.positionals,
    flags,
    yes: flags.yes === true,
    nonInteractive: flags['non-interactive'] === true,
  });
}

main(process.argv.slice(2))
  .then((code) => process.exit(code))
  .catch((error: unknown) => {
    if (error instanceof CliError) {
      log.fail(error.message);
      if (error.hint) log.hint(error.hint);
      process.exit(error.code);
    }
    console.error(error);
    process.exit(EXIT.USAGE);
  });
