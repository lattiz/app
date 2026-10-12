# Lattiz CLI (`pnpm lattiz`)

`pnpm lattiz <comando>` lleva una plantilla del template-kit hasta `templates.lattiz.app`:
**doctor → new → dev → motion → check → seed → deploy → publish/ship**. Código en
`packages/lattiz-cli`; ayuda con `pnpm lattiz --help` y `pnpm lattiz <comando> --help`.

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

**Desviaciones respecto al plan original** (manda el código): no hay carpeta `templates/<id>/` por
plantilla; el CLI usa el manifiesto del kit. Los ajustes de Motion van en `motion.sections` del
manifiesto (no `motion.json`), no se crea `overrides.css` y el perfil demo opcional vive en
`packages/template-kit/demo-profiles/<id>.json`. El estado y las capturas van en `.lattiz/`
(no se commitea): `.lattiz/state/<id>.json` y `.lattiz/shots/<id>/`. Como la tabla no tiene
`updated_at`, el CLI muestra `created_at` + `is_active`. `lattiz seed` siembra **sin** desplegar
(`--no-deploy`); el seed ganó `--finalize` para que `lattiz deploy` publique los previews una sola
vez y luego tome miniatura y active cada plantilla pendiente.

---

## Requisitos

- Node 24 y pnpm 11.5.2 (`.nvmrc`, `packageManager`); `pnpm install`.
- Chromium de Playwright (`pnpm exec playwright install chromium`). Si tu Chromium no coincide con
  la versión de Playwright, pon su ruta en `LATTIZ_CHROMIUM_PATH` (en `.env` o en la terminal).
- Para sembrar y publicar: las variables del seed (ver arriba; `.env.example`), el Vercel CLI con
  sesión (`vercel login` o `VERCEL_TOKEN`) y `apps/template-previews` enlazado
  (`pnpm tsx scripts/setup-template-previews.ts`, una vez).
- `dev`, `motion` y `check` no tocan nada remoto y funcionan sin esas credenciales.

`pnpm lattiz doctor` revisa todo y dice cómo arreglar cada cosa.

## Convenciones

- **Códigos de salida:** `0` bien · `1` falló una verificación (FAIL en `check`, fila no
  verificada, deploy sin 200) · `2` uso o entorno (flag inválido, id inválido, falta una variable o
  el Vercel CLI).
- **Sin preguntas:** cada pregunta tiene su flag. `--yes` (`-y`) confirma todo, incluidas las
  escrituras remotas; `--non-interactive` nunca pregunta y falla si falta un dato. Sin terminal
  interactiva y sin `--yes`, una escritura remota se niega (código 2). Así lo podrá manejar una
  skill de Claude Code.
- **Ids:** `^[a-z0-9]+(-[a-z0-9]+)*$`, máx. 60. Pro `<giro>-<nombre>-v1`, Básico
  `<giro>-base-<nombre>-v1`.
- **Escrituras remotas:** solo dos, y ambas muestran antes qué va a pasar y piden confirmación:
  el seed de **una** plantilla (`--only <id>`, nunca toca otras) y el deploy de previews. Todo lo
  demás es lectura (`select` a `public.templates`, `GET` a la URL del preview).
- **Secretos:** nunca se imprimen; `doctor` solo dice si cada variable está y de qué archivo vino.

## Comandos

