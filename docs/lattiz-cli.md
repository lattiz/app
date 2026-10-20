# Lattiz CLI (`pnpm lattiz`)

`pnpm lattiz <comando>` lleva una plantilla del template-kit hasta `templates.lattiz.app`:
**doctor → new → dev → motion → check → seed → deploy → publish/ship**. Código en
`packages/lattiz-cli`; ayuda con `pnpm lattiz --help` y `pnpm lattiz <comando> --help`.

## Estado del repo (2026-10-12, inicio de la Fase 4)

- **Historia.** Desde la Fase 2 no entró nada de otros entornos: `main` local seguía en `c71427b`
  (15 commits sin subir). `pnpm install --frozen-lockfile`, `typecheck` y `build` pasan. Durante la
  sesión apareció una edición ajena sin commitear en `apps/web/src/features/editor/SaveStatusBadge.tsx`
  (no compila); no es de este trabajo y no se tocó.
- **Lint.** Los 20 errores viejos eran de `packages/fixtures/*.js` (scripts CommonJS de un spike de
  GrapesJS, sin `package.json`, que nada importa): se ignoran como `template-kit/fixtures` (`1a5c841`).
- **Datos de contacto como tokens.** El `.grapesjs` (lo que copia quien adopta una plantilla) ya
  lleva `{{lz:phone|phone_tel|whatsapp_url|email|address|city}}`; el `index.html` del kit (el que el
  seed publica) los resuelve con el demo mediante `bindSiteTokens` (`062afb3`). Sin «Datos del
  negocio» quedan vacíos: ver «Pendientes» en `docs/template-spec.md`.
- **Encaje.** El `--lz-header-h` de los navbars no contaba el borde de 2 px de algunos temas: el hero
  `split` se pasaba 1 px a 1366×768 (`barberia-base-solar-v1`). Arreglado en la sección (`725a31f`).
- **Secretos.** Regla en `CLAUDE.md`/`AGENTS.md`: nunca imprimir valores, solo presencia. Ningún
  comando del CLI imprime valores de env (`doctor` muestra nombre, presencia y archivo de origen).

## Estado del repo (2026-10-11, revisión de la Fase 1)

