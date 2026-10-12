# Flujo de trabajo de plantillas

Cómo viaja una plantilla desde el código hasta el sitio de un cliente, qué toca cada arreglo y cómo
ajustar márgenes, tamaños de letra y responsive rápido y sin riesgo. Todo lo de aquí está sacado del
código (rutas exactas entre comillas invertidas); si algo no coincide, manda el código.

> No hay base de datos local. `template:seed` escribe directo en el proyecto **remoto** de Supabase
> (una sola fila de `public.templates`, la de esa plantilla) y en R2. Úsalo con `--dry-run` primero.

## 1. Dónde vive una plantilla

Una plantilla **es código** en `packages/template-kit`; no se edita un `.grapesjs` a mano.

| Pieza | Ruta | Qué decide |
|---|---|---|
| Manifiesto | `templates/<id>.ts` (ej. `barberia-norte-v1.ts`) | nombre, categoría, `tier`, tema, textos, qué secciones y en qué orden, `motion` |
| Secciones | `sections/<slot>/<variante>/section.{html,css}` | estructura y estilos de cada bloque. **Se comparten** entre plantillas |
| CSS común | `core.css` | contenedor, títulos, botones, utilidades `lz-*` |
| Tema | `themes/<tema>.json` | colores, fuentes, forma, densidad, `rhythm` (ritmo global). **Único por plantilla** dentro de un rubro |
| Textos | `content/<rubro>.<voz>.es-MX.ts` | copy por voz |
| Imágenes | `assets/<rubro>/<tema>/` | fotos; si falta una, se genera un placeholder |

`kit:compile` (o `kit:build`, que además valida y toma capturas) genera `dist/<id>/`:
`<id>.grapesjs` (lo que recibe el cliente en el editor), `index.html` (preview), `template.meta.json`
(tier, motion) y `assets/`. `dist/` no se commitea.

## 2. De la fuente a Supabase (el seed)

`pnpm template:seed -- --only <id>` compila, valida y corre `scripts/parse-and-seed-template.ts`
solo para esa plantilla. Etapas (todas idempotentes; si algo falla, re-ejecuta el mismo comando):

1. **validate** — proyecto de una página, tipo `web`.
2. **1b motion** — etiqueta cada sección con `data-lz-section` + `data-lz-pattern` y el contenedor
   raíz con `data-lz-motion` (preset de `motion.preset` del manifiesto; `data-lz-progress` si
   `motion.progress`). Imprime la tabla: tipo, patrón, por qué, grupos estimados en móvil.
3. **collect / migrate** — sube las imágenes a R2 bajo `templates/<id>/…` (optimizadas a WebP).
4. **rewrite** — cambia las rutas locales por URLs de `assets.lattiz.app`.
5. **preview** — escribe `apps/template-previews/public/<id>/index.html`. Si la plantilla es Pro,
   lleva el runtime de Lattiz Motion **copiado dentro** (ver §5). Este archivo sí se commitea.
6. **upsert** — `public.templates` por `id`: si no existía, la crea **inactiva**; si existía, la
   actualiza y **conserva** `is_active`. Si cambias el tier y hay clientes usándola, avisa.
7. **deploy previews** — `vercel deploy --prod` de `apps/template-previews` (sube la carpeta completa
   de previews; las demás plantillas no cambian porque sus archivos no cambiaron). Se salta con
   `--no-deploy`; después: `pnpm --filter @lattiz/template-previews run deploy`.
8. **thumbnail** — captura del preview publicado → R2 → `thumbnail_url`.
9. **activate** — `is_active = true` solo si 7 y 8 salieron bien.

Requisitos: `.env` raíz con `TEMPLATE_PREVIEWS_BASE_URL`, `STORAGE_PROVIDER=r2` + `R2_*`, Supabase
(se leen de `apps/api/.env` si faltan) y `VERCEL_SCOPE` del equipo de previews.

## 3. Cómo recibe un cliente la plantilla