| Comando                                                       | Qué hace                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm lattiz doctor`                                          | Node, pnpm, dependencias, Chromium, variables del seed (nombre y presencia), lectura de Supabase, Vercel CLI y sesión, enlace del proyecto de previews, puerto 4400, git. Sale con 2 si algo bloquea.                                                                                                                                                                                                                                          |
| `pnpm lattiz list [id] [--offline] [--json]` (alias `status`) | Plantillas locales con tier; del remoto (solo lectura): tier, `is_active`, `created_at`, si `templates.lattiz.app/<id>` responde; y el último check/seed/deploy local.                                                                                                                                                                                                                                                                         |
| `pnpm lattiz new`                                             | Asistente: tier (`pro`, `basico`, `ambos`), giro, nombre, id y base. Clona el manifiesto base a `packages/template-kit/templates/<id>.ts`, reescribe id, nombre, categoría, descripción y nombre del negocio, deja `motion.sections` vacío (Pro), compila y corre `kit:validate`. Flags: `--tier --giro --nombre --id --id-pro --id-basico --base --base-pro --base-basico`.                                                                   |
| `pnpm lattiz dev <id> [--port 4400] [--runtime-src]`          | Servidor local con recarga en vivo (al guardar manifiesto, secciones, temas, textos, assets o `core.css`). La página pasa por `composeSiteHtml`, igual que en producción: tokens con el perfil demo → SEO → JSON-LD → Motion **solo si es Pro**. Barra: 360/390/768/1024/1440, alto de pantalla 1366×768 y 844×390, Motion on/off y preset (Pro), «Reduced motion», «Abrir sin marco» (`/site`). `pnpm template:dev <id>` es el mismo comando. |
| `pnpm lattiz motion <id> [--edit]`                            | Pro: compila y muestra la tabla del clasificador de secciones (índice, bloque, tipo, motivo, grupos…) sin escribir nada, y dónde ajustarla (`motion.sections` del manifiesto). `--edit` abre el manifiesto en `$EDITOR`. En Básico explica que no aplica.                                                                                                                                                                                      |
| `pnpm lattiz check <id> [--lighthouse] [--json]`              | Revisión con Playwright (abajo). Tabla PASS/WARN/FAIL por regla y tamaño, capturas en `.lattiz/shots/<id>/`, resultado en `.lattiz/state/<id>.json`, sale con 1 si hay FAIL.                                                                                                                                                                                                                                                                   |
| `pnpm lattiz seed <id> [--dry-run] [--deploy]`                | Corre siempre el dry-run del seed (compila, valida, tabla de Motion, assets), imprime el plan (id, tier, INSERT o UPDATE de **una** fila, assets a R2, archivo de preview, URL), pide confirmación y siembra con `--no-deploy`. Luego verifica la fila (tier, `is_active`, `created_at`). `--dry-run` no escribe nada; `--deploy` corre el seed completo de siempre.                                                                           |
| `pnpm lattiz deploy [--skip-verify]`                          | Muestra qué sube (todo `apps/template-previews/public`, qué previews no están commiteados, qué plantillas quedan por terminar), pide confirmación, `vercel deploy --prod`, sondea la URL hasta 200 (2 min) y termina las plantillas sembradas sin deploy (`seed --finalize`: miniatura + activar).                                                                                                                                             |
| `pnpm lattiz publish <id> [--force] [--lighthouse]`           | Lista los pasos y los marca: `check` (FAIL bloquea salvo `--force`, que se avisa en grande y queda en el estado) → Pro: tabla de Motion y «¿continuar?» → `seed` → `deploy` → verifica `https://templates.lattiz.app/<id>`. Si un paso falla dice qué comando re-ejecutar.                                                                                                                                                                     |
| `pnpm lattiz ship <idA> [idB]`                                | `publish` del par (Básico + Pro): checks y seeds en orden, **un** deploy al final, y las dos URLs.                                                                                                                                                                                                                                                                                                                                             |

### Qué revisa `check`

Tamaños: 360×780, 390×844, 768×1024, 1024×768, 1440×900 (página completa) y 1366×768, 844×390
(solo lo que cabe en pantalla). Un solo navegador, un contexto a la vez con
`prefers-reduced-motion: reduce` (para medir el estado final), cerrado siempre al terminar.

| Regla                                                                                                                  | Resultado    |
| ---------------------------------------------------------------------------------------------------------------------- | ------------ |
| `kit:validate` (tema/titular únicos, similitud, contraste de tokens, `alt`, breakpoints…)                              | FAIL         |
| Elementos más anchos que la pantalla (reusa la auditoría de `kit:shots`)                                               | FAIL         |
| Contraste de texto (axe `color-contrast`, AA)                                                                          | FAIL         |
| `<img>` sin `alt`                                                                                                      | FAIL         |
| Falta `<title>` o meta description en el HTML servido                                                                  | FAIL         |
| Tokens `{{lz:*}}` crudos en el HTML servido (sin perfil demo deben quedar vacíos)                                      | FAIL         |
| Pro: con JS apagado, contenido de las secciones de Motion oculto                                                       | FAIL         |
| Texto < 14 px (se marca aparte lo < 12 px)                                                                             | WARN         |
| Objetivos táctiles < 44 px                                                                                             | WARN         |
| Imagen > 300 KB o > 2000 px de ancho (en `dist/`, antes de que el seed la pase a WebP ≤ 2000 px)                       | WARN         |
| Secciones con `--lz-fit`: alto del contenido vs `0.9 ×` alto de pantalla; sin el token, `N/A (no viewport-fit tokens)` | WARN / N/A   |
| Pro: secciones sin tipo de Motion (preset `none` o tipo `none`) y número de grupos                                     | WARN         |
| `--lighthouse`: rendimiento, accesibilidad, buenas prácticas y SEO (`npx lighthouse@12`)                               | WARN si < 80 |

El texto < 14 px es WARN porque todas las plantillas actuales tienen etiquetas de 10–12 px
(subtítulo de la marca, índices); hacerlo FAIL bloquearía republicarlas.

**Costo medido** (`barberia-norte-v1`, Pro, 7 tamaños, sin Lighthouse): ~35–40 s; pico ~1.3–1.4 GiB
sumando el RSS de Node y de todos los procesos de Chromium (la suma cuenta dos veces la memoria
compartida, así que el uso real es menor). Lighthouse corre aparte, después de cerrar el navegador.

## El ciclo de venta, paso a paso

