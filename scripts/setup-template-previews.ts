/**
 * Idempotent bootstrap of the `template-previews` Vercel project (apps/template-previews).
 * Safe to re-run: every step checks before it creates.
 *
 *   vercel login            # once, or export VERCEL_TOKEN
 *   [VERCEL_SCOPE=<team-slug-or-id>] [TEMPLATE_PREVIEWS_DOMAIN=templates.lattiz.app] \
 *   pnpm tsx scripts/setup-template-previews.ts
 *
 * Prints the value for TEMPLATE_PREVIEWS_BASE_URL; it never writes .env files.
 */
import {
  lastLine,
  TEMPLATE_PREVIEWS_DIR as PROJECT_DIR,
  TEMPLATE_PREVIEWS_PROJECT as PROJECT,
  vercel,
} from './lib/vercel-cli';

function step(label: string): void {
  console.log(`\n▶ ${label}`);
}

function fail(message: string): never {
  console.error(`\n✗ ${message}`);
  process.exit(1);
}

/** The shortest *.vercel.app alias of a deployment is the project's stable production alias. */
function stableAlias(deploymentUrl: string): string | null {
  const inspect = vercel(['inspect', deploymentUrl]);
  const text = `${inspect.stdout}\n${inspect.stderr}`;
  const deploymentHost = new URL(deploymentUrl).host;
  const aliases = [...text.matchAll(/https:\/\/([a-z0-9.-]+\.vercel\.app)/g)]
    .map((m) => m[1])
    .filter((host) => host !== deploymentHost && !host.includes('-git-'));
  aliases.sort((a, b) => a.length - b.length);
  return aliases[0] ? `https://${aliases[0]}` : null;
}

function main(): void {
  step('Checking the Vercel CLI');
  const version = vercel(['--version']);
  if (!version.ok)
    fail('Vercel CLI not found. Install it with `pnpm add -g vercel`.');
  console.log(`  ✓ ${lastLine(version.stdout || version.stderr)}`);

  const whoami = vercel(['whoami']);
  if (!whoami.ok)
    fail(
      'Not authenticated. Run `vercel login` (or export VERCEL_TOKEN) and retry.',
    );
  console.log(
    `  ✓ Logged in as ${lastLine(whoami.stdout)}${process.env.VERCEL_SCOPE ? ` (scope ${process.env.VERCEL_SCOPE})` : ''}`,
  );

  step(`Ensuring project "${PROJECT}" exists`);
  if (vercel(['project', 'inspect', PROJECT]).ok) {
    console.log('  ✓ Already exists');
  } else {
    const add = vercel(['project', 'add', PROJECT]);
    if (!add.ok)
      fail(`Could not create the project:\n${add.stderr || add.stdout}`);
    console.log('  ✓ Created');
  }

  step(`Linking ${PROJECT_DIR}`);
  const link = vercel(['link', '--yes', '--project', PROJECT]);
  if (!link.ok) fail(`vercel link failed:\n${link.stderr || link.stdout}`);
  console.log('  ✓ Linked');

  step('Deploying to production');
  const deploy = vercel(['deploy', '--prod', '--yes']);
  if (!deploy.ok) fail(`Deploy failed:\n${deploy.stderr || deploy.stdout}`);
  const deploymentUrl = lastLine(deploy.stdout);
  console.log(`  ✓ ${deploymentUrl}`);

  let baseUrl = stableAlias(deploymentUrl);

  const domain = process.env.TEMPLATE_PREVIEWS_DOMAIN?.trim().toLowerCase();
  if (domain) {
    step(`Attaching ${domain}`);
    const add = vercel(['domains', 'add', domain, PROJECT]);
    const output = `${add.stdout}\n${add.stderr}`;
    if (
      add.ok ||
      /already (been )?(added|assigned|in use by this project)/i.test(output)
    ) {
      console.log('  ✓ Attached');
      baseUrl = `https://${domain}`;
      const label = domain.split('.')[0];
      console.log(`
  Create this record in Cloudflare (zone ${domain.split('.').slice(1).join('.')}):
    Type: CNAME   Name: ${label}   Target: cname.vercel-dns.com   Proxy: DNS only (grey cloud)
  A specific record overrides the *.${domain.split('.').slice(1).join('.')} wildcard.
  Vercel's recommended target for this project: \`vercel domains inspect ${domain}\`.`);
      if (/TXT|verif/i.test(output)) {
        console.log(
          `\n  Vercel also asks for ownership verification:\n${output}`,
        );
      }
    } else {
      console.warn(
        `  ✗ Vercel refused ${domain} (often because the wildcard is attached to another project or team):\n${output}\n  Falling back to the project's production alias.`,
      );
    }
  }

  if (!baseUrl)
    fail(
      'Could not determine a stable production URL; check `vercel inspect` output.',
    );

  console.log(`
✅ template-previews is live.
   Set in the environment that runs scripts/parse-and-seed-template.ts:
     TEMPLATE_PREVIEWS_BASE_URL=${baseUrl}
   Check: curl -I ${baseUrl}/`);
}

main();