**Se copia en el momento de elegirla.** `apps/api/src/modules/sites/sites.service.ts`:

- Primera carga del editor sin sitio (`getEditorProject`) o `select-template`: copia
  `templates.grapesjs_json` a `site_schemas.grapesjs_json` del cliente.
- Cambio de plantilla (`changeTemplate`): archiva el proyecto actual y su HTML publicado en
  `template_archives` y lo reemplaza por la plantilla nueva (contenido y publicación se reinician).
- Al publicar, el editor exporta el HTML y se guarda en `site_schemas.exported_html`.
- `apps/tenant-sites/app/route.ts` sirve ese HTML y en cada visita le inyecta SEO, JSON-LD, analítica
  y —solo si el cliente es Pro— el runtime de Lattiz Motion.

## 4. Qué afecta cada arreglo

| Cambias… y haces… | Lo ven | No lo ven |
|---|---|---|
| Plantilla (manifiesto, sección, tema, textos) + `template:seed` | Preview y miniatura; **clientes que la elijan o cambien a ella desde ahora** | Clientes que ya la adoptaron (tienen su copia) y sus sitios publicados |
| Una sección compartida (`sections/<slot>/<variante>`) | Todas las plantillas que usan esa variante, al re-sembrarlas | Clientes existentes |
| El runtime de Motion (`apps/tenant-sites/lib/lz-motion`) + deploy de tenant-sites | **Todos los sitios Pro publicados, al instante** (se inyecta al servir) | Previews: traen una copia del runtime; se actualizan al re-sembrar cada plantilla Pro |
| Ediciones en el editor de un cliente | Solo ese cliente | La plantilla original |

No hay propagación automática a clientes existentes. Para que un cliente reciba un arreglo tendría
que cambiar de plantilla (pierde su contenido, que queda archivado) o hacerlo él en el editor.

## 5. Versiones, tier y activación

- El id lleva versión: `barberia-norte-v1`. **Mejoras compatibles**: mismo id, re-sembrar (upsert).
  **Cambios grandes** (estructura, otra composición del hero, quitar o reordenar secciones): id nuevo
  (`-v2`) y nueva fila. Como los clientes reciben una **copia** al elegir (§3), los que ya usan la
  `-v1` no ven ningún arreglo de la plantilla; la `-v2` deja claro qué versión tiene cada quien. El
  seed nunca desactiva otra plantilla.
- **Pro/Básico**: `tier` del manifiesto → `template.meta.json` → `templates.tier`. Qué planes la
  pueden usar se calcula en la API al leer (`modules/templates/template-access.policy.ts`). Un tema
  Pro solo sirve a plantillas Pro (lo valida `kit:validate`).
- **Motion**: solo sitios Pro. `motion.preset` (`calm` | `editorial` | `none`) en el manifiesto; tipos
  de sección a mano en `motion.sections` (ver `docs/template-patterns.md`).

## 6. Cómo ajustar una plantilla

### Comandos

`pnpm lattiz` (`docs/lattiz-cli.md`) junta estos comandos en un flujo guiado (`doctor`, `new`, `dev`,
`motion`, `check`, `seed`, `deploy`, `publish`, `ship`).

