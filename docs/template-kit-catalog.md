# Catálogo del template kit

Inventario del kit, capacidad por giro y la extensión del catálogo (más portadas, secciones, paletas,
tipografías y estilos por giro) **sin cambiar nada de lo que ya existe**: extender, nunca mutar.
Guía de principios de diseño: `docs/template-kit-design-principles.md`.

## Estado de la extensión

Se trabaja en tres partes (Parte 1: cimientos; Parte 2: secciones y arquetipos; Parte 3: integración,
prueba de diversidad, docs y skill). Una sesión nueva retoma desde aquí. Estados: `pendiente` ·
`en curso` · `hecho` · `bloqueado`.

| WP    | Qué                                              | Estado    | Commits | Desviaciones                                   |
| ----- | ------------------------------------------------ | --------- | ------- | ---------------------------------------------- |
| WP-1  | Línea base y snapshot dorado                     | hecho     | a151e30 | ver abajo                                      |
| WP0   | Inventario y modelo de capacidad                 | hecho     | 405ac7d | Motion lo pone el seed, no el markup           |
| WP0.5 | Skills de diseño: instalar, leer, destilar       | hecho     | (este)  | hover con `(hover: hover) and (pointer: fine)` |
| WP1   | Versionado del catálogo (legacy/extended) y lock | pendiente |         |                                                |
| WP2   | Galería del kit y especímenes                    | pendiente |         |                                                |
| WP3   | Tokens de estilo                                 | pendiente |         |                                                |
| WP4   | Biblioteca de paletas                            | pendiente |         |                                                |
| WP5   | Biblioteca de pares tipográficos                 | pendiente |         |                                                |
| WP6   | Variantes de sección                             | pendiente |         |                                                |
| WP7   | Arquetipos de página y módulos verticales        | pendiente |         |                                                |
| WP8   | Registro, spec, compilador, CLI y skill          | pendiente |         |                                                |
| WP9   | Prueba de diversidad (local)                     | pendiente |         |                                                |
| WP10  | Documentación                                    | pendiente |         |                                                |

**Diseño:** reglamento y diales por arquetipo en `docs/template-kit-design-principles.md` (taste-skill
`d237dd3` y skills de Emil Kowalski `2d22863`, MIT, instaladas en `~/.claude/skills`, no en el repo).
Diales V/M/D por defecto: editorial 6/5/3 · showcase 8/6/3 · catalog 5/4/6 · booking 4/4/5 · trust
3/4/5 · bold 9/7/4 · soft 5/5/3 · minimal 5/4/2 (Básico siempre sin Motion).

**Regla de cada WP:** `pnpm --filter @lattiz/template-kit kit:verify-snapshot` limpio, `pnpm lint`,
`pnpm typecheck` y build antes del commit.

### Línea base (WP-1, 2026-10-12)

- **Repo:** rama `claude/awesome-keller-ss1s44` reiniciada desde `main` (`cdafdc5`); el PR #3 (CLI
  Fase 1) ya está fusionado. Desde entonces `main` sumó la Fase 2–4: spec + compilador (`kit:spec`),
  registro de giros (10), skill `lattiz-template`, `services/product-grid`, imágenes por URL.
- **CodeGraph:** el índice `.codegraph/` está vacío y el ejecutable `codegraph` no existe en este
  contenedor (el MCP no conecta); el descubrimiento se hizo leyendo el código.
- **Comprobaciones:** `pnpm install` ok · `pnpm typecheck` ok (7/7) · `pnpm lint` ok · tests del kit
  87/87 · `kit:validate` 26/26 sin hallazgos · `pnpm build` **falla solo en `@lattiz/tenant-sites`**
  por falta de variables de Supabase en el contenedor (preexistente, no es de este trabajo); el resto
  compila (`turbo run build --filter='!@lattiz/tenant-sites'`).
- **Snapshot dorado:** `packages/template-kit/golden/snapshot.json` (`kit:snapshot`), verificado con
  `kit:verify-snapshot` (~16 s). Compila las 26 plantillas en memoria contra una copia de `assets/` y
  guarda un hash por salida (proyecto `.grapesjs`, `index.html`, CSS, `:root`, tema, pack de copy,
  `template.meta.json`, imágenes) y el tamaño (CSS, HTML del editor, `index.html`; crudo y gzip).
  También planea en memoria los 15 specs (`specs/`, `fixtures/spec/`, `fixtures/spec/skill-eval/`) y
  guarda el hash de cada archivo que generarían y las elecciones del compilador: así detecta que un
  pool que crece cambie la elección de un spec existente. Dos corridas seguidas dan lo mismo.