1. **`pnpm lattiz doctor`** — arregla lo que marque (sesión de Vercel, variables, Chromium).
2. **`pnpm lattiz new`** — p. ej. `--tier ambos --giro floreria --nombre "Flores Lupita"`. Crea
   `floreria-base-flores-lupita-v1` (Básico) y `floreria-flores-lupita-v1` (Pro) clonando las bases
   de `packages/lattiz-cli/bases.json`.
3. **Edita** cada manifiesto: un tema propio en `themes/` (colores, tipografías, forma), variantes
   de hero y servicios distintas a las de su base, y el copy (hero, marca, sucursal).
   **Mientras el clon sea idéntico a su base, `kit:validate` falla también para la base y para el
   resto del rubro** (tema, par tipográfico y titular deben ser únicos): sus seeds quedan
   bloqueados hasta que lo diferencies o lo borres. El copy no se reescribe solo para el giro, y
   solo existe el rubro barbería: los otros giros arrancan de una barbería.
4. **`pnpm lattiz dev <id>`** — abre `http://localhost:4400`, revisa los 7 tamaños, con Motion y
   con «Reduced motion».
5. **`pnpm lattiz motion <id>`** (Pro) — revisa la tabla; corrige tipos en `motion.sections`.
6. **`pnpm lattiz check <id>`** — hasta que no haya FAIL; revisa las capturas.
7. **`pnpm lattiz publish <id>`**, o **`pnpm lattiz ship <idBásico> <idPro>`** para el par.
8. **Comparte** `https://templates.lattiz.app/<id>`. Commitea el manifiesto, el tema y
   `apps/template-previews/public/<id>/index.html`.

### Dónde ajustar espacios, tipografía y responsive

De lo más amplio a lo más puntual (detalle en `docs/template-workflow.md` §6):

1. **Tokens del tema** — `themes/<tema>.json › rhythm` (`sectionPad`, `gutter*`, `space`,
   `textScale`, `title*`) y `fonts.displayScale`. Como el tema es único por plantilla dentro del
   rubro, en la práctica es «por plantilla».
2. **CSS de una sección** — `sections/<slot>/<variante>/section.css`. Se comparte entre plantillas:
   si el cambio solo le sirve a una, crea una variante nueva. No hay `overrides.css` por plantilla a
   propósito (rompería el validador y la similitud entre plantillas).
3. **Editor visual** — para un solo sitio ya adoptado; nunca regresa a la plantilla.

### Clientes que ya usan la plantilla

Al elegir una plantilla, la API copia `templates.grapesjs_json` al sitio del cliente
(`apps/api/src/modules/sites/sites.service.ts`). **Re-sembrar o publicar una plantilla no cambia los
sitios de quienes ya la adoptaron**: solo la ven los que la elijan desde ahora (y el preview y la
miniatura). Lo único que se inyecta al servir y llega a todos es lo de `route.ts` (tokens, SEO,
JSON-LD, analítica y el runtime de Motion para Pro). Si cambias el tier de una plantilla en uso, el
seed avisa cuántos sitios la usan.

## Fase 2 (diseño, no implementado)

Lo de abajo es diseño; nada existe todavía. La Fase 1 deja la superficie de comandos y las rutas
listas para esto: los comandos reciben ids, el estado vive en `.lattiz/`, y `new` solo produce un
manifiesto del kit, que es justo lo que el compilador generaría.

- **`template.spec.json`** por plantilla (junto al manifiesto o en `packages/template-kit/specs/`):
  giro, tier, paleta, par tipográfico, secciones con variante, copy es-MX, búsquedas de Pexels para
  las fotos y un perfil demo. Es la fuente; el manifiesto, el tema y el pack de copy se generan.
- **Compilador** en `packages/template-kit` (`kit:spec`): compone el kit de secciones + tokens + tags
  de Motion en el manifiesto/tema/copy y de ahí en `.grapesjs` + HTML con el compilador actual.
  Valida contra los blueprints antes de escribir.
- **Gemelas**: un spec produce la Básica y la Pro (`twin: true`), con roles y variantes permitidas
  por tier y temas distintos que pasan las reglas de unicidad del rubro.
- **`--freeze`**: para plantillas retocadas a mano o en el editor visual, congela la salida
  compilada y el spec deja de sobrescribirla (el CLI avisa si el spec y lo congelado difieren).
- **`pnpm lattiz prospect <id>`**: URL privada de demo (no listada, `noindex`, con caducidad), una
  marca `demo` en `templates` (requiere migración en `supabase/migrations/`) para que no aparezca en
  la galería, y una hoja de pitch (PDF/PNG) con capturas y código QR.
- **Skill de Claude Code** que maneja el CLI sin preguntas: `pnpm lattiz new --spec <archivo>
--yes`, luego `dev`/`check --json` en bucle hasta que no haya FAIL, y `ship --yes` cuando el
  humano lo apruebe. Los códigos de salida y `--json` ya están pensados para eso.
