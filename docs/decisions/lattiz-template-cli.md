---
name: lattiz-template-cli
description: pnpm lattiz sobre el kit; preview vía composeSiteHtml; seed sin deploy + deploy que finaliza
type: project
date: 2026-10-12
commit: 96fa295
---

`pnpm lattiz` (`packages/lattiz-cli`, tsx sin build) orquesta lo que ya existía: manifiestos del kit, `template:seed`, el clasificador de Motion y el Vercel CLI de previews. La composición de `route.ts` (tokens → SEO → JSON-LD → analítica → Motion) vive en `apps/tenant-sites/lib/compose-site.ts` (`composeSiteHtml`), que usan `route.ts` y la vista local del CLI. `lattiz seed` siembra con `--no-deploy`; `lattiz deploy` sube previews una vez y luego corre el seed con `--finalize` (esperar 200 → miniatura → activar) para cada plantilla pendiente en `.lattiz/state/`. En `check`, FAIL = kit:validate, overflow, contraste axe, `alt`, título/descripción, tokens crudos, Pro sin JS; texto < 14 px y toques < 44 px son WARN.

**Why:** un paso de servir escrito dos veces se desvía; un deploy por plantilla en `ship` era lento y el seed no podía activar sin deploy. Texto < 12 px es WARN porque todas las plantillas actuales tienen etiquetas de 10–12 px. Dependencias mínimas: `node:util` parseArgs (no cac/commander), `fs.watch` recursivo + SSE (no chokidar), `@clack/prompts`, `axe-core`; Lighthouse por `npx` solo con `--lighthouse`.
**How to apply:** un paso nuevo al servir va en `composeSiteHtml`, no en `route.ts`. Un clon recién hecho con `lattiz new` es idéntico a su base y hace fallar `kit:validate` también para la base y el resto del rubro hasta diferenciarlo. Si el Chromium instalado no coincide con Playwright, `LATTIZ_CHROMIUM_PATH`. Guía: `docs/lattiz-cli.md`. Ver [[template-rhythm-tokens]], [[lattiz-motion-runtime]].