| Comando | Para qué |
|---|---|
| `pnpm template:dev <id>` (= `pnpm lattiz dev <id>`) | Servidor local en `http://localhost:4400` con recarga en vivo: recompila al guardar secciones, tema, textos o manifiesto. Renderiza con la misma composición que `route.ts` (Motion solo en Pro). Barra: 360/390/768/1024/1440, 1366×768 y 844×390, Motion on/off y preset, «Reduced motion», abrir sin marco. No toca nada remoto. |
| `pnpm template:shots <id>` | Capturas a 360/390/768/1024/1440 en `packages/template-kit/dist/<id>/shots/` (no se commitean) + reporte: elementos más anchos que la pantalla, texto < 12 px, botones/enlaces < 44 px. **Reporte de encaje** (`fit.json`, `fit-<viewport>.png`): cada sección con `data-lz-fit` (los héroes) en 1440×900, 1366×768, 1280×720, 1920×1080, 390×844, 360×640 y 844×390 contra 0.9 × (alto de ventana − header): PASS / PASS (text) / FAIL / n/a. |
| `pnpm --filter @lattiz/template-kit kit:validate dist/<id>` | Reglas del kit (contraste, breakpoints 992/480, etc.). `template:seed` lo corre siempre. |
| `pnpm template:seed -- --only <id> --dry-run` | Muestra la clasificación de secciones (tipo y patrón de animación) y los assets; no escribe nada. |
| `pnpm template:seed -- --only <id>` | Siembra esa plantilla (fila + R2 + preview + deploy de previews). Con `--no-deploy` no publica previews ni toma miniatura. |

### El flujo, de punta a punta

1. **Fuente** — cambia manifiesto, tema o sección en `packages/template-kit`.
2. **Preview local** — `pnpm template:dev <id>`: revisa 360…1440, Motion on/off, reduced motion.
3. **Motion dry-run** — `pnpm template:seed -- --only <id> --dry-run`: ¿cada sección tiene el tipo y
   el patrón correctos? Si no, corrige `motion.sections` en el manifiesto (ver «Seeding with motion»
   en `docs/template-patterns.md`).
4. **Capturas y encaje** — `pnpm template:shots <id>`: sin `overflow`, héroes en PASS, CTA visible.
5. **Sembrar una** — `pnpm template:seed -- --only <id>` (escribe directo en el Supabase remoto).
6. **Publicar previews** — lo hace el paso anterior; si usaste `--no-deploy`:
   `pnpm --filter @lattiz/template-previews run deploy` y vuelve a correr el seed para la miniatura.
7. **Verificar** — la fila en Supabase y `https://templates.lattiz.app/<id>`; commitea el
   `apps/template-previews/public/<id>/index.html` regenerado.
8. **Runtime** — si cambiaste Lattiz Motion: `pnpm --filter @lattiz/tenant-sites build:motion`,
   commit y `vercel --prod` de tenant-sites (llega al instante a todos los sitios Pro publicados).

### Ajustes de encaje en pantalla (viewport-fit)

El hero (y cualquier sección con `data-lz-fit`) ocupa como máximo el 90 % de la ventana bajo el
header: `--lz-fit = 0.9 × (100svh − --lz-header-h)`. Si un hero no cabe: baja el tope de su titular
(`titleHero` en `rhythm` del tema, o el `svh` en `section.css`), limita la imagen con
`max-height: var(--lz-fit)` o reduce el padding en `svh`. Nunca `overflow: hidden` para esconder lo que
sobra. Ventanas de ≤ 560 px de alto (celular horizontal) vuelven al flujo normal a propósito.

### Tres niveles, del más amplio al más puntual

**a) Ritmo global del tema** — `themes/<tema>.json › rhythm`. Cada tema es único dentro del rubro,
así que en la práctica es «por plantilla». Úsalo para «todo se siente apretado», «los títulos están
chicos en tablet», «el margen lateral en móvil es poco». Valores por defecto = los originales:

| Clave | Variable | Por defecto | Qué mueve |
|---|---|---|---|
| `sectionPad` | `--lz-section-pad` | según `density` (Norte: `clamp(96px, 13vw, 184px)`) | aire arriba/abajo de cada sección |
| `gutter` / `gutterMd` / `gutterSm` | `--lz-gutter*` | `24px` / `18px` (≤ 992) / `12px` (≤ 480) | margen lateral del contenido |
| `space` | `--lz-space` | `1` | multiplica gaps, márgenes y paddings dentro de las secciones (`1.15` = 15 % más aire) |
| `textScale` | `--lz-text-scale` | `1` | multiplica texto de cuerpo y etiquetas (≤ 20 px) |
| `titleHero` / `titleHeroSm` | `--lz-title-hero*` | `clamp(48px, 6.8vw, 104px)` / `clamp(40px, 12vw, 56px)` | titular del hero (`split`) |
| `titleSection` / `titleSectionSm` | `--lz-title-section*` | `clamp(40px, 6vw, 88px)` / `clamp(40px, 12vw, 58px)` | títulos de sección |
| `titleSub` | `--lz-title-sub` | `clamp(24px, 2.6vw, 34px)` | subtítulos (nombres y precios de la carta editorial) |

