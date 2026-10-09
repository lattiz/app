---
name: grapesjs-sdk-pin-1-1-1
description: No subir @grapesjs/studio-sdk a 1.2.1; rompe i18n y deja node_modules roto
type: gotcha
date: 2026-10-08
commit: 5898483
---

Mantener `@grapesjs/studio-sdk` en 1.1.1 (package.json `^1.1.1`, el lockfile pinea 1.1.1).

**Why:** 1.2.1 rompe el typecheck de `apps/web/src/features/editor/i18n/studio-sdk-es.ts` (la clave `direction` ya no existe) y no aportó la mejora buscada. Probar la subida y revertirla dejó `node_modules` inconsistente y el build falló con "Rolldown failed to resolve react/jsx-runtime".
**How to apply:** probar otra versión solo en una rama. Si `node_modules` queda raro: `rm -rf node_modules apps/*/node_modules packages/*/node_modules && pnpm install --frozen-lockfile` (un `pnpm install` normal dice "up to date" y no lo repara). Ver [[grapesjs-mobile-layout-plugin]].
