---
name: cli-exit-after-stdout-flush
description: process.exit() corta stdout por tubería a 64 KiB; el CLI sale tras vaciar stdout
type: gotcha
date: 2026-10-12
commit: 60e72cd
---

`pnpm lattiz list --offline --json | <otro programa>` entregaba JSON inválido cortado en ~65 400 bytes; a archivo salía completo. Causa: en Node las escrituras a una tubería son asíncronas y `process.exit()` descarta lo pendiente. `main.ts` ahora sale desde el callback de `process.stdout.write('', …)`; los códigos de salida no cambian.

**Why:** la skill y cualquier script consumen `--json` por tubería; `check --json` y `list --json` ya pasan de 64 KiB. Se descartó `process.exitCode` + salida natural porque algún comando podría dejar handles abiertos.
**How to apply:** en scripts de Node con salida grande, no llames `process.exit()` justo después de `console.log`; sal en el callback de `stdout.write`. Ver [[lattiz-template-cli]].