- **Kit:** 12 slots, 31 variantes, 26 temas, 15 pares tipográficos, 7 formas. Plantillas y pools por
  giro:

| Giro        | Plantillas (Pro/Básico) | Paletas | Pares | Formas | Portadas Pro usadas                         | Tonos de acento usados              |
| ----------- | ----------------------- | ------- | ----- | ------ | ------------------------------------------- | ----------------------------------- |
| barberia    | 8 (4/4)                 | 9       | 9     | 6      | centered-arch, offset-card, split, image-bg | gris ×2, 13, 74, 150, 226, 262, 338 |
| clinica     | 2 (1/1)                 | 5       | 5     | 5      | split                                       | 12, 167                             |
| dental      | 2 (1/1)                 | 5       | 5     | 4      | split                                       | 41, 212                             |
| despacho    | 2 (1/1)                 | 5       | 5     | 4      | image-bg                                    | 219, 350                            |
| estetica    | 2 (1/1)                 | 5       | 5     | 4      | split                                       | 266, 336                            |
| floreria    | 2 (1/1)                 | 5       | 5     | 5      | offset-card                                 | 292, 340                            |
| gimnasio    | 2 (1/1)                 | 5       | 5     | 4      | image-bg                                    | 18, 76                              |
| restaurante | 2 (1/1)                 | 6       | 5     | 6      | split                                       | 10, 338                             |
| tienda      | 2 (1/1)                 | 5       | 5     | 5      | image-bg                                    | 102, 223                            |
| veterinaria | 2 (1/1)                 | 5       | 5     | 4      | split                                       | 17, 169                             |

## Inventario (WP0, sacado del código el 2026-10-12)

Si algo de aquí ya no coincide, manda el código (`packages/template-kit`).

### Slots, variantes y tier

Un slot es un rol de la página resuelto por giro (`blueprints/service-landing.shared.ts › verticals`:
catalog → `services`, proof → `gallery`, contact → `locations`, header → `navbar`, whatsapp →
`floating-whatsapp`). El blueprint de cada tier dice qué roles caben; cuando un rol **no** lista
variantes, vale cualquier carpeta de `sections/<slot>/` (el compilador las lee del disco).

| Slot (rol)                   | Variantes                                                | Básico                 | Pro                                               | CSS crudo / gzip (B)                      |
| ---------------------------- | -------------------------------------------------------- | ---------------------- | ------------------------------------------------- | ----------------------------------------- |
| navbar (header)              | `inline`, `centered-logo`                                | ambas                  | ambas                                             | 2282/755 · 3026/906                       |
| hero (hero)                  | `image-bg`\*, `split`\*, `centered-arch`, `offset-card`  | todas                  | todas, **única por giro**                         | 2582/926 · 2619/870 · 2167/760 · 2274/812 |
| marquee (marquee)            | `ticker`                                                 | —                      | opcional, no cuenta                               | 1109/469                                  |
| about (about)                | `brief`, `statement`, `stats-strip`, `text-image-offset` | `brief` (opcional)     | `text-image-offset` · `statement` · `stats-strip` | 1201/433 · 1472/524 · 1640/550 · 1855/672 |
| services (catalog)           | `price-list`, `cards`, `editorial-table`, `product-grid` | todas                  | todas                                             | 2294/676 · 2465/704 · 3114/800 · 2681/773 |
| gallery (proof)              | `grid`, `mosaic`, `strip`                                | —                      | todas                                             | 1272/553 · 1332/527 · 1134/461            |
| team (team)                  | `grid`, `list`                                           | —                      | opcional                                          | 1814/620 · 2015/678                       |
| testimonials (testimonials)  | `cards`, `quote-feature`                                 | —                      | ambas                                             | 2000/606 · 2035/639                       |
| faq (faq)                    | `list`, `two-col`                                        | ambas                  | ambas                                             | 1737/652 · 2536/793                       |
| locations (contact)          | `single`, `with-contact`, `cards`                        | `single`               | `with-contact`                                    | 1603/545 · 3872/983 · 1141/441            |
| floating-whatsapp (whatsapp) | `bubble`                                                 | obligatorio, no cuenta | obligatorio, no cuenta                            | 1450/588                                  |
| footer (footer)              | `big-wordmark`, `columns`, `minimal-centered`            | todas                  | todas                                             | 2718/830 · 3252/858 · 3235/794            |