- **Historia.** La Fase 1 se escribió en otra máquina (contenedor con Node 22, sin `.env` ni Vercel
  CLI) en la rama `claude/awesome-keller-ss1s44` (PR #3, `08eb568`). `e8d278c` la fusiona con `main`,
  que traía en paralelo Motion v3, el sistema de encaje (`data-lz-fit`), los fallbacks de fuentes y
  `316f564` (`pnpm --filter @lattiz/template-previews run deploy`, porque `deploy` es un comando
  propio de pnpm). El merge no tuvo conflictos y solo añade ese arreglo al CLI. No llegaron rubros,
  plantillas ni reglas nuevas del validador: el kit sigue con un solo rubro (barbería, 6 plantillas).
- **Integridad.** Sin marcadores de conflicto ni archivos a medio fusionar. `pnpm install
--frozen-lockfile`, `pnpm typecheck` y `pnpm build` pasan; `pnpm lint` solo marca los 20 errores
  previos de `packages/fixtures/*.js` (no son de la integración). `kit:validate` y los 87 tests del kit
  pasan.
- **Verificado en una Mac (Node 24.9, `.env` y Vercel CLI con sesión):** `doctor`, `list`/`status`
  (también `--offline` y `--json`), `new` por clonación (y borrado después), `dev` (7 tamaños,
  Motion solo en Pro, «Reduced motion», puerto ocupado → código 2), `motion`, `check` (Básico, ~24 s),
  `seed --dry-run` (no escribe nada) y los códigos de salida de uso (id inválido, flag desconocido,
  confirmación sin `--yes` → 2).
- **Arreglado:** la memoria pico de `check` sumaba cualquier proceso «chrom» (un Chrome de escritorio
  abierto daba ~6 GiB); ahora cuenta solo los procesos hijos del CLI. El `.grapesjs` traía ids de
  página y frame aleatorios en cada compilación; ahora son estables (misma entrada → mismos bytes).
- **Arreglado después (Fase 2):** `check` marcaba FAIL de contraste en los elementos de un
  marquee recortados fuera de la pantalla cuando el runtime de Motion está cargado (axe tomaba el
  fondo de la página, 1.08:1); ahora ignora el texto que no cabe completo en el ancho de la pantalla
  (el desbordamiento real ya lo marca su propia regla).
- **No verificado aquí (escrituras remotas):** `seed` real, `deploy`, `publish` y `ship`. Revisión
  estática sin hallazgos; prueba una vez de punta a punta con una plantilla desechable:
  `pnpm lattiz seed <id>` → `pnpm lattiz deploy` → `pnpm lattiz status <id>` (o `pnpm lattiz
publish <id>`).

## Nota de descubrimiento (qué había antes del CLI)

Sacado del código al construir la Fase 1. Si algo de aquí ya no coincide, manda el código.

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

Tras el primer seed, el nombre, la descripción, la categoría, el orden y la miniatura los gestiona
el admin. `seed`, `publish` y `ship` aceptan `--overwrite-meta` para pisarlos, incluida una
miniatura cuya URL contiene `/admin-thumb-`. Sin ese flag el re-seed igual escribe `grapesjs_json`,
`tier`, `preview_url` y `kit_meta`. Una plantilla con `retired_at` no se reactiva. El tier lo sigue
mandando el kit.

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
(ver `docs/decisions/template-rhythm-tokens.md`). El sistema de encaje (`data-lz-fit` en los héroes,
`--lz-fit` = 90 % de `100svh − header`) llegó a `main` después; `kit:shots` ya lo reporta y `check`
reusa su medición (`measureFit`).

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
  interactiva, `seed`, `deploy`, `publish` y `ship` se niegan (código 2) salvo con `--yes` **y**
  `--confirm-remote` (Fase 4: una llave más para scripts y agentes; con terminal, `--yes` basta).
- **Ids:** `^[a-z0-9]+(-[a-z0-9]+)*$`, máx. 60. Pro `<giro>-<nombre>-v1`, Básico
  `<giro>-base-<nombre>-v1`.
- **Escrituras remotas:** solo dos, y ambas muestran antes qué va a pasar y piden confirmación:
  el seed de **una** plantilla (`--only <id>`, nunca toca otras) y el deploy de previews. Todo lo
  demás es lectura (`select` a `public.templates`, `GET` a la URL del preview).
- **Secretos:** nunca se imprimen; `doctor` solo dice si cada variable está y de qué archivo vino.

## Comandos

| Comando                                                                                                     | Qué hace                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm lattiz doctor`                                                                                        | Node, pnpm, dependencias, Chromium, variables del seed (nombre y presencia), lectura de Supabase, Vercel CLI y sesión, enlace del proyecto de previews, puerto 4400, git. Sale con 2 si algo bloquea.                                                                                                                                                                                                                                                        |
| `pnpm lattiz list [id] [--offline] [--json]` (alias `status`)                                               | Plantillas locales con tier y origen (`generada`, `congelada`, `clon`, `a mano`; ⚠ si se editó a mano o el spec cambió; specs sin build); del remoto (solo lectura): tier, `is_active`, `created_at`, si `templates.lattiz.app/<id>` responde; y el último check/seed/deploy local.                                                                                                                                                                          |
| `pnpm lattiz new [--spec archivo] [--modo spec\|clon]`                                                      | **Desde spec (recomendado):** `spec init` + `build` (ver abajo; `--spec <archivo> --yes --json` sin preguntas). **Clonar (legacy):** tier, giro, nombre, id y base; clona el manifiesto base, reescribe id, nombre, categoría, descripción y nombre del negocio, deja `motion.sections` vacío (Pro), compila y valida. Sin terminal, el modo por defecto sigue siendo clonar.                                                                                |
| `pnpm lattiz spec init\|validate\|schema`                                                                   | `init --giro --nombre [--twin\|--tier] [--id] [--direccion <id>]`: escribe `packages/template-kit/specs/<giro>-<nombre>.spec.json` con el copy del giro, paleta y tipografía libres (o, con `--direccion`, `layout.direction` sin fijar paleta, tipografía ni forma) y una lista `todo`. `validate <archivo\|id>`: esquema, blueprint y copy completo con rutas JSON. `schema`: JSON Schema. Todos con `--json`.                                             |
| `pnpm lattiz spec validate <id> --strict [--json]`                                                          | Además del esquema, revisa el copy: longitud por clave (límites en `giro show`), relleno/TODO, promesas y superlativos, teléfonos o correos escritos a mano, marcas reales (`src/spec/brand-blocklist.json`), acentos, frases repetidas en la página, entre la gemela y contra otras plantillas del giro, y copy por defecto del giro. Cada problema trae `rule` y la ruta del spec a cambiar.                                                               |
| `pnpm lattiz giro list\|show <giro> [--json]`                                                               | Giros del registro: qué negocios cubren, roles y variantes por tier, secciones por defecto, paletas y tipografías con su tono y si están libres en el giro (más `otherFontPairs`), claves de copy con límite y ejemplo, reglas del giro. Lo usa la skill para no leer código.                                                                                                                                                                                |
| `pnpm lattiz direccion list\|show <id> [--json]`                                                            | Direcciones de arte (`directions/`): diales, Motion, giros afines; `show` da estilos, primitivos, arquetipos, portadas, paletas, pares, reglas y la voz del copy. En un spec: `layout.direction`.                                                                                                                                                                                                                                                            |
| `pnpm lattiz kit list [--slot s] [--json]`                                                                  | El catálogo desde `catalog.manifest.json`: variantes con tier, catálogo, encaje y arquetipos; primitivos, direcciones, arquetipos, paletas y pares.                                                                                                                                                                                                                                                                                                          |
| `pnpm lattiz build <id\|spec> [--dry-run] [--diff] [--images placeholder\|none\|pixabay] [--force] [--json]` | Compila el spec: manifiesto(s), tema(s), copy y perfil demo únicos en el giro; valida en una carpeta temporal y solo entonces escribe y compila `dist/`. Se niega ante archivos editados a mano (sin `--force`) o congelados. Guía: `docs/template-spec.md`.                                                                                                                                                                                                 |
| `pnpm lattiz freeze <id>` / `unfreeze <id>`                                                                 | Congela los archivos generados (el build ya no los toca y muestra el diff) / los devuelve al spec con confirmación (`--yes`).                                                                                                                                                                                                                                                                                                                                |
| `pnpm lattiz dev <id> [--port 4400] [--runtime-src]`                                                        | Servidor local con recarga en vivo (al guardar manifiesto, secciones, temas, textos, assets o `core.css`). La página pasa por `composeSiteHtml`, igual que en producción: tokens con el perfil demo → SEO → JSON-LD → Motion **solo si es Pro**. Barra: 360/390/768/1024/1440, alto de pantalla 1366×768 y 844×390, Motion on/off y preset (Pro), «Reduced motion», «Abrir sin marco» (`/site`). `pnpm template:dev <id>` es el mismo comando.               |
| `pnpm lattiz motion <id> [--edit]`                                                                          | Pro: compila y muestra la tabla del clasificador de secciones (índice, bloque, tipo, motivo, grupos…) sin escribir nada, y dónde ajustarla (`motion.sections` del manifiesto). `--edit` abre el manifiesto en `$EDITOR`. En Básico explica que no aplica.                                                                                                                                                                                                    |
| `pnpm lattiz check <id> [--lighthouse] [--json] [--root <dir>]`                                             | Revisión con Playwright (abajo). Tabla PASS/WARN/FAIL por regla y tamaño, capturas en `.lattiz/shots/<id>/`, resultado en `.lattiz/state/<id>.json`, sale con 1 si hay FAIL. Con `--lighthouse` guarda el reporte completo en `.lattiz/shots/<id>/lighthouse.json`. `--root <dir>` revisa una prueba construida con `lattiz build <spec> --out <dir>` (sin tocar el kit).                                                                                    |
| `pnpm lattiz review <id> [--json] [--root <dir>]`                                                           | Paquete de revisión visual en `.lattiz/review/<id>/`: lo que se ve sin scroll a 390×844, 1366×768 y 1440×900, páginas completas a 390 y 1440, una captura por sección, `review.md`/`review.json` con paleta, tipografía, forma, variantes, copy visible por sección y, en gemelas, en qué difieren Básico y Pro. ~15–20 s, uno a la vez. `--root <dir>` revisa una prueba de `lattiz build --out` (la gemela es el otro build de la raíz).                   |
| `pnpm lattiz seed <id> [--dry-run] [--deploy] [--overwrite-meta]`                                           | Corre siempre el dry-run del seed (compila, valida, tabla de Motion, assets), imprime el plan (id, tier, INSERT o UPDATE de **una** fila, assets a R2, archivo de preview, URL), pide confirmación y siembra con `--no-deploy`. Luego verifica la fila (tier, `is_active`, `created_at`). `--dry-run` no escribe nada; `--deploy` corre el seed completo de siempre. `--overwrite-meta` pisa nombre, descripción, categoría, orden y la miniatura del admin. |
| `pnpm lattiz deploy [--skip-verify]`                                                                        | Muestra qué sube (todo `apps/template-previews/public`, qué previews no están commiteados, qué plantillas quedan por terminar), pide confirmación, `vercel deploy --prod`, sondea la URL hasta 200 (2 min) y termina las plantillas sembradas sin deploy (`seed --finalize`: miniatura + activar).                                                                                                                                                           |
| `pnpm lattiz publish <id> [--force] [--lighthouse] [--overwrite-meta]`                                      | Lista los pasos y los marca: `check` (FAIL bloquea salvo `--force`, que se avisa en grande y queda en el estado) → Pro: tabla de Motion y «¿continuar?» → `seed` → `deploy` → verifica `https://templates.lattiz.app/<id>`. Si un paso falla dice qué comando re-ejecutar. `--overwrite-meta` se pasa al seed.                                                                                                                                               |
| `pnpm lattiz ship <idA> [idB] [--force] [--lighthouse] [--overwrite-meta]`                                  | `publish` del par (Básico + Pro): checks y seeds en orden, **un** deploy al final, y las dos URLs. `--overwrite-meta` se pasa a cada seed.                                                                                                                                                                                                                                                                                                                   |

### Qué revisa `check`

Tamaños: 360×780, 390×844, 768×1024, 1024×768, 1440×900 (página completa) y 1366×768, 844×390
(solo lo que cabe en pantalla). Un solo navegador, un contexto a la vez con
`prefers-reduced-motion: reduce` (para medir el estado final), cerrado siempre al terminar.

| Regla                                                                                                                                                                                       | Resultado    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `kit:validate` (tema/titular únicos, similitud, contraste de tokens, `alt`, breakpoints…)                                                                                                   | FAIL         |
| Elementos más anchos que la pantalla (reusa la auditoría de `kit:shots`)                                                                                                                    | FAIL         |
| Contraste de texto (axe `color-contrast`, AA)                                                                                                                                               | FAIL         |
| `<img>` sin `alt`                                                                                                                                                                           | FAIL         |
| Falta `<title>` o meta description en el HTML servido                                                                                                                                       | FAIL         |
| Tokens `{{lz:*}}` crudos en el HTML servido (sin perfil demo deben quedar vacíos)                                                                                                           | FAIL         |
| Pro: con JS apagado, contenido de las secciones de Motion oculto                                                                                                                            | FAIL         |
| Texto < 14 px (se marca aparte lo < 12 px)                                                                                                                                                  | WARN         |
| Objetivos táctiles < 44 px                                                                                                                                                                  | WARN         |
| Imagen > 300 KB o > 2000 px de ancho (en `dist/`, antes de que el seed la pase a WebP ≤ 2000 px)                                                                                            | WARN         |
| Secciones `data-lz-fit` (héroes): contenido vs `0.9 × (alto − header)`, o texto + CTA visibles si la imagen va abajo; misma regla que `kit:shots`. Alto ≤ 560 px o sin secciones fit: `N/A` | FAIL / N/A   |
| Pliegue: el CTA principal del hero se ve sin scroll (todas las portadas, también las sin `data-lz-fit`); alto ≤ 560 px: `N/A`                                                               | WARN         |
| Pro: secciones sin tipo de Motion (preset `none` o tipo `none`) y número de grupos                                                                                                          | WARN         |
| Plantillas de spec: créditos de fotos (`assets/<giro>/<tema>/CREDITS.json`)                                                                                                                 | INFO         |
| `--lighthouse`: rendimiento, accesibilidad, buenas prácticas y SEO (`npx lighthouse@12`)                                                                                                    | WARN si < 80 |
| `--lighthouse`: LCP ≤ 2.5 s, CLS ≤ 0.1 y TBT ≤ 200 ms (emulación móvil de Lighthouse). **Laboratorio** sobre la vista previa local estática (sin CDN, fuentes locales), no datos de campo   | WARN         |

`--json` agrega `findings[]`: cada FAIL/WARN con regla, tamaño, sección, variante, selector y, si la
plantilla sale de un spec, `specHint` (qué campo del spec cambiar; `null` si no se arregla desde el
spec, como el texto chico de una variante).

El texto < 14 px es WARN porque todas las plantillas actuales tienen etiquetas de 10–12 px
(subtítulo de la marca, índices); hacerlo FAIL bloquearía republicarlas.

**Costo medido** (`barberia-norte-v1`, Pro, 7 tamaños, sin Lighthouse): ~35–40 s; pico ~1.3–1.4 GiB
sumando el RSS de Node y de todos los procesos de Chromium (la suma cuenta dos veces la memoria
compartida, así que el uso real es menor). Lighthouse corre aparte, después de cerrar el navegador.

## El ciclo de venta, paso a paso

Con spec (recomendado; detalle en `docs/template-spec.md`):

1. **`pnpm lattiz doctor`** — arregla lo que marque (sesión de Vercel, variables, Chromium).
2. **`pnpm lattiz spec init --giro floreria --nombre "Flores Lupita" --twin`** — escribe
   `packages/template-kit/specs/floreria-flores-lupita.spec.json` (giros: restaurante, clinica,
   floreria, barberia).
3. **Edita el spec** — datos del negocio, copy (precios, equipo, reseñas, preguntas), marca y fotos;
   vacía `todo`. `pnpm lattiz spec validate floreria-flores-lupita`.
4. **`pnpm lattiz build floreria-flores-lupita`** — genera `floreria-flores-lupita-v1` (Pro) y
   `floreria-base-flores-lupita-v1` (Básico), únicas en el giro y validadas antes de escribir.
5. **`pnpm lattiz dev <id>`** — `http://localhost:4400`, los 7 tamaños, con Motion y con «Reduced motion».
6. **`pnpm lattiz motion <idPro>`** — si un tipo está mal, `motion.overrides` en el spec y `build`.
7. **`pnpm lattiz check <id>`** — cada una, de una en una, hasta que no haya FAIL.
8. **`pnpm lattiz ship <idBásico> <idPro>`** y comparte `https://templates.lattiz.app/<id>`. Commitea
   el spec, los archivos generados y `apps/template-previews/public/<id>/index.html`.

Clonando (legacy, para giros sin registro como despacho o estética): `pnpm lattiz new --modo clon
--tier ambos --giro despacho --nombre "…"` y edita cada manifiesto a mano (tema propio, variantes de
hero y servicios, copy). **Mientras el clon sea idéntico a su base, `kit:validate` falla también para
la base y para el resto del rubro** (tema, par tipográfico y titular deben ser únicos).

### Dónde ajustar espacios, tipografía y responsive

De lo más amplio a lo más puntual (detalle en `docs/template-workflow.md` §6):

0. **El spec** — en plantillas generadas, todo se ajusta en el spec (`brand.rhythm`,
   `brand.displayScale`, variantes de sección) y se recompila; editar los archivos generados exige
   `lattiz freeze`.
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

## Fase 4 (hecha): skill de Claude Code y más giros

`/lattiz-template <negocio> en <ciudad>` (`.claude/skills/lattiz-template/`, guía en
`docs/lattiz-skill.md`) arma el par Básico + Pro por el CLI y se detiene antes de publicar. Para eso
el CLI ganó `giro list|show`, `spec validate --strict`, `check --json` con `findings[]`/`specHint` y
la regla `fold`, `review`, `next[]` y hashes en `build --json`, y `--confirm-remote`. Giros nuevos:
`estetica`, `dental`, `despacho`, `tienda` (con la variante `services/product-grid`), `gimnasio` y
`veterinaria`. El `prospect` de la Fase 3 sigue pendiente a propósito.

## Fase 2 (hecha) y lo que sigue

La Fase 2 está implementada: `template.spec.json` + compilador (`kit:spec` / `lattiz build`),
gemelas, unicidad por construcción, congelado y tres giros nuevos. Referencia, catálogo de giros y
contrato para la skill de Claude Code: `docs/template-spec.md`.

Pendiente (diseño):

- **`pnpm lattiz prospect <id>`**: URL privada de demo (no listada, `noindex`, con caducidad), una
  marca `demo` en `templates` (requiere migración en `supabase/migrations/`) para que no aparezca en
  la galería, y una hoja de pitch (PDF/PNG) con capturas y código QR.
- ~~Skill de Claude Code~~: hecha en la Fase 4 (arriba).