Además siguen `container` (ancho máximo), `density`, `shape` (radios, bordes, sombras) y `colors`.
`--lz-display-scale` (`fonts.displayScale`) escala todos los títulos de una fuente ancha o angosta.

> Alcance hoy: `space` y `textScale` solo los respetan `core.css` y las 11 variantes de
> `barberia-norte-v1` (navbar/centered-logo, hero/split, about/statement, services/editorial-table,
> team/list, gallery/strip, testimonials/quote-feature, faq/two-col, locations/with-contact,
> floating-whatsapp/bubble, footer/minimal-centered). Las demás variantes aún usan px fijos.

Ejemplo (lo que ya lleva Norte, para que el título no salte de 58 px a 40 px entre 480 y 481 px):

```json
"rhythm": {
  "titleHero": "clamp(40px, 4.87vw + 27.8px, 104px)",
  "titleHeroSm": "var(--lz-title-hero)",
  "titleSection": "clamp(40px, 3.77vw + 32px, 88px)",
  "titleSectionSm": "var(--lz-title-section)"
}
```

Para una escala fluida: `clamp(mínimo, Avw + Bpx, máximo)`; elige A y B para que en 390 px y en
1440 px dé el tamaño que quieres (A = diferencia ÷ 10.5, B = tamaño en 390 − A × 3.9).

**b) CSS de una sección** — `sections/<slot>/<variante>/section.css`. Para algo que solo está mal en
un bloque (un gap, un tamaño puntual, un breakpoint). Ojo: **la variante se comparte**. Antes de
tocarla, revisa quién la usa: `grep -l "variant: '<variante>'" packages/template-kit/templates/*.ts`.
Si el cambio solo le conviene a una plantilla, no lo fuerces en la compartida: crea una variante
nueva (regla del kit). No hay un `overrides.css` por plantilla a propósito: el tema (nivel a) ya es
por plantilla y los overrides sueltos romperían el validador y la similitud entre plantillas.
Breakpoints: solo 992 y 480 (lo exige `kit:validate`).

**c) Editor visual (GrapesJS)** — cambios que hace un cliente o soporte sobre **un** sitio. Nunca
regresan a la plantilla ni a otros clientes. Útil para arreglar un caso puntual ya publicado.

### Receta: ajustar y publicar un arreglo

1. `pnpm template:dev barberia-norte-v1` y abre `http://localhost:4400`.
2. Cambia `themes/norte-atelier.json › rhythm` (o el CSS de la sección). Se recarga solo; revisa 360,
   390, 768, 1024 y 1440, con Motion encendido y con «Reduced motion».
3. `pnpm template:shots barberia-norte-v1`: el reporte debe quedar sin `overflow`; revisa los PNG.
4. Si tocaste una sección compartida, compila y revisa también las otras plantillas que la usan.
5. `pnpm template:seed -- --only barberia-norte-v1 --dry-run`: revisa la tabla de secciones.
6. `pnpm template:seed -- --only barberia-norte-v1`: siembra, despliega previews y activa.
7. Verifica la fila en Supabase (`select id, tier, is_active, preview_url, thumbnail_url from
   public.templates where id = 'barberia-norte-v1'`) y abre `https://templates.lattiz.app/<id>`.
8. Commitea `apps/template-previews/public/<id>/index.html` junto con el cambio.

Recuerda (§4): esto no cambia a los clientes que ya usan la plantilla.