\* Con `data-lz-fit` (encaje al viewport). `locations/cards` no está en ningún blueprint. Total: 12
slots, 31 variantes. `core.css` (11.3 KB, 2.6 KB gzip) va en todas las plantillas.

**Claves de copy y límites.** Cada variante declara las claves que lee en `meta.ts › contentKeys`
(`prices[].name`, `sticker?` = opcional); `src/spec/copy-lint.ts › COPY_LIMITS` fija el máximo de
caracteres visibles por clave (≈ 20 % sobre el copy más largo que ya cabe a 1366×768 y 390×844), y
`lattiz giro show <giro>` las imprime con el ejemplo del giro. Límites actuales: `hero.title` 56,
`hero.text` 150, `hero.eyebrow` 48, CTAs 16–24, `about.paragraphs[]` 230, `about.stats[].value` 14,
`services.prices[].name` 36 / `price` 12 / `description` 96, `gallery.items[].caption` 34,
`team.members[].name` 24 / `role` 30, `testimonials.reviews[].text` 190, `faq.items[].question` 70 /
`answer` 220, `footer.about` 160, `head.title` 60 / `description` 160 (lista completa en el código).

### Cómo se registra y se empaqueta una variante

- Carpeta `sections/<slot>/<variante>/` con `section.html` (fragmento con `data-lz-key|attr-*|if|each`
  y raíz `data-lz-slot` + `data-lz-variant`), `section.css` y `meta.ts` (`label`, `region`,
  `description`, `contentKeys`, `numbered?`, `placeholder` = tamaño de la imagen generada).
- No hay registro central: el compilador encuentra la carpeta por nombre, y `allowedVariants` lista
  las carpetas del slot cuando el blueprint no fija variantes. **Consecuencia:** agregar una carpeta
  cambia el pool que ven los specs existentes (portada libre y pase de similitud); de ahí el WP1.
- **CSS por plantilla = `:root` del tema + `core.css` + el CSS de las variantes usadas**
  (`compileManifest`). El CSS de variantes no usadas **no** se incluye: no hace falta tree-shaking.
  Una plantilla Pro pesa ~30–33 KB de CSS (5.4–5.9 KB gzip) y `index.html` ~57–62 KB (12–13.8 KB
  gzip); una Básica ~24–25 KB de CSS (4.5–4.8 KB gzip) y ~41–44 KB de HTML (9.5–9.8 KB gzip). Las
  cifras exactas por plantilla están en `golden/snapshot.json › size`.

### Tema, paleta y tipografía

- **Tema** (`themes/<nombre>.json`, tipo `Theme`): `tier`, `fontPair`, 14 `colors`, `fonts`
  (familias, `googleFonts`, caja, interlínea, peso, `displayScale`, acento), `shape` (`radiusCard` ≤ 32
  px, `radiusPill`, `border`, `shadow` none|soft|hard-offset), `density` (airy|regular|compact →
  `--lz-section-pad` y `--lz-stack`), `photoTreatment`, `placeholder`, `accentWords`, `container`,
  `effects`, `rhythm?`. `themeVariables` (`src/lib/theme.ts`) es el único lugar donde entran valores a
  `:root`; todo token que emite va en **todas** las plantillas.
- **Paleta curada** (`GiroPalette`, `src/spec/presets.ts › palette()`): 8 colores semilla + `scheme`
  → los 14 tokens (líneas, overlay, navbar derivados con `color-mix()`), `accentWords`,
  `photoTreatment`, `placeholder`, `effects`. Viven **por giro** en `giros/<giro>.ts › palettes`
  (barbería deriva sus 6 primeras de los temas hechos a mano). `paletteFindings` corre las reglas de
  contraste de `kit:validate` sobre una paleta sola; `kit:spec presets` las lista.
