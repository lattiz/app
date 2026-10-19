---
name: lattiz-design
description: Genera candidatos de diseño con Google Stitch para un giro del kit, los guarda en la biblioteca (design-library/stitch/), extrae paleta, tipografía y patrones de sección (harvest) y, solo si piden promover, los pasa por las compuertas del kit. Úsala con «trae diseños de Stitch para <giro>», «coleccióname candidatos de <giro>», «extrae/promueve el candidato <id>», o con /lattiz-design.
argument-hint: '<giro> [dirección|unused] [n] [loose|tight] | harvest <id> | promote <id> | list'
allowed-tools: Bash(pnpm lattiz design *) Bash(pnpm lattiz giro *) Bash(pnpm lattiz direccion *) Read Write(.lattiz/stitch/**)
---

# Diseño con Stitch para el kit

Pedido: $ARGUMENTS

Stitch alimenta el **paso de diseño**, no el de publicación. Lo que sale de aquí son datos (paleta,
tipografía, patrones) que el kit puede adoptar tras sus compuertas; el HTML de Stitch **nunca** se sirve.
Guía y reglas: `docs/design-stitch-flow.md`.

## Reglas (siempre)

1. **MCP de Stitch solo para diseñar.** Herramientas permitidas: `list_projects`, `create_project`,
   `upload_design_md`, `create_design_system_from_design_md`, `generate_screen_from_text`,
   `generate_variants`, `edit_screens`, `get_screen`, `list_screens`, `get_project`,
   `list_design_systems`. Nunca durante un build de tenant-sites. Si el MCP pide credenciales o algo más
   que generar/leer un diseño, **detente y pregunta**.
2. **Imágenes de Stitch (`googleusercontent` / `aida-public`) no son activos.** No las descargues como
   fotos del sitio ni las pongas en `images[]` de un spec. La captura de pantalla es solo referencia.
3. **Nada remoto del pipeline:** no `seed`, `deploy`, `publish`, `ship`, `git push`, ni Stripe/R2/Vercel.
4. **Solo `design-library/`, `.lattiz/stitch/` y `lattiz design …`.** No edites a mano el kit, specs,
   plantillas, `tenant-sites`, Motion, la API, validadores ni rangos. Si algo lo exige, detente y dilo.
5. **Promover es decisión humana.** `harvest` es seguro; `promote` solo si el usuario lo pide con el id,
   y siempre primero con `--dry-run`. Una sección solo se conserva con `--regenerate-manifest`, que
   reescribe archivos generados de `apps/api` y `apps/web`: el usuario lo aprobó (2026-10-19) para
   secciones promovidas a petición suya; úsalo solo cuando pida promover una sección concreta y
   reporta el diff generado.
6. **Sin secretos** en la salida ni en `candidate.json`.

## Flujo

1. **Giro y dirección.** `pnpm lattiz giro list --json` y `pnpm lattiz direccion list`; elige una
   dirección que el giro use poco (`kit capacity`) y que vaya con el tono, o usa `--direccion unused`.
2. **Plan.** `pnpm lattiz design gen --giro <g> --direccion <d|unused> --n 2 [--rigor loose|tight]
   [--brief archivo]` escribe `design.md`, `prompt.md` y `plan.json` en `.lattiz/stitch/<giro>/<corrida>/`.
   `loose` (por defecto) usa el sistema de diseño de la dirección, ya subido a Stitch
   (`plan.json › stitch_design_system`: proyecto y `assets/<id>`; si es `null`, sube el `design.md` con
   `upload_design_md` y `create_design_system_from_design_md`); `tight` exige la paleta y tipografía del giro.
3. **Stitch (MCP).** `list_projects` (solo lectura) para confirmar que responde. Luego `create_project`,
   (solo si `stitch_design_system` es `null`) `upload_design_md` con el `design.md` (base64) →
   `create_design_system_from_design_md`, y `generate_screen_from_text` con `prompt.md` y el
   `designSystem` (el asset del plan o el recién creado), `deviceType: DESKTOP`, tantas veces
   como `--n` (no reintentes ante un timeout: usa `get_screen` cada 30 s hasta 10 veces). Con
   `get_screen` baja el HTML y la captura a la carpeta de la corrida.
4. **Colecciona.** Por cada pantalla: `pnpm lattiz design gen --giro <g> --import <html> --design-md
   <design.md> --screenshot <png> --project <id> --screen <id> --tags … --spin …`. Queda `collected`.
5. **Extrae.** `pnpm lattiz design harvest <id>`: paleta (AA), escala tipográfica y patrones. Léelo y
   reporta qué es mapeable y qué no (`not_mappable`).
6. **Decide con el usuario:** `shelve` (guardar), `reject`, o promover:
   `pnpm lattiz design promote <id> --palette --fonts --dry-run` y, si pasa y lo piden, sin `--dry-run`.
   Si una compuerta falla no queda nada escrito; reporta cuál (AA, distancia entre paletas, contrato de
   variantes, `kit probe`, snapshot dorado, manifiesto).
7. **Si el MCP no responde:** el flujo sigue con un `design.md` o HTML que el usuario te dé:
   `design gen --import`. El harvester trabaja igual sobre archivos locales.

## Entrega

Para construir con lo promovido, la **lista de traducción** y el paso opcional están en la skill
`/lattiz-template` («Paso opcional: diseño con Stitch»). Reporta ids, estado (`pnpm lattiz design list`), qué extrajo cada harvest, supuestos, y lo que dejaste en
`.lattiz/stitch/`. No commitees ni promuevas sin que lo pidan. Para construir una landing con una
paleta/sección promovida, cambia a `/lattiz-template`.

## Flujo «Stitch nativo» (Modelo D): reconstruir lo que falta, a mano

Úsalo cuando el usuario quiere el diseño de Stitch fiel y no solo su paleta. Guía: `docs/stitch-native-sections.md`.

1. **Diseño.** Igual que arriba (pasos 1–4): candidato `collected` con HTML y captura. Sondea con `list_screens` /
   `get_screen` por la conexión directa antes de dar la generación por fallida; no repitas la llamada.
2. **Descomponer y medir.** `pnpm lattiz design harvest <id> [--accent primary|secondary|tertiary]` lista las secciones.
   Un `reuse_candidate` es solo una conjetura: **corre `pnpm lattiz design fidelity <id> <sección>` por cada una** (necesita
   Chromium y red) y mira `.lattiz/stitch/fidelity/<id>/<sección>/vs-*.png`. Solo un veredicto `match` (estructura ≤ 0.15)
   vale como «ya existe: reutilízala». Lo distinto sale en `rebuild` y **se reconstruye**: el objetivo de usar Stitch es
   tener su diseño, no la variante genérica más cercana. `not_mappable` es solo lo que el kit no admite.
3. **Reconstruir a mano** solo lo nuevo, siguiendo el contrato (tokens `--lz-*`, sin JS, clase raíz
   `lz-<slot>-<variante>`, Básico + Pro, copy con las mismas claves que sus hermanas): carpeta en `sections/`, `FAMILIES`
   en `archetypes/families.ts`, una alternativa en un arquetipo, el bloque en `packages/template-kit/src/cli/editor-blocks.ts`
   y `pnpm --filter @lattiz/template-kit kit:manifest` (cambia manifiesto, hashes y datos generados de `apps/web`/`apps/api`:
   reporta el diff). Valida con `lattiz kit probe <slot/variante>`.
4. **Armar el par** con el spec (dirección, paleta, fuentes, `layout.variantOverrides`) y `pnpm lattiz build`. Las fotos las
   pone una persona en `images[]`; un hero placeholder falla en `ship`/`publish`.
5. **Fidelidad.** Compara capturas a 390×844 y 1440×900 contra la de Stitch.
6. **Parar.** Nunca `ship`, `seed`, push ni promoción de algo que falle una compuerta.

**Checklist de fidelidad:** sin bloques vacíos (hero con foto) · composición y jerarquía iguales · escala del titular
similar · contraste AA · sin efectos caros (backdrop-filter, parallax) · dentro de presupuesto (hero ≤ 120 KiB, CSS ≤ 1.2 KB
gzip) · `kit probe` 16/16 · lo que se aproximó queda anotado en el reporte.

**Disciplina anti-inflación:** tope de 6 secciones nacidas de Stitch; `--allow-similar` solo con una razón escrita.
