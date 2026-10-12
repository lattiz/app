# Lattiz CLI (`pnpm lattiz`)

## Nota de descubrimiento (qué había antes del CLI)

Sacado del código el 2026-10-12. Si algo de aquí ya no coincide, manda el código.

**Fuentes de las plantillas.** Una plantilla es código en `packages/template-kit`, no una carpeta
por plantilla: el manifiesto `templates/<id>.ts` (id, nombre, categoría, `tier`, rubro, tema, voz,
secciones y `motion`), secciones compartidas `sections/<slot>/<variante>/section.{html,css}`, temas
`themes/<tema>.json` (tokens `--lz-*`, `rhythm`), textos `content/<rubro>.<voz>.es-MX.ts` e imágenes
`assets/<rubro>/<tema>/`. `kit:compile` escribe `dist/<id>/` (no se commitea): `<id>.grapesjs`,
`index.html`, `manifest.json`, `template.meta.json` (tier, slots, `motion`) y `assets/`.

**Seed.** `pnpm template:seed -- --only <id> [--dry-run] [--no-deploy] [--motion calm|editorial|none]`
(`scripts/template-seed.ts`) corre `kit:compile` → `kit:validate` → `scripts/parse-and-seed-template.ts
--dir packages/template-kit/dist/<id>`. Etapas: validar, clasificar secciones para Motion (tabla
impresa siempre, también en `--dry-run`), subir imágenes a R2 (WebP ≤ 2000 px), reescribir URLs,
escribir `apps/template-previews/public/<id>/index.html` (Pro: runtime de Motion copiado dentro),
upsert de **una** fila de `public.templates` por `id` (nueva → inactiva; existente → conserva
`is_active`), `vercel deploy --prod` de previews, miniatura con Playwright → R2 y activación. Con
`--dry-run` no se crea ningún cliente de Supabase ni de R2: solo lista assets y la tabla de Motion.
Variables (nombres): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STORAGE_PROVIDER=r2`,
`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`,
`TEMPLATE_PREVIEWS_BASE_URL`; opcionales `VERCEL_SCOPE`, `VERCEL_TOKEN`. Se leen de `./.env` y, para
Supabase/R2, de `apps/api/.env`.

**Tabla `templates`.** No se pudo inspeccionar en vivo: el MCP de Supabase de esta sesión no ve
ningún proyecto. Fuente: `supabase/migrations/20260708020921_create_templates_table.sql` y
`…_template_tiers_and_archives.sql` + el seed. Columnas: `id` (texto, PK), `name`, `description`,
`category`, `preview_url`, `thumbnail_url`, `grapesjs_json`, `is_active`, `sort_order`,
`created_at`, `tier` (`'basic' | 'pro'`, con CHECK). **No existe `updated_at`.** Ids:
`<rubro>-<nombre>-v<n>`, sin sufijo de tier; las Básicas usan `<rubro>-base-<nombre>-v1`
(`barberia-base-claro-v1`), las Pro `<rubro>-<nombre>-v1` (`barberia-norte-v1`). Categoría en
plural (`barberias`). El seed valida `^[a-z0-9-]{3,60}$`.

**Previews (`templates.lattiz.app`).** `apps/template-previews` es un proyecto estático de Vercel
(`template-previews`, sin build, `outputDirectory: public`, `cleanUrls`, `noindex`). Se despliega con
el Vercel CLI (`vercel deploy --prod --yes` desde esa carpeta, enlazada en `.vercel/`, que no se
commitea; alta inicial con `scripts/setup-template-previews.ts`). No hay deploy por git. Cada
deploy sube la carpeta `public/` completa. URL: `<TEMPLATE_PREVIEWS_BASE_URL>/<id>`, es decir
`https://templates.lattiz.app/<id>`.

**Herramientas que ya existían.** `pnpm template:dev <id>` (puerto 4400, recarga en vivo por SSE,
360/390/768/1024/1440, Motion on/off, preset, «Reduced motion»), `pnpm template:shots <id>` (5 anchos,
reporte de overflow, texto < 12 px y botones < 44 px), `kit:validate` (contraste AA de los pares de
tokens, `alt`, `<title>` + descripción, breakpoints, unicidad dentro del rubro…), `kit:build`,
`kit:compare-visual`. Clasificador de secciones de Motion en `scripts/lib/motion-sections.ts`
(`motionHtml`, `classificationTable`). Los tipos manuales de Motion van en el manifiesto
(`motion.sections`), no en un `motion.json`. No hay `overrides.css` por plantilla a propósito
(ver `docs/decisions/template-rhythm-tokens.md`) y no existe ningún token `--lz-fit`.

**Cómo sirve `route.ts`.** `apps/tenant-sites/app/route.ts` compone, cada paso con try/catch:
tokens `{{lz:*}}` (`bindSiteTokens`, si falla `stripSiteTokens`) → SEO (`injectSeo`, privado en
`route.ts`) → JSON-LD (`buildLocalBusinessJsonLd` + `injectJsonLd`) → analítica y banner de prueba
(`composePublishedHtml`) → Motion (`injectMotion`, solo `isPro`). Para que la vista local no se
desvíe de producción, esa composición se movió tal cual a `apps/tenant-sites/lib/compose-site.ts`
(`composeSiteHtml`), que usan `route.ts` y el CLI.

**Clientes que ya adoptaron una plantilla.** `apps/api/src/modules/sites/sites.service.ts` copia
`templates.grapesjs_json` a `site_schemas` al elegirla. Re-sembrar no cambia sus sitios.

**Huecos que llena el CLI.** Un solo punto de entrada con ayuda en español y códigos de salida;
`doctor`; `list`/`status` con estado remoto (solo lectura); `new` por clonación; `dev` sobre la
composición de producción (Motion solo Pro, perfil demo, modos de alto de pantalla, abrir sin
marco); `check` con las reglas de abajo, capturas y estado; confirmación + verificación en `seed`;
`deploy` independiente con sondeo de la URL; `publish` y `ship`.