- **Par tipográfico** (`FONT_PAIRS`): display, serif de acento, body, mono opcional, query `css2` de
  Google Fonts y ajustes de display. `CUSTOM_FONTS` = familias permitidas en un par propio.
- **Entrega de fuentes:** `<link>` a `fonts.googleapis.com/css2?…&display=swap` con `preconnect` a
  `fonts.googleapis.com` y `fonts.gstatic.com`; sin auto-hospedaje ni `preload`. Google sirve los
  subconjuntos por `unicode-range` (latin y latin-ext incluidos, así que el español completo llega sin
  pedirlo). Para cada familia con métricas en `@capsizecss/metrics` el kit emite un `@font-face` local
  con `size-adjust`/`ascent-override` (Times New Roman, Arial o Courier New) para que el cambio de
  fuente no mueva el texto (CLS ≈ 0); `CAPS_SIZE_ADJUST` calibra Anton y Archivo Black en mayúsculas.

### Reglas de unicidad y similitud (`kit:validate`)

Dentro del giro (`vertical`, cualquier tier): tema único, `fontPair` único, titular del hero único
(normalizado), **tono del acento a ≥ 30°** de cualquier otra plantilla (`MIN_ACCENT_HUE_DISTANCE`; un
acento casi gris, croma ≤ 0.08, no cuenta) y, solo entre Pro, **variante de hero única**. Similitud
contra el mismo giro **y** tier (`src/lib/similarity.ts`): Jaccard de pares slot:variante 0.25 +
orden 0.05 + misma portada 0.15 + mismos servicios 0.10 + mismo tema 0.15 + mismo par 0.15 + misma
forma (radios, borde, sombra) 0.15; límite Básico 0.85, Pro 0.5. Fuera de `kit:validate`:
`kit:compare-visual` (distancia de la mitad superior ≥ 0.33 contra el giro).

Consecuencia para la capacidad: con acentos a ≥ 30° caben como máximo 12 tonos por giro; las Pro de
un giro están topadas por el número de portadas; el par tipográfico y el tema son uno por plantilla.

### Cómo elige el compilador (`src/spec/compile.ts › planSpec`)

Semilla = los primeros 8 hex del sha256 del id de la plantilla. Para cada tier:

1. **Paleta:** la fijada en el spec (o la propia, derivada AA) va primero; luego las del giro rotadas
   por la semilla; gana la primera con acento a ≥ 30° de todas las del giro. Una curada que choca se
   cambia y se avisa; una propia que choca falla.
2. **Par tipográfico:** igual, sobre `giro.fontPairs`; gana el primero que nadie del giro usa.
3. **Forma:** la del spec, o la primera de `giro.shapes` (la Básica de un par rota con semilla + 1).
4. **Portada:** si la variante está tomada (Pro: por otra Pro del giro; Básica de un par: por su Pro),
   prueba la del giro y luego las permitidas rotadas por la semilla.
5. **Titular:** el del spec, luego `copy.hero.alternates`, luego `giro.heroAlternates`.
6. **Similitud:** mientras pase el límite, cambia la variante no fijada que más la baja, en el orden
   services, about, footer, navbar, team, testimonials, gallery, faq (solo variantes cuyo copy cabe).
7. **Arquetipo:** Básico `essential`; Pro el de la forma (`editorial-atelier`, `street-luxe`,
   `neo-brutal`), y `street-luxe` si la forma es editorial con paleta oscura.

Como los pools (paletas, pares, carpetas de variantes) se recorren rotados, **cualquier elemento nuevo
en un pool cambia la elección de un spec existente al recompilar** → WP1.

### Motion y encaje por slot

- Las secciones del kit **no** llevan `data-lz-section`: el seed lo agrega
  (`scripts/lib/motion-sections.ts`) por slot (`hero` → hero, `about` → about, `services` → cards,
  `gallery` → gallery, `team` → team, `testimonials`, `faq`, `locations` → contact, `footer`; navbar,
  marquee y floating-whatsapp se saltan) con el patrón por defecto del runtime (cards → converge,
  gallery → wave, faq/testimonials → alternate, stats → center-out). `manifest.motion.sections`
  corrige tipo y patrón. Solo los sitios Pro cargan el runtime; Básico no lleva JS.
- **Encaje (`data-lz-fit`):** solo `hero/image-bg` y `hero/split`. `--lz-fit = 0.9 × (100svh −
--lz-header-h)`; cada navbar redeclara `--lz-header-h` **sumando `--lz-border-width`** (el borde
  inferior de 1–3 px del tema; olvidarlo hacía que la portada se pasara del pliegue).

### Blueprint y giros

`giros/<giro>.ts` da las secciones por defecto de cada tier (ver `lattiz giro show`), sus paletas,
pares y formas en orden de preferencia, copy es-MX, alternativas de titular, imágenes y Motion. 10
giros: barbería, clínica, dental, despacho, estética, florería, gimnasio, restaurante, tienda,
veterinaria.

## Capacidad por giro

`pnpm lattiz kit capacity [--giro <g>] [--catalog legacy|extended] [--json]` (o
`pnpm --filter @lattiz/template-kit kit:capacity`). Simula specs sintéticos con el compilador real,
uno tras otro (cada uno con titular propio), hasta que una regla de unicidad lo detiene. Columnas:

- **Paletas / pares / portadas Pro libres:** del pool del giro, cuántas no chocan hoy.
- **Tonos libres:** acentos de color que aún caben a ≥ 30° de los del giro (cuenta voraz). Los
  acentos casi grises no cuentan para la regla, así que no se agotan.
- **Caben:** pares (Básico + Pro), solo Pro y solo Básico, cada uno desde el estado actual; **Total**
  = pares hasta que se detienen, luego Básicos, luego Pros.
- **Qué lo limita:** el primer error del compilador al detenerse.

Antes de la extensión (catálogo `legacy`, 2026-10-12):

| Giro        | Plantillas (Pro/Básico) | Paletas libres | Pares libres | Portadas Pro libres | Tonos libres | Caben: pares | +Pro | +Básico | Total | Lo limita            |
| ----------- | ----------------------- | -------------- | ------------ | ------------------- | ------------ | ------------ | ---- | ------- | ----- | -------------------- |
| barberia    | 8 (4/4)                 | 3/9            | 3/9          | 0/4                 | 4            | 0            | 0    | 3       | 3     | paletas (y portadas) |
| clinica     | 2 (1/1)                 | 3/5            | 3/5          | 3/4                 | 9            | 1            | 3    | 3       | 3     | paletas              |
| dental      | 2 (1/1)                 | 3/5            | 3/5          | 3/4                 | 9            | 1            | 3    | 3       | 3     | paletas              |
| despacho    | 2 (1/1)                 | 3/5            | 3/5          | 3/4                 | 9            | 1            | 3    | 3       | 3     | paletas              |
| estetica    | 2 (1/1)                 | 3/5            | 3/5          | 3/4                 | 9            | 1            | 3    | 3       | 3     | paletas              |
| floreria    | 2 (1/1)                 | 3/5            | 3/5          | 3/4                 | 9            | 1            | 3    | 3       | 3     | paletas              |
| gimnasio    | 2 (1/1)                 | 3/5            | 3/5          | 3/4                 | 9            | 1            | 3    | 3       | 3     | paletas              |
| restaurante | 2 (1/1)                 | 4/6            | 3/5          | 3/4                 | 9            | 1            | 3    | 3       | 3     | pares tipográficos   |
| tienda      | 2 (1/1)                 | 3/5            | 3/5          | 3/4                 | 9            | 1            | 3    | 3       | 3     | paletas              |
| veterinaria | 2 (1/1)                 | 3/5            | 3/5          | 3/4                 | 9            | 1            | 3    | 3       | 3     | paletas              |

Meta después de la extensión: **≥ 12 de holgura (Total) por giro principal sin tocar umbrales.** Lo
que la topa, en orden: (1) paletas con tonos libres → WP4; (2) pares tipográficos libres → WP5; (3)
portadas Pro (una por Pro del giro) → WP6 (+5); (4) el techo de 12 tonos de color por giro: barbería
ya usa 6 tonos y le quedan **4**; el resto de su holgura solo puede venir de paletas de acento neutro
(casi gris), que la regla existente no cuenta. Se reporta tal cual, sin bajar el umbral de 30°.
