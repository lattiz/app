# Catálogo del template kit

Inventario del kit, capacidad por giro y la extensión del catálogo (más portadas, secciones, paletas,
tipografías y estilos por giro) **sin cambiar nada de lo que ya existe**: extender, nunca mutar.
Guía de principios de diseño: `docs/template-kit-design-principles.md`.

## Estado de la extensión

Se trabaja en tres partes (Parte 1: cimientos; Parte 2: secciones y arquetipos; Parte 3: integración,
prueba de diversidad, docs y skill). Una sesión nueva retoma desde aquí. Estados: `pendiente` ·
`en curso` · `hecho` · `bloqueado`.

| WP    | Qué                                              | Estado    | Commits          | Desviaciones                                               |
| ----- | ------------------------------------------------ | --------- | ---------------- | ---------------------------------------------------------- |
| WP-1  | Línea base y snapshot dorado                     | hecho     | a151e30          | ver abajo                                                  |
| WP0   | Inventario y modelo de capacidad                 | hecho     | 405ac7d          | Motion lo pone el seed, no el markup                       |
| WP0.5 | Skills de diseño: instalar, leer, destilar       | hecho     | 95de8d4          | hover con `(hover: hover) and (pointer: fine)`             |
| WP1   | Versionado del catálogo (legacy/extended) y lock | hecho     | a29eedd          | nombrar un id nuevo vale en legacy                         |
| WP2   | Galería del kit y especímenes                    | hecho     | 1b2ec67          | sin GrapesJS: CSS real + fragmento renderizado             |
| WP3   | Tokens de estilo                                 | hecho     | 7b66734          | presets en `brand.style.*` (shape/density ya existían)     |
| WP4   | Biblioteca de paletas                            | hecho     | a48bfb8, f218ce5 | 39 paletas; 6 descartadas o rediseñadas por AA o duplicado |
| WP5   | Biblioteca de pares tipográficos                 | hecho     | 72ab016          | 16 pares; size-adjust medido para displays pesados         |
| WP6   | Variantes de sección                             | hecho     | 9c5a022…51782c5  | 16 variantes + slot `cta`; el rol `cta` se registra en WP8 |
| WP7   | Arquetipos de página y módulos verticales        | hecho     | fbc6d79          | datos en `archetypes/`; el compilador aún no los lee       |
| WP8   | Registro, spec, compilador, CLI y skill          | pendiente |                  |                                                            |
| WP9   | Prueba de diversidad (local)                     | pendiente |                  |                                                            |
| WP10  | Documentación                                    | pendiente |                  |                                                            |

**Parte 1 terminada (2026-10-12).** **Parte 2 terminada (2026-10-12)** y fusionada en `main` (PR #5,
`107352b`): WP6 y WP7, detalle en «Variantes nuevas (WP6)» y «Arquetipos y módulos verticales
(WP7)». Después, `main` sumó 14 plantillas por spec `extended` con lock (clínica `brote` y `cauce`,
estética `alheli`, florería `cardamina`, restaurante `ceniza`, `fresca-nube` y `margen`; PR #6 y
commits directos hasta `c2af6cb`) que todavía no estaban en el snapshot dorado. La Parte 3 (WP8–WP10)
sigue pendiente: registrar el rol `cta` y las variantes nuevas de `about`/`locations` en los
blueprints, mover el copy de `archetypes/verticals.ts` y los `sample` de cada `meta.ts` a
`giros/<giro>.ts`, y dejar que un spec `extended` elija arquetipo y módulos.

### Fases posteriores

| Fase             | Qué                                                                                          | Estado   | Detalle                      |
| ---------------- | -------------------------------------------------------------------------------------------- | -------- | ---------------------------- |
| Phase B / Stitch | Stitch como fuente de diseño: biblioteca de candidatos, harvester y `promote` con compuertas | en curso | `docs/design-stitch-flow.md` |
| Phase D / Stitch nativo | Secciones reconstruidas a mano desde diseños de Stitch (`hero/photo-ribbon`, dirección `insignia-musgo`), bloque del editor y compuerta de foto de portada | hecho (falta prueba del editor en vivo) | `docs/stitch-native-sections.md` |

Rama `feat/stitch-design-flow` (desde `main`). No toca `apps/tenant-sites`, Motion, seed ni plantillas existentes.

### Fase A1: estabilizar y habilitar (rama `feat/kit-phase-a1`, desde `c2af6cb`)

Antes de cualquier trabajo de diseño nuevo (Fase A2). Estado al 2026-10-14:

| WP  | Qué                                                        | Estado | Commits          | Desviaciones                                                                                                                           |
| --- | ---------------------------------------------------------- | ------ | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| WP1 | Snapshot: clasificar y resolver las diferencias            | hecho  | 47ba2b8, 10dbb6e | el fixture legacy no se arregla con paletas: se congelan las entradas del snapshot                                                     |
| WP2 | Capacidad: restaurante, clínica, barbería ≥ 14; resto ≥ 12 | hecho  | 0b133c4          | pares topados por portadas Pro (A2); 8 paletas neutras                                                                                 |
| WP3 | Manifiesto del catálogo (`catalog.manifest.json`)          | hecho  | 176002c          | sin `meta.motion` en el kit: Motion se lee del seed; la API no importa el kit                                                          |
| WP4 | Plan en el servidor (auditoría + `PlanGuard`)              | hecho  | 3c98c22          | exime lo que trae la plantilla del tenant; bloques `lzb-*` no se marcan (hueco); ver `docs/template-kit-plan-enforcement.md`           |
| WP5 | Presupuesto de bytes y línea base de Core Web Vitals       | hecho  | 8039184          | CWV como WARN; LCP > 2.5 s en 4 de 6 (laboratorio)                                                                                     |
| WP6 | Docs y decisiones                                          | hecho  | (este)           | decisiones: snapshot-recorded-inputs, catalog-manifest, schema-plan-guard, template-byte-budgets; template-palette-library actualizada |

**Línea base A1 (MacBook, Node 24.9, pnpm 11.5.2):** `pnpm lint` ok · `pnpm typecheck` ok (7/7) ·
`pnpm build` ok (4/4, desde la caché de turbo) · `lattiz doctor` ok · `kit:verify-snapshot` **falla
con 8 diferencias**, todas del fixture `restaurante-la-lumbre`, más 14 plantillas y 7 specs nuevos que
no están en el snapshot (notas, no fallas). Ningún hash de las 28 plantillas del snapshot cambió en
macOS (sin bytes dependientes del host).

**Cierre A1 (2026-10-14):** `kit:verify-snapshot` idéntico (42 plantillas, 23 specs) · `pnpm lint`
(con `kit:manifest --check`), `pnpm typecheck` (7/7) y `pnpm build` (4/4) ok · tests del kit 189/189 ·
API jest 200/200 y node 196/196. Nada remoto: sin seed, deploy, publish, Stripe, R2 ni Vercel; Supabase
solo lectura (conteos). Rama local `feat/kit-phase-a1`, sin push.

**Diseño:** reglamento y diales por arquetipo en `docs/template-kit-design-principles.md` (taste-skill
`d237dd3` y skills de Emil Kowalski `2d22863`, MIT, instaladas en `~/.claude/skills`, no en el repo).
Diales V/M/D por defecto: editorial 6/5/3 · showcase 8/6/3 · catalog 5/4/6 · booking 4/4/5 · trust
3/4/5 · bold 9/7/4 · soft 5/5/3 · minimal 5/4/2 (Básico siempre sin Motion).

**Regla de cada WP:** `pnpm --filter @lattiz/template-kit kit:verify-snapshot` limpio, `pnpm lint`
(incluye `kit:manifest --check`), `pnpm typecheck` y build antes del commit.

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

## Snapshot dorado: diagnóstico y procedimiento (A1 · WP1)

Clasificación de la línea base (2026-10-14, antes de cambiar nada):

| Diferencia                                                              | Clase                        | Causa                                                                                                                                                                                                                                                                       |
| ----------------------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 8 ✗ `fixtures/spec/skill-eval/restaurante-la-lumbre`                    | pool agotado por crecimiento | Spec `legacy` sin lock. La Pro fija `nocturno` (42°), que ahora choca con `restaurante-base-fresca-nube-v1` (41°); cae a `talavera`, el único tono legacy libre, y a la Básica no le queda ninguno. Contra las 28 plantillas con que se grabó el golden reproduce idéntico. |
| 14 plantillas nuevas (clínica 4, restaurante 6, estética 2, florería 2) | nuevas                       | Llegaron a `main` sin entrar al golden.                                                                                                                                                                                                                                     |
| 7 specs nuevos (todos `extended`, con lock)                             | nuevos                       | Ídem.                                                                                                                                                                                                                                                                       |
| Bytes dependientes del host                                             | —                            | Ninguno: los 28 hashes coinciden en macOS.                                                                                                                                                                                                                                  |
| Regresión real                                                          | —                            | Ninguna.                                                                                                                                                                                                                                                                    |

**Por qué no se arregla con paletas (WP2):** el fixture es `legacy` y solo ve las 6 paletas de
`giros/restaurante.ts`, que A1 no toca; la biblioteca `extended` no existe para él. El problema de fondo
era la herramienta: `kit:verify-snapshot` planeaba cada spec **sin su lock** y **contra la biblioteca
viva**, así que cualquier plantilla nueva del giro movía un plan grabado (y las paletas nuevas de WP2
habrían movido los 7 specs `extended`).

**Arreglo (`47ba2b8`, decisión de Santi: «congelar pares»):** cada entrada de spec del golden guarda sus
entradas: `peers` (las plantillas del giro contra las que se planeó, sin las suyas) y `locked` (se
planeó con `<stem>.lock.json`, igual que `lattiz build`). `verify` las reproduce: comprueba «mismas
entradas → mismo plan», que es lo que de verdad prueba que el kit no mutó. Una entrada sin `peers` se
planea contra las plantillas del golden. Si una plantilla de `peers` desaparece o falta el lock, es
falla. El estado vivo (qué cabe hoy en cada giro) lo dice `lattiz kit capacity`, no el snapshot. Ojo:
el fixture `restaurante-la-lumbre` **ya no se puede construir hoy** contra la biblioteca real (tampoco
con `lattiz build`); para el snapshot sigue sirviendo.

**Resultado:** `kit:verify-snapshot` idéntico con **42 plantillas y 23 specs**; ninguna entrada que ya
existía cambió (las 16 de spec solo ganaron `peers`). Las 14 plantillas se revisaron antes de entrar:
`kit:validate` sin hallazgos, `kit:shots` sin overflow a 360/390/768/1024/1440 y encaje `PASS` en toda
portada con `data-lz-fit` (844×390 es `n/a` por diseño). Quedan avisos ya conocidos de variantes
legacy: etiquetas de 10–11 px (`services/cards`, sub-marca del navbar) y enlaces de 32 px en
`footer/columns`. Los 7 specs reproducen sus 7 archivos (`lattiz build <stem> --dry-run`: «sin
cambios»). Costo: ~8 s y ~950 MB de RSS por corrida de `verify`; revisar las 14 plantillas
(`kit:validate` + `kit:shots`, una a la vez) tomó 320 s.

**Procedimiento: cómo entra una plantilla nueva al golden** (cada vez que sumes plantillas a `main`):

1. `pnpm --filter @lattiz/template-kit kit:verify-snapshot`: solo deben salir notas «plantilla nueva» /
   «spec nuevo»; cualquier `✗` se investiga antes (nunca se regenera para taparla).
2. Revisa cada plantilla nueva: `pnpm --filter @lattiz/template-kit kit:validate templates/<id>.ts`
   (sin hallazgos) y `pnpm --filter @lattiz/template-kit kit:shots <id>` (overflow 0 en todos los
   anchos). Si viene de un spec: `pnpm lattiz build <stem> --dry-run` dice «sin cambios».
3. `pnpm --filter @lattiz/template-kit kit:snapshot:add [id|stem…]` (sin argumentos agrega todo lo
   nuevo). Verifica todo primero y **no agrega nada** si alguna entrada existente ya difiere; nunca
   modifica entradas existentes.
4. `kit:verify-snapshot` otra vez (idéntico) y commitea `golden/snapshot.json` junto con la plantilla.

`kit:snapshot` (reescribir todo) queda solo para un re-baseline explicado en el commit.

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

## Versionado del catálogo y locks (WP1)

**Por qué:** el compilador elige paleta, par tipográfico y variantes rotando pools con una semilla del
id. Si un pool crece, la misma semilla cae en otro elemento y **recompilar un spec existente cambiaría
su plantilla** sin que nadie lo pidiera.

- **`brand.catalog`** (`legacy` | `extended`, opcional). **Sin el campo = `legacy`:** el compilador ve
  solo los pools de antes de la extensión, en su orden original: las paletas de `giros/<giro>.ts`,
  `giro.fontPairs` y las 31 variantes de `LEGACY_VARIANTS` (`src/spec/catalog.ts`; cualquier carpeta
  nueva en `sections/` es `extended` sin tener que marcarla). `extended` suma la biblioteca global de
  paletas (`packages/template-kit/palettes/`), la de pares (`packages/template-kit/font-pairs/`) y las
  variantes nuevas, ordenadas por afinidad con el giro. `lattiz spec init` escribe `extended`; los specs
  existentes siguen `legacy`.
- **Nombrar un id nuevo funciona en cualquier catálogo** (`brand.palette.preset`, `brand.fontPair`,
  `sections[].variant`): solo cambia el spec que lo nombra. Lo que depende del catálogo es lo que el
  compilador elige solo.
- **Lock** (`specs/<stem>.lock.json`, se commitea): por tier, la paleta, el par, la forma, el arquetipo
  y la variante de cada rol que resolvió el compilador, más `catalog` y `catalogVersion`. `lattiz build`
  lo lee y fija todo lo que el spec no fija; si algo del lock ya choca (por ejemplo, el spec ahora fija
  una paleta igual a la de otra plantilla), el build **falla** en vez de moverse, y sugiere
  `pnpm lattiz spec lock <stem> --refresh`. Un lock resuelto con otro catálogo se ignora. El build
  escribe el lock si no existía o si cambiaron las elecciones.
- **`pnpm lattiz spec lock <stem> | --all [--refresh]`:** planea el spec (con su lock, o desde cero con
  `--refresh`), comprueba que reproduce **valor por valor** los archivos generados que hay en disco y
  solo entonces escribe el lock. Código 1 si no reproduce.

**Verificado (2026-10-12):** `spec lock --all` creó los 10 locks y los 10 reproducen sus 7 archivos;
una segunda corrida dice «ya estaba al día»; `build clinica-alba --dry-run` usa el lock («paleta …
(del lock)») y deja todo «sin cambios»; con `.lattiz/cache` borrado, `build restaurante-casa-comal`
deja manifiestos, temas, packs y perfiles idénticos. Prueba de crecimiento: con una carpeta
`sections/hero/aaa-probe` de más, `kit:verify-snapshot` sigue idéntico (los specs legacy no la ven);
con seis paletas de prueba agregadas a la biblioteca con afinidad `restaurante`, un spec `extended` sin
lock cambia de paleta y el mismo spec con lock da los mismos bytes.

**Hallazgo (preexistente, no de este trabajo):** en este contenedor, un `lattiz build` real reescribe
los JPEG de placeholder del spec (mismo resultado con `main` sin cambios): la imagen lleva texto SVG
rasterizado y los bytes dependen de las fuentes del sistema. Las fuentes generadas no cambian; se
restauraron las imágenes commiteadas. El snapshot dorado usa las imágenes del repo, así que no le
afecta.

## Galería del kit (WP2)

`pnpm lattiz kit gallery [--slot hero,footer] [--palettes] [--fonts] [--themes a,b] [--sin-imagen]`
(o `pnpm --filter @lattiz/template-kit kit:gallery`). Escribe `.lattiz/gallery/` (no se commitea):

- `sections/<slot>.html`: cada variante del slot renderizada con su `section.html` + `core.css` + su
  `section.css` + el `:root` del tema (sin pasar por GrapesJS: los selectores son de clase, se ve
  igual), en un tema claro y uno oscuro (`norte-atelier`, `oxido`), con copy **demo** (el del giro),
  **corto** (3 elementos, dos palabras por texto, negocio «Jo») y **largo** (8 elementos, cada texto
  al límite de `COPY_LIMITS`, nombre «Peluquería y Barbería Hermanos Domínguez-Echeverría» y correo
  largo), a 390 y 1440 px (página completa). `--sin-imagen` agrega un modo con fotos faltantes.
- `palettes.html` + `.png`: cada paleta (las de cada giro y las de la biblioteca) como mini página con
  los contrastes de `kit:validate` y PASS/FAIL.
- `fonts.html` + `.png`: cada par con display, encabezado, cuerpo y acento a su escala real y la
  prueba de glifos `ñ á é í ó ú ü ¿ ¡ “ ” « » — …`.
- Un solo navegador, en serie, siempre cerrado (`finally`). Toda la galería: 374 capturas en ~4.6 min.
  En este contenedor hace falta `LATTIZ_CHROMIUM_PATH=/opt/pw-browsers/chromium` (Playwright espera
  otra versión de Chromium).

Después de cualquier cambio visual, se abren las capturas y se critican con el pre-vuelo y las reglas
anti-genérico de `docs/template-kit-design-principles.md` (máximo tres rondas por variante).

**Primera lectura (variantes existentes, solo para el backlog de WP9, no se tocan):** con copy largo,
el titular de 56 caracteres de `hero/split` ocupa 5 líneas a 1440 px y empuja los CTA bajo el pliegue
de 900 px; con copy corto los CTA de dos palabras se cortan a «Reservar una» (es el modo de estrés,
no un caso real).

## Tokens de estilo (WP3)

Presets **opt-in** del catálogo `extended`: un tema con `style` (`themes/<id>.json › style`, o
`brand.style` en un spec con `brand.catalog: "extended"`) agrega tokens a `:root`; un tema sin `style`
no emite ninguno, así que las plantillas legacy compilan byte a byte. Las **variantes nuevas** los leen
con respaldo (`var(--lz-card-bg, var(--lz-color-surface))`), así que también funcionan bajo un tema
legacy. **Las variantes existentes no se retroalimentan** (cambiaría su salida); hacerlo variante por
variante es una opción futura, con su propio commit y snapshot. Definición: `src/lib/style.ts`;
antes/después: `pnpm lattiz kit gallery --tokens` → `.lattiz/gallery/tokens.html`.

| Preset (`style.*`) | Valores                                                    | Qué cambia                                                                                                                                                                                                                                                                         | Respaldo sin `style`                      |
| ------------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `shape`            | `sharp` · `soft` · `round` · `pill`                        | `radiusCard`/`radiusPill` del tema (0/0, 12/10, 22/999, 32/999 px) + `--lz-radius-img` (0, 10, 18, 32) y `--lz-radius-inner` (0, 6, 12, 20)                                                                                                                                        | `--lz-radius-card`                        |
| `surface`          | `flat` · `outlined` · `tinted` · `elevated`                | `--lz-card-bg`, `--lz-card-border`, `--lz-card-shadow`, `--lz-card-pad` (plano sin caja ni padding; con filete; `surface-2`; `surface` con sombra difusa)                                                                                                                          | `surface` + filete de `--lz-border-width` |
| `density`          | `compact` · `cozy` · `airy`                                | `density` del tema (compact/regular/airy → `--lz-section-pad`, `--lz-stack`), contenedor 1120/1200/1280 px, `--lz-gap` 16/24/40 y `--lz-gap-lg` 32/48/72 px                                                                                                                        | `24px`                                    |
| `divider`          | `none` · `hairline` · `rule`                               | `--lz-divider`: nada, `1px` en `line`, `2px` en `text` (borde superior de la sección)                                                                                                                                                                                              | `none`                                    |
| `imageTreatment`   | `plain` · `framed` · `arch` · `offset` · `duotone-overlay` | `--lz-img-shape` (arco = `999px 999px r r`), `--lz-img-pad` + `--lz-img-frame` + `--lz-img-ring` (marco), `--lz-img-offset` + `--lz-img-offset-bg` (bloque de acento desplazado 14 px), `--lz-img-overlay` + `--lz-img-blend` (velo del acento en `multiply`, sin filtros pesados) | sin marco, sin velo                       |
| `typeScale`        | `tight` · `normal` · `expressive`                          | multiplica `displayScale` del par (×0.88, ×1, ×1.15; un `brand.displayScale` explícito gana) y `--lz-heading-scale` (0.92, 1, 1.12)                                                                                                                                                | `1`                                       |
| `displayCase`      | `none` · `upper`                                           | `displayTransform` del tema                                                                                                                                                                                                                                                        | el del par                                |
| `tracking`         | `tight` · `normal` · `wide`                                | `--lz-display-tracking` (−0.02, 0, 0.04 em)                                                                                                                                                                                                                                        | `0em`                                     |

**Interacción** (siempre que hay `style`; principios §4): `--lz-ease-out: cubic-bezier(0.23, 1, 0.32,
1)`, `--lz-ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`, `--lz-dur-press: 120ms`, `--lz-dur-ui:
160ms`, `--lz-dur-reveal: 240ms`, `--lz-press-scale: 0.97`. Las variantes nuevas escriben el mismo
valor como respaldo: `transition: transform var(--lz-dur-press, 120ms) var(--lz-ease-out,
cubic-bezier(.23,1,.32,1))`, hover dentro de `@media (hover: hover) and (pointer: fine)`, `:active`
con `scale(var(--lz-press-scale, .97))`, `:focus-visible` sin transición y su override de
`prefers-reduced-motion`.

**Contrato para variantes nuevas** (el bloque de demostración de `src/lib/gallery-style.ts ›
TOKEN_DEMO_CSS` lo muestra funcionando): cada `var()` lleva el look de hoy como respaldo; una foto con
`offset` reserva `--lz-img-offset` de margen (si no, se sale de la columna a 390 px); el `::before`
del desplazamiento usa `--lz-img-offset-bg` (transparente salvo con `offset`, para que el marco no
herede el acento).

**Desviación de nombres:** el spec ya tenía `brand.shape` (filete, urbano…) y `brand.density`
(airy|regular|compact), así que los presets van en `brand.style.{shape, surface, density, divider,
imageTreatment, typeScale, displayCase, tracking}` en vez de `brand.shape|surface|…` sueltos. Un spec
legacy con `brand.style` es error de `spec validate` («los estilos son del catálogo extended»).

**Verificado:** `kit:verify-snapshot` idéntico; un spec `extended` de clínica con los ocho presets
compila las dos gemelas y `kit:validate` no da hallazgos (radios 32/999, contenedor 1280, escala
1.31, tokens en `:root`); la galería de tokens (31 capturas) pasó dos rondas de crítica: en la
primera el marco heredaba el acento del desplazamiento y los separadores quedaban en el borde de la
captura; corregido.

**Hallazgo (preexistente):** el `beforeAll` de `test/validate.test.ts` compila seis plantillas con el
`hookTimeout` por defecto de vitest (10 s) y queda al límite: con más carpetas en `dist/` (dos más de
un `lattiz build`) se pasa del tiempo y vitest reporta «85 passed | 2 skipped». `main` sin cambios
hace lo mismo con esas carpetas; sin ellas pasan las 87. No se tocó la configuración de pruebas.

## Biblioteca de paletas (WP4)

`packages/template-kit/palettes/`: las semillas a mano en `seeds.ts` (fondo, texto, acento y lo que
se quiera fijar, más ánimo, tipo y afinidad por giro); `pnpm --filter @lattiz/template-kit kit:palettes
--write` deriva el resto de los tokens (`src/spec/palette-builder.ts`: superficies por mezcla, el
secundario más cercano al fondo que da AA en fondo y superficies, el texto sobre el acento más legible,
el acento como texto oscurecido o aclarado hasta 3:1 sobre fondo, superficie y velo), corre las reglas
de contraste de `kit:validate` y **rechaza** la que no pase, mide la distancia entre paletas y congela
el resultado en `library.ts` (hex fijos; no se edita a mano). `kit:spec presets` las lista con el tono
del acento. Ids estables `pal-<nombre>`: nunca se recolorea una publicada, se agrega otra.

- **39 paletas:** 14 claras, 12 oscuras, 13 teñidas (fondo de color). 9 con **acento neutro** (tinta,
  hueso, plata, piedra) que la regla de tono no cuenta: son las que más capacidad dan a barbería
  (`pal-vino-hueso` y `pal-marino-hueso` se agregaron en el WP5 para llevarla a 12).
- **Sin duplicados:** distancia = ΔE00 del fondo + ΔE00 del acento; dentro de un giro (sus paletas
  legacy + las de la biblioteca con afinidad) ninguna pareja queda **por debajo de 15**. La primera
  versión tenía 11 casi duplicados de paletas legacy (los nombres «talavera», «jamaica», «nopal»,
  «lavanda» ya existían en los giros: `pal-jacaranda` contra `floreria:lavanda` daba 2.2); se
  rediseñaron como fondos teñidos u oscuros, se quitaron tres y se recortaron afinidades.
- **Descartadas:** `pal-coral` y `pal-mandarina` (el texto sobre el acento no llegaba a 4.5:1),
  `pal-albahaca` (igual a `pal-nopal`, 2.0), `pal-uva-silvestre` (a < 11 de los morados de cinco
  giros), `pal-terracota-pizarra` y `pal-agave-claro` (duplicaban las terracotas y verdes azulados
  de casi todos los giros).
- La afinidad solo ordena: con `brand.catalog: "extended"` el compilador prueba primero las paletas del
  giro, luego las de la biblioteca que lo listan (en orden) y luego el resto; nombrar
  `brand.palette.preset: "pal-…"` funciona en cualquier spec.

| Id                     | Tipo   | Ánimo                     | Acento           | Afinidad (orden)                              |
| ---------------------- | ------ | ------------------------- | ---------------- | --------------------------------------------- |
| `pal-papel-tinta`      | clara  | editorial, sobrio         | `#1A1917` neutro | despacho, floreria, tienda, barberia, clinica |
| `pal-nopal`            | clara  | natural, mexicano, fresco | `#3E7B2E` 108°   | veterinaria, barberia, clinica, dental        |
| `pal-cempasuchil`      | clara  | festivo, cálido, mexicano | `#E8891C` 32°    | restaurante, tienda, estetica, gimnasio       |
| `pal-navy-laton`       | clara  | lujo, sobrio              | `#C69B46` 40°    | despacho, barberia, clinica, restaurante      |
| `pal-rubor-salvia`     | clara  | suave, natural            | `#4F7356` 132°   | estetica, clinica, dental                     |
| `pal-cantera`          | clara  | rústico, sobrio, mexicano | `#4A4540` neutro | restaurante, despacho, barberia, tienda       |
| `pal-limon`            | clara  | fresco, juguetón          | `#B5CB2A` 68°    | tienda, gimnasio, restaurante, veterinaria    |
| `pal-granada`          | clara  | lujo, cálido              | `#8E1F3A` 345°   | restaurante, barberia, tienda                 |
| `pal-orquidea`         | clara  | lujo, fresco              | `#9A2E8C` 308°   | floreria, dental, gimnasio                    |
| `pal-girasol`          | clara  | juguetón, cálido          | `#F2CF2F` 49°    | veterinaria, dental, despacho                 |
| `pal-cielo-abierto`    | clara  | fresco, juguetón          | `#1A72A8` 203°   | tienda, gimnasio, restaurante, floreria       |
| `pal-niebla-grafito`   | clara  | sobrio, clínico           | `#59626B` neutro | clinica, dental, despacho, gimnasio           |
| `pal-pistache`         | clara  | fresco, juguetón          | `#93B53C` 77°    | floreria, estetica, dental, clinica           |
| `pal-turquesa-claro`   | clara  | fresco, mexicano          | `#0B7F7A` 177°   | tienda, floreria, restaurante, gimnasio       |
| `pal-carbon-lima`      | oscura | urbano, energía           | `#C6F432` 74°    | barberia, tienda                              |
| `pal-bosque-profundo`  | oscura | lujo, natural             | `#7FC8A0` 147°   | barberia, veterinaria, floreria               |
| `pal-medianoche-laton` | oscura | lujo, sobrio              | `#D2A852` 40°    | barberia, restaurante, estetica               |
| `pal-mezcal-humo`      | oscura | urbano, mexicano          | `#4FB3A9` 174°   | restaurante, tienda                           |
| `pal-tinta-hueso`      | oscura | editorial, sobrio         | `#EDE8DF` neutro | barberia, despacho, tienda, gimnasio          |
| `pal-jamaica-noche`    | oscura | festivo, mexicano         | `#E0457B` 339°   | estetica, floreria, tienda                    |
| `pal-cobalto-noche`    | oscura | urbano, energía           | `#5B8CFF` 222°   | gimnasio, despacho, tienda, dental            |
| `pal-brasa-noche`      | oscura | urbano, cálido            | `#F0642D` 17°    | restaurante, tienda, estetica                 |
| `pal-pizarra-plata`    | oscura | sobrio, urbano            | `#CDD3DA` neutro | barberia, despacho, clinica, gimnasio         |
| `pal-jacaranda-noche`  | oscura | lujo, fresco              | `#A98BF0` 258°   | estetica, clinica, despacho                   |
| `pal-vino-hueso`       | oscura | lujo, sobrio              | `#E8DED8` neutro | barberia, restaurante, despacho               |
| `pal-marino-hueso`     | oscura | sobrio, lujo              | `#E6E2D8` neutro | barberia, despacho, clinica                   |
| `pal-salvia-tinta`     | teñida | natural, sobrio           | `#222A22` neutro | floreria, veterinaria, clinica, estetica      |
| `pal-rosa-vino`        | teñida | lujo, suave               | `#7D2135` 347°   | estetica, floreria                            |
| `pal-cielo-marino`     | teñida | clínico, fresco           | `#1D3F7A` 218°   | dental, clinica, veterinaria                  |
| `pal-arcilla`          | teñida | rústico, cálido, mexicano | `#2C241F` neutro | restaurante, floreria, tienda, barberia       |
| `pal-menta-esmeralda`  | teñida | fresco, clínico           | `#0F6B4C` 160°   | dental, veterinaria, estetica, clinica        |
| `pal-mostaza`          | teñida | juguetón, cálido          | `#262319` neutro | tienda, gimnasio, restaurante, barberia       |
| `pal-lavanda-ciruela`  | teñida | suave, lujo               | `#6B2D86` 282°   | estetica, floreria, clinica                   |
| `pal-azul-maya`        | teñida | mexicano, fresco          | `#A63D24` 12°    | restaurante, tienda, floreria                 |
| `pal-concreto-senal`   | teñida | urbano, energía           | `#C8441A` 14°    | gimnasio, barberia                            |
| `pal-bugambilia`       | teñida | juguetón, mexicano        | `#A31F62` 330°   | estetica, floreria, tienda                    |
| `pal-azulejo`          | teñida | mexicano, festivo         | `#F0BE3C` 43°    | restaurante, tienda, floreria                 |
| `pal-turquesa-agua`    | teñida | clínico, fresco           | `#0B6873` 186°   | dental, clinica, veterinaria, estetica        |
| `pal-indigo-papel`     | teñida | sobrio, editorial         | `#2E3192` 238°   | despacho, tienda                              |

Paletas usables por giro (meta ≥ 10) y la pareja más parecida:

| Giro        | Usables (giro + biblioteca) | Par más cercano (ΔE00 fondo + acento)                |
| ----------- | --------------------------- | ---------------------------------------------------- |
| barberia    | 24 (9 + 15)                 | `pal-tinta-hueso` ~ `pal-pizarra-plata` 15.5         |
| clinica     | 19 (5 + 14)                 | `pal-papel-tinta` ~ `pal-salvia-tinta` 15.8          |
| dental      | 15 (5 + 10)                 | `dental:nube` ~ `pal-niebla-grafito` 17.2            |
| despacho    | 17 (5 + 12)                 | `pal-tinta-hueso` ~ `pal-pizarra-plata` 15.5         |
| estetica    | 18 (5 + 13)                 | `estetica:malva` ~ `pal-lavanda-ciruela` 16.2        |
| floreria    | 19 (5 + 14)                 | `floreria:lavanda` ~ `pal-orquidea` 15.1             |
| gimnasio    | 16 (5 + 11)                 | `pal-tinta-hueso` ~ `pal-pizarra-plata` 15.5         |
| restaurante | 21 (6 + 15)                 | `restaurante:nocturno` ~ `pal-medianoche-laton` 15.9 |
| tienda      | 24 (5 + 19)                 | `tienda:ciruela` ~ `pal-granada` 16.4                |
| veterinaria | 13 (5 + 8)                  | `pal-limon` ~ `pal-girasol` 16.1                     |

Galería: `pnpm lattiz kit gallery --palettes` (cada paleta como mini página con sus contrastes).
Crítica (ronda 1): las teñidas dan la variedad que faltaba (las legacy son casi todas blanco roto + un
acento); `pal-limon` y `pal-girasol` se parecían en tres giros, `pal-girasol` se quedó con
veterinaria, dental y despacho.

## Biblioteca de pares tipográficos (WP5)

`packages/template-kit/font-pairs/library.ts` (datos a mano): **16 pares nuevos**, cada uno con display
(que también es el de encabezados: el kit usa la misma cara para todo título), cuerpo, acento (una de
las dos familias: itálica, la misma display o la caligráfica), ánimo, afinidad por giro,
`displayScale`, `case`/`tracking`/`typeScale` recomendados (presets de WP3) y licencia por familia.
Misma entrega que los legacy: Google Fonts `css2` con `display=swap` (ningún origen nuevo) y fallback
local con métricas de Capsize.

- **Reglas (las verifica `pnpm --filter @lattiz/template-kit kit:fonts`, código 1 si un par nuevo las
  rompe):** ≤ 2 familias y ≤ 4 archivos por página (subconjunto latin, que ya trae todo el español:
  `ñ á é í ó ú ü ¿ ¡ “ ” — …`), latin-ext disponible, licencia abierta según `google/fonts`
  (`ofl/<familia>/METADATA.pb`). Variables cuando la familia lo es (13 de 16 pares); el eje `opsz` se
  fija en un valor (72 en display, 12–16 en texto) en vez de pedir el rango: Newsreader bajó de 151 a
  74 KB, Source Serif 4 de 193 a 96, Literata de 144 a 72.
- **Peso:** 33–96 KB por par (promedio 61 KB, 2–4 archivos) contra 77–322 KB (4–7 archivos) de los
  legacy.
- **Descartado:** Italiana (sin latin-ext) → Gilda Display; Big Shoulders Display (sin métricas en
  Capsize, el fallback no se podría medir) → Oswald.
- **Cubre:** serif editorial + sans limpia (Newsreader, EB Garamond), display de alto contraste
  (Gloock, Libre Caslon Display, Gilda Display), geométrica (League Spartan, Outfit), humanista (Red
  Hat), grotesca (Schibsted, Anybody), slab industrial (Zilla Slab), condensadas de cartel (Bebas Neue,
  Oswald), redonda amable (Fredoka + Nunito) y caligrafía **solo de acento** (Jost en mayúsculas +
  Pinyon Script en las palabras de acento).

| Par                                      | Estilo                                              | Ánimo             | Afinidad                                  | Archivos | KB (latin) | Variable | CLS 390 / 1366 |
| ---------------------------------------- | --------------------------------------------------- | ----------------- | ----------------------------------------- | -------- | ---------- | -------- | -------------- |
| `newsreader+public-sans`                 | serif editorial y sans neutra                       | editorial, sobrio | despacho, clinica, floreria, restaurante  | 3        | 73.6       | 1/2      | 0.001 / 0.002  |
| `gloock+onest`                           | display de alto contraste                           | lujo, editorial   | estetica, floreria, restaurante, barberia | 2        | 50.2       | 1/2      | 0.000 / 0.002  |
| `libre-caslon-display+schibsted-grotesk` | didona clásica                                      | lujo, editorial   | estetica, despacho, tienda, floreria      | 2        | 61.5       | 1/2      | 0.000 / 0.000  |
| `league-spartan+mulish`                  | geométrica pesada                                   | urbano, energía   | gimnasio, tienda, barberia                | 2        | 33.3       | 1/2      | 0.000 / 0.000  |
| `red-hat-display+red-hat-text`           | humanista clara                                     | clínico, fresco   | clinica, dental, veterinaria, despacho    | 3        | 58.9       | 1/2      | 0.000 / 0.001  |
| `schibsted-grotesk+source-serif-4`       | grotesca con texto serif                            | editorial, sobrio | despacho, tienda, restaurante             | 3        | 95.9       | 1/2      | 0.002 / 0.003  |
| `zilla-slab+ibm-plex-sans`               | slab industrial                                     | urbano, rústico   | barberia, despacho, gimnasio, restaurante | 3        | 73.6       | 1/2      | 0.002 / 0.002  |
| `bebas-neue+barlow`                      | condensada en mayúsculas                            | urbano, energía   | barberia, gimnasio, tienda                | 4        | 56.2       | 0/2      | 0.000 / 0.000  |
| `oswald+source-sans-3`                   | condensada de cartel                                | urbano, energía   | gimnasio, barberia, restaurante           | 3        | 56         | 1/2      | 0.000 / 0.001  |
| `fredoka+nunito`                         | redonda amable                                      | juguetón, suave   | veterinaria, tienda, dental, floreria     | 2        | 54.3       | 1/2      | 0.000 / 0.002  |
| `jost+pinyon-script`                     | geométrica en mayúsculas, caligrafía solo de acento | lujo, suave       | estetica, floreria, tienda                | 2        | 53.4       | 1/2      | 0.001 / 0.003  |
| `petrona+rubik`                          | serif cálida y sans redondeada                      | cálido, natural   | restaurante, floreria, veterinaria        | 3        | 67.4       | 1/2      | 0.001 / 0.002  |
| `eb-garamond+albert-sans`                | garalda clásica                                     | sobrio, lujo      | despacho, estetica, clinica, floreria     | 3        | 82.3       | 1/2      | 0.001 / 0.001  |
| `anybody+be-vietnam-pro`                 | grotesca expresiva                                  | energía, urbano   | gimnasio, tienda, barberia                | 3        | 38.2       | 0/2      | 0.002 / 0.004  |
| `outfit+literata`                        | geométrica con texto serif                          | fresco, clínico   | clinica, dental, veterinaria, tienda      | 3        | 71.9       | 1/2      | 0.000 / 0.003  |
| `gilda-display+hanken-grotesk`           | display fina y aireada                              | lujo, suave       | estetica, floreria, tienda, despacho      | 2        | 46.8       | 1/2      | 0.001 / 0.002  |

Pares usables por giro (meta ≥ 8: los del giro + los de la biblioteca con afinidad; en `extended` el
compilador además puede tomar los demás pares legacy como último recurso):

| Giro        | Usables    | De la biblioteca                                                                                                                                                                                                                                |
| ----------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| barberia    | 15 (9 + 6) | `gloock+onest`, `league-spartan+mulish`, `zilla-slab+ibm-plex-sans`, `bebas-neue+barlow`, `oswald+source-sans-3`, `anybody+be-vietnam-pro`                                                                                                      |
| clinica     | 9 (5 + 4)  | `newsreader+public-sans`, `red-hat-display+red-hat-text`, `eb-garamond+albert-sans`, `outfit+literata`                                                                                                                                          |
| dental      | 8 (5 + 3)  | `red-hat-display+red-hat-text`, `fredoka+nunito`, `outfit+literata`                                                                                                                                                                             |
| despacho    | 12 (5 + 7) | `newsreader+public-sans`, `libre-caslon-display+schibsted-grotesk`, `red-hat-display+red-hat-text`, `schibsted-grotesk+source-serif-4`, `zilla-slab+ibm-plex-sans`, `eb-garamond+albert-sans`, `gilda-display+hanken-grotesk`                   |
| estetica    | 10 (5 + 5) | `gloock+onest`, `libre-caslon-display+schibsted-grotesk`, `jost+pinyon-script`, `eb-garamond+albert-sans`, `gilda-display+hanken-grotesk`                                                                                                       |
| floreria    | 13 (5 + 8) | `newsreader+public-sans`, `gloock+onest`, `libre-caslon-display+schibsted-grotesk`, `fredoka+nunito`, `jost+pinyon-script`, `petrona+rubik`, `eb-garamond+albert-sans`, `gilda-display+hanken-grotesk`                                          |
| gimnasio    | 10 (5 + 5) | `league-spartan+mulish`, `zilla-slab+ibm-plex-sans`, `bebas-neue+barlow`, `oswald+source-sans-3`, `anybody+be-vietnam-pro`                                                                                                                      |
| restaurante | 11 (5 + 6) | `newsreader+public-sans`, `gloock+onest`, `schibsted-grotesk+source-serif-4`, `zilla-slab+ibm-plex-sans`, `oswald+source-sans-3`, `petrona+rubik`                                                                                               |
| tienda      | 14 (5 + 9) | `libre-caslon-display+schibsted-grotesk`, `league-spartan+mulish`, `schibsted-grotesk+source-serif-4`, `bebas-neue+barlow`, `fredoka+nunito`, `jost+pinyon-script`, `anybody+be-vietnam-pro`, `outfit+literata`, `gilda-display+hanken-grotesk` |
| veterinaria | 9 (5 + 4)  | `red-hat-display+red-hat-text`, `fredoka+nunito`, `petrona+rubik`, `outfit+literata`                                                                                                                                                            |

### CLS y LCP (`kit:fonts --cls`)

Portada `navbar/inline` + `hero/split` con el CSS real del kit, las fuentes web retenidas 1.2 s para que
el primer pintado use el fallback, a 390×844 y 1366×768, con y sin el fallback medido.

- **Hallazgo del entorno:** el fallback del kit es `local('Arial')` / `local('Times New Roman')`, que
  este contenedor (y Android) no tiene: ahí cae a la genérica y el fallback no sirve. La página de
  prueba usa sus clones métricos (Liberation Sans/Serif) para medir lo que ve quien sí los tiene
  (Windows, macOS, iOS). No cambia el CSS que se publica.
- **Calibración nueva (solo caras nuevas, la salida legacy no cambia):** en los display de peso
  alto, la fuente web es bastante más ancha que el Arial regular que Capsize toma de base, y el título
  de la portada cambiaba de líneas al llegar la fuente (CLS 0.10–0.15 a 390 en cinco pares). Se midió
  el `size-adjust` necesario en Chromium, al peso del display, con una muestra en español contra la
  propia cara de fallback: `DISPLAY_SIZE_ADJUST` en `src/lib/theme.ts` (Newsreader 111.84 %, Gloock
  112.6 %, League Spartan 98.87 %, Schibsted Grotesk 109.58 %, Petrona 110.53 %, EB Garamond 96.24 %,
  Anybody 129.58 %, Red Hat Display 100.04 %) y `CAPS_SIZE_ADJUST` para los display en mayúsculas
  (Bebas Neue 59.1 %, Oswald 79.02 %).
- **Resultado:** los 16 pares nuevos con **CLS ≤ 0.004** en los dos anchos (sin el fallback: hasta
  0.184); LCP 244–468 ms en local. Los tres representativos: `bebas-neue+barlow` 0.000/0.000,
  `newsreader+public-sans` 0.001/0.002, `jost+pinyon-script` 0.001/0.003. Referencia legacy en la
  misma página: `playfair-display+inter` 0.001/0.002; `anton+space-grotesk` **0.122** a 390 (preexistente;
  calibrarlo cambiaría plantillas publicadas → backlog de la auditoría de WP9).

Galería: `pnpm lattiz kit gallery --fonts`. Crítica: ronda 1 mostró las palabras de acento en
mayúsculas (el espécimen no aplicaba `accentTransform`; Pinyon Script en mayúsculas no se lee);
corregido el espécimen, ronda 2 limpia. Ojo de diseño: Libre Caslon Display y Gilda Display son de
trazo fino: lucen en títulos grandes; en nombres de tarjeta pequeños se ven frágiles (preferir
`typeScale: expressive`).

## Capacidad después de la Parte 1

`pnpm lattiz kit capacity --catalog extended` (2026-10-12). La regla de paleta del catálogo
`extended` agrega una condición: además del tono a ≥ 30°, la paleta debe quedar a ≥ 15 (ΔE00 fondo +
acento) de toda paleta ya usada en el giro. Sin eso, las paletas de acento neutro se repetían (la
primera simulación dio 29 por giro reusando `pal-tinta-hueso` seis veces: un número falso).

| Giro        | Antes (legacy) | Después (extended) | Pares | +Pro | +Básico | Lo limita ahora                                |
| ----------- | -------------- | ------------------ | ----- | ---- | ------- | ---------------------------------------------- |
| barberia    | 3              | **12**             | 0     | 0    | 12      | portadas Pro (0/4 libres) y tonos (4 ventanas) |
| clinica     | 3              | **16**             | 3     | 3    | 16      | paletas (tonos + ΔE)                           |
| dental      | 3              | **16**             | 3     | 3    | 17      | paletas                                        |
| despacho    | 3              | **17**             | 3     | 3    | 17      | paletas                                        |
| estetica    | 3              | **16**             | 3     | 3    | 15      | paletas                                        |
| floreria    | 3              | **16**             | 3     | 3    | 16      | paletas                                        |
| gimnasio    | 3              | **16**             | 3     | 3    | 16      | paletas                                        |
| restaurante | 3              | **15**             | 3     | 3    | 17      | paletas                                        |
| tienda      | 3              | **16**             | 3     | 3    | 17      | paletas                                        |
| veterinaria | 3              | **17**             | 3     | 3    | 17      | paletas                                        |

La meta de **≥ 12 por giro** se cumple sin tocar umbrales. Los **pares Básico + Pro** siguen topados por
las portadas Pro (3 libres por giro, 0 en barbería): las 5 portadas nuevas de la Parte 2 (WP6) suben
ese tope. Barbería depende de los acentos neutros: le quedan 4 ventanas de tono (≈ 43°, ≈ 110°,
≈ 188°, ≈ 300°).

## Variantes nuevas (WP6)

Carpetas nuevas en `sections/` (todas `extended`: un spec `legacy` nunca las ve; nombrarlas en
`sections[].variant` funciona en cualquier catálogo). Contrato, que `test/extended-sections.test.ts`
hace cumplir a toda variante fuera de `LEGACY_VARIANTS`:

- `meta.ts` declara `tiers`, `intent` (una línea), `archetypes` y, si lee claves que ningún giro
  escribe todavía, `sample` (la galería y `kit probe` lo fusionan sobre el copy del giro; WP8 lo mueve
  a `giros/`).
- Mismas claves de copy que sus hermanas legacy siempre que se pueda (las 5 portadas leen las de
  `hero/split`), así que un spec existente puede nombrarlas sin copy nuevo. Claves nuevas con límite
  en `COPY_LIMITS`: `navbar.notice` 40, `hero.note` 40, `hero.detailAlt` 125,
  `testimonials.scoreNote` 32, `cta.title` 48, `cta.text` 140, `cta.primaryCta` 24,
  `cta.secondaryCta` 18.
- Texto ≥ 14 px (ninguna usa `lz-index`, `lz-chip`, `lz-sticker` ni `lz-label` de `core.css`),
  táctiles ≥ 44 px, sin `<iframe>`, sin pastillas sobre fotos, sin antetítulo numerado; presión con
  `:active` + `--lz-press-scale`, hover solo bajo `(hover: hover) and (pointer: fine)`, override de
  `prefers-reduced-motion`; cada `var()` de WP3 con el look de hoy de respaldo.
- Portadas con `data-lz-fit` y CTA principal visible sin scroll.

| Variante                   | Tier         | Intención                                                                     | CSS crudo / min / gzip (B) | Revisión                                                                    |
| -------------------------- | ------------ | ----------------------------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------- |
| `hero/poster`              | Básico + Pro | Cartel: titular a todo el ancho, franja de foto a sangre que toma el resto    | 3562 / 2661 / 932          | 3 rondas: encaje con copy largo y bajo la barra alta (piso de franja 72 px) |
| `hero/columns`             | Básico + Pro | Revista: antetítulo entre filetes, titular en dos tercios, foto angosta       | 3876 / 3115 / 1035         | 2 rondas: en móvil la foto va bajo el texto                                 |
| `hero/duo-arch`            | Básico + Pro | Dos arcos encimados (`detailImage?` opcional)                                 | 3335 / 2559 / 901          | 1 ronda                                                                     |
| `hero/framed`              | Básico + Pro | Foto enmarcada que llena la pantalla, texto en tarjeta opaca                  | 3419 / 2567 / 862          | 2 rondas: en móvil tarjeta primero, sin encimar                             |
| `hero/panel`               | Básico + Pro | Foto cuadrada + panel teñido con nota de horario (`note?`)                    | 3920 / 3049 / 972          | 2 rondas: relleno vertical por alto de pantalla                             |
| `navbar/notice-bar`        | Básico + Pro | Franja de aviso (horario, promo) sobre la barra; no cuenta como sección       | 3233 / 2528 / 815          | 3 rondas: franja de 44 px, `min-width` en marca y enlaces cortos            |
| `services/menu-columns`    | Básico + Pro | Carta a dos columnas con líderes punteados, promos en fila                    | 4029 / 3462 / 1020         | 1 ronda                                                                     |
| `gallery/bento`            | Pro          | 8 celdas exactas para 8 fotos, pie abajo; otro número cae a retícula pareja   | 2586 / 2005 / 703          | 1 ronda                                                                     |
| `testimonials/rating-wall` | Pro          | Una calificación con «Calificación de ejemplo» + citas en dos columnas        | 2874 / 2454 / 793          | 1 ronda                                                                     |
| `locations/map-link`       | Pro          | Libreta de direcciones; mapa solo como enlace, sin iframe                     | 4359 / 3706 / 1022         | 1 ronda                                                                     |
| `locations/single-card`    | Básico       | Ficha de una sucursal en una tarjeta, sin iframe                              | 3430 / 2956 / 911          | 1 ronda                                                                     |
| `about/portrait`           | Pro          | Doble página: título a lo ancho, retrato y texto en dos columnas              | 2531 / 2192 / 749          | 1 ronda                                                                     |
| `team/spotlight`           | Pro          | La persona al frente en grande, el resto en lista con avatar                  | 3279 / 2639 / 784          | 2 rondas: retrato 1:1 en escritorio (hueco bajo la lista)                   |
| `cta/band` (slot nuevo)    | Básico + Pro | Franja de cierre sobre `surface-2` (no invierte el tema); cuenta como sección | 1751 / 1386 / 562          | 1 ronda                                                                     |
| `faq/grid`                 | Básico + Pro | Todas las preguntas abiertas en celdas de dos columnas                        | 2043 / 1662 / 683          | 2 rondas: `<summary>` de 44 px                                              |
| `footer/ledger`            | Básico + Pro | Libreta: filas con filete, etiqueta a la izquierda y dato a la derecha        | 3898 / 3351 / 916          | 2 rondas: `min-width` en enlaces cortos                                     |

Total: 12 → 13 slots, 31 → 47 variantes. El CSS de una variante solo entra en las plantillas que la
usan; las cifras «min» son el CSS sin comentarios ni espacios (el `index.html` publicado lo lleva así
de GrapesJS).

**Slot nuevo `cta`** (decisión de producto: la franja de CTA cuenta dentro del rango). El clasificador
de Motion ya mapea `cta` → tipo `cta`; falta el rol en `blueprints/` y `src/tiers.ts` (WP8), así que
hoy solo se puede usar a través de `kit probe`/`kit archetypes`. En Básico, sumar `cta` exige quitar
`about` para seguir en 7.

**Decisiones de producto aplicadas:** el aviso de promo/horario vive en `navbar/notice-bar` (no es
sección); la franja de CTA cuenta; las estrellas de `rating-wall` llevan la nota «Calificación de
ejemplo» (`scoreNote`); `map-link` y `single-card` no embeben mapa (solo «cómo llegar»).

### Cómo se revisan: `lattiz kit probe`

`pnpm lattiz kit probe [slot/variante…] [--themes claro,oscuro,estilo] [--modes demo,largo,corto]`
(`packages/lattiz-cli/src/lib/probe.ts`). Por defecto todas las variantes `extended`. Cada variante
entra en una página completa Básico o Pro (según `meta.tiers`) armada con el compilador real (el
blueprint sin listas de variantes y con un rol `cta`), con tres temas (`norte-atelier`, `oxido` y uno
con todos los presets de WP3: `pal-cielo-marino` + `outfit+literata`) y copy demo y largo (cada texto
al límite de `COPY_LIMITS`, nombre y correo largos). Corre `kit:validate` y, en una sola página de
Chromium redimensionada a 360, 390, 768, 1024, 1440, 1366×768 y 844×390: overflow, texto < 14 px,
táctiles < 44 px, contraste axe dentro de la sección, y en portadas encaje (`data-lz-fit`) y pliegue
(CTA visible). Solo se juzga la sección probada. Un navbar se prueba sobre `hero/poster`, cuya altura
es exactamente el encaje, para que un `--lz-header-h` mal sumado se vea. ~4.5 s por caso;
`.lattiz/probe/report.json` + capturas de la sección a 390 y 1440.

Calibración: con `hero/split` legacy reproduce el texto de 12 px de `lattiz check` y, con copy largo,
que `hero/offset-card` deja el CTA bajo el pliegue a 1024, 1440 y 1366×768 (pendiente conocido).

**Resultado final:** ver «Verificación de la Parte 2».

## Arquetipos y módulos verticales (WP7)

`packages/template-kit/archetypes/` (datos; el compilador todavía no los lee, así que ningún spec
cambia):

- `index.ts › ARCHETYPES`: los 8 arquetipos de los principios con sus diales, los presets de WP3,
  formas legacy compatibles, preset de Motion Pro (`editorial` solo con movimiento ≥ 6), ánimos de
  paleta/tipografía, afinidad por giro, la variante preferida por rol y tier (primero `extended`, al
  final una legacy de respaldo), el arquetipo de blueprint al que equivale hasta WP8 y un espécimen
  (giro + paleta + par de las bibliotecas).
- `families.ts`: familia de composición de cada una de las 47 variantes (`media-text`, `full-media`,
  `type`, `rows`, `cells`, `quote`, `figures`, `split-panel`, `band`, `chrome`).
- `verticals.ts`: 10 módulos con nombre y, por giro, sus arquetipos y el copy es-MX de las claves
  nuevas.

| Arquetipo   | V/M/D | Estilo (shape · surface · density · divider · imagen · escala)           | Motion    | Giros (orden)                               | Portada Pro / Básico | Espécimen                                      |
| ----------- | ----- | ------------------------------------------------------------------------ | --------- | ------------------------------------------- | -------------------- | ---------------------------------------------- |
| `editorial` | 6/5/3 | sharp · flat · airy · hairline · offset · expressive (tracking tight)    | calm      | despacho, florería, restaurante, estética   | columns / columns    | despacho · pal-indigo-papel · newsreader       |
| `showcase`  | 8/6/3 | soft · flat · airy · none · plain · normal                               | editorial | estética, florería, tienda, barbería, rest. | framed / framed      | estética · pal-rosa-vino · gloock+onest        |
| `catalog`   | 5/4/6 | soft · outlined · cozy · hairline · plain · normal                       | calm      | restaurante, tienda, barbería, estética     | framed / framed      | restaurante · pal-azulejo · petrona+rubik      |
| `booking`   | 4/4/5 | round · elevated · cozy · none · framed · normal                         | calm      | clínica, dental, veterinaria, estética, gym | panel / panel        | dental · pal-turquesa-agua · red-hat           |
| `trust`     | 3/4/5 | soft · outlined · cozy · hairline · plain · tight                        | calm      | despacho, clínica, dental, veterinaria      | panel / panel        | clínica · pal-niebla-grafito · eb-garamond     |
| `bold`      | 9/7/4 | sharp · flat · compact · rule · duotone-overlay · expressive, MAYÚSCULAS | editorial | barbería, gimnasio, tienda                  | poster / poster      | gimnasio · pal-carbon-lima · bebas-neue+barlow |
| `soft`      | 5/5/3 | pill · tinted · airy · none · arch · normal                              | calm      | estética, florería, veterinaria, dental     | duo-arch / duo-arch  | veterinaria · pal-salvia-tinta · fredoka       |
| `minimal`   | 5/4/2 | sharp · flat · airy · hairline · plain · tight                           | calm      | despacho, clínica, tienda                   | columns / columns    | tienda · pal-papel-tinta · schibsted           |

Módulos: `aviso-del-dia` (notice-bar), `cita-con-nota` (hero/panel + nota), `carta`
(menu-columns), `cierre` (cta/band), `quien-atiende` (team/spotlight), `calificacion`
(rating-wall + nota de ejemplo), `ubicacion-ligera` (map-link / single-card), `galeria-bento`,
`doble-arco` (duo-arch + foto de detalle) y `preguntas-a-la-vista` (faq/grid). Cada giro tiene 3–4,
en orden de valor (p. ej. restaurante: aviso del día «Hoy: comida de 13:00 a 18:00», carta, galería
bento, cierre «Reservar mesa»; clínica: cita con nota, quién atiende, calificación, ubicación ligera).

`test/archetypes.test.ts` comprueba que cada variante exista y pueda llenar su rol en el tier, el
rango de secciones contadas y los roles obligatorios, el orden (hero primero, WhatsApp antes del pie),
≥ 4 familias por página y nunca tres «imagen + texto» seguidas, presets y especímenes válidos, copy de
módulos dentro de los límites, familia para toda variante y que toda variante `extended` se use en
algún arquetipo o módulo. (Tres Básicos tenían 3 familias: se cambió su FAQ, no la regla.)

**Hoja:** `pnpm lattiz kit archetypes [id…]` compila una página Pro y una Básica por arquetipo con su
espécimen y el copy de sus módulos, la pasa completa por `kit:validate` y por las reglas de la sonda
(lo que ya hace una variante legacy, como los 12 px o los enlaces de 32 px de `footer/columns`, queda
WARN, igual que en `lattiz check`) y escribe `.lattiz/gallery/archetypes.html` con la página entera a
390 y 1440. 16/16 sin FAIL; encontró dos anchos < 44 px con etiquetas cortas, ya corregidos.

## Capacidad después de WP6

`pnpm lattiz kit capacity --catalog extended` (2026-10-12, ya con `restaurante-hoja-y-barro` en
`main`):

| Giro        | Portadas Pro libres | Pares Básico + Pro | Total | Lo limita ahora |
| ----------- | ------------------- | ------------------ | ----- | --------------- |
| barberia    | 0/4 → 5/9           | 0 → 5              | 12    | paletas (tonos) |
| clinica     | 3/4 → 8/9           | 3 → 8              | 17    | paletas         |
| dental      | 3/4 → 8/9           | 3 → 8              | 16    | paletas         |
| despacho    | 3/4 → 8/9           | 3 → 8              | 17    | paletas         |
| estetica    | 3/4 → 8/9           | 3 → 8              | 16    | paletas         |
| floreria    | 3/4 → 8/9           | 3 → 8              | 16    | paletas         |
| gimnasio    | 3/4 → 8/9           | 3 → 8              | 16    | paletas         |
| restaurante | 2/4 → 7/9           | 2 → 7              | 14    | paletas         |
| tienda      | 3/4 → 8/9           | 3 → 8              | 16    | paletas         |
| veterinaria | 3/4 → 8/9           | 3 → 8              | 17    | paletas         |

Las portadas ya no topan los pares; ahora los topan las paletas (tono a ≥ 30° y ΔE ≥ 15), sin tocar
umbrales. Antes de la Parte 2, restaurante ya había bajado de 3 a 2 pares por `hoja-y-barro`.

## Capacidad en A1 (WP2, 2026-10-14)

`pnpm lattiz kit capacity --catalog extended`, antes y después, con las 42 plantillas de `main`.
Qué topa cada modo (salida completa de `giroCapacity`, no solo el Total):

- **Pares Básico + Pro:** las **portadas Pro** (9 variantes; una por Pro del giro). Restaurante tiene
  4 libres, barbería 5, clínica 6. Subir esto es diseño (portadas nuevas): Fase A2.
- **Básicos después de los pares:** las **paletas**. Las ventanas de tono a ≥ 30° ya casi no existen
  (restaurante 4, barbería 4, clínica 5) y los acentos neutros que quedaban chocaban por ΔE.
- Pares tipográficos: no topan (21–29 libres por giro).

Se agregaron **8 paletas de acento neutro sobre fondos distintos** (`palettes/seeds.ts`, bloque
«A1 · WP2»; ids nuevos, solo `extended`; `library.ts` solo ganó entradas): cuatro teñidas con acento
tinta (`pal-coral-tinta`, `pal-cielo-tinta`, `pal-lavanda-tinta`, `pal-menta-tinta`) y cuatro oscuras
con acento claro (`pal-bosque-hueso`, `pal-ciruela-plata`, `pal-cacao-crema`, `pal-petroleo-hueso`).
Todas AA por construcción (`kit:palettes`) y revisadas en `kit gallery --palettes`. La regla de
30° no cuenta un acento casi gris (diferencia de canales ≤ 20/255), así que la capacidad crece por el
fondo: cada una queda a ≥ 15 (ΔE00 fondo + acento) de toda paleta del giro. Se descartó un
«durazno y tinta»: su acento salía en 44° y su fondo a 12.6 de `pal-mostaza`. `CATALOG_VERSION` 1 → 2.

| Giro        | Total antes | Total después | Pares (antes = después) | Lo topa ahora                          |
| ----------- | ----------- | ------------- | ----------------------- | -------------------------------------- |
| barberia    | 12          | **20**        | 5                       | pares: portadas Pro · Básicos: paletas |
| clinica     | 12          | **20**        | 6                       | ídem                                   |
| dental      | 16          | **24**        | 8                       | ídem                                   |
| despacho    | 17          | **23**        | 8                       | ídem                                   |
| estetica    | 14          | **22**        | 7                       | ídem                                   |
| floreria    | 14          | **24**        | 7                       | ídem                                   |
| gimnasio    | 16          | **25**        | 8                       | ídem                                   |
| restaurante | 9           | **18**        | 4                       | ídem                                   |
| tienda      | 16          | **23**        | 8                       | ídem                                   |
| veterinaria | 17          | **25**        | 8                       | ídem                                   |

Meta (restaurante, clínica y barbería ≥ 14; resto ≥ 12): cumplida. Ojo: los **pares** de restaurante
siguen en 4; si se siguen agregando pares, lo que se acaba primero son las portadas Pro.

Pares más cercanos por giro después del cambio (ΔE00 fondo + acento, mínimo 15): restaurante
`pal-arcilla`~`pal-coral-tinta` 15.7, clínica `pal-marino-hueso`~`pal-petroleo-hueso` 17.1 (el par más
cercano del giro sigue siendo uno viejo: `pal-papel-tinta`~`pal-salvia-tinta` 15.8), barbería
`pal-tinta-hueso`~`pal-vino-hueso` 16.3 (los nuevos quedan más lejos), florería y tienda
`pal-arcilla`~`pal-coral-tinta` 15.7, veterinaria `pal-salvia-tinta`~`pal-menta-tinta` 18.

**Ningún spec cambia:** `kit:verify-snapshot` idéntico (42 plantillas, 23 specs; los 7 `extended` se
planean con su lock). Con `.lattiz/cache` vacía, `lattiz build restaurante-ceniza --out …` y
`lattiz build clinica-cauce --out …` regeneran sus 7 archivos byte por byte; el lock solo difiere en
`catalogVersion` (que `lockChoices` ignora a propósito). Sin lock, un spec `extended` sí podría
moverse: por eso todo spec nuevo debe commitear su lock.

## Manifiesto del catálogo (A1 · WP3)

`packages/template-kit/catalog/catalog.manifest.json` (generado y commiteado; tipos en
`catalog/types.ts`, sin imports). `pnpm --filter @lattiz/template-kit kit:manifest` lo escribe y
`kit:manifest --check` falla si quedó viejo; **`pnpm lint` ya corre `--check`**: si cambias una
sección, una paleta, un par, un arquetipo o un giro, regenera y commitea el manifiesto. Determinista
(sin fechas): `contentHash` es el sha256 del manifiesto canónico; `manifestVersion` 1;
`catalogVersion` = `CATALOG_VERSION`.

Por variante (47): `key` (`slot/variant`, el par de `data-lz-slot`/`data-lz-variant`), etiqueta,
región, descripción, `intent`, `catalog` (legacy/extended), `tiers` (de `meta.tiers` o, si la meta no
lo dice, de los blueprints), `blueprintTiers` (dónde puede colocarla hoy el compilador), `proOnly`,
roles que caen en el slot, `contentKeys`, anclas (`id="…"` literales), `fit` (`data-lz-fit`),
`numbered`, arquetipos, familia y `motion` (tipo y patrón por defecto que el seed le pone al slot,
leídos de `scripts/lib/motion-sections.ts`; Básico nunca carga Motion), más `hooks` (atributos del
runtime de Motion escritos en el fragmento: hoy ninguna variante del kit trae alguno). Además: los 9
`hooks` del runtime (todos solo Pro: `compose-site` inyecta Motion solo con `isPro`), arquetipos,
paletas (biblioteca y las de cada giro, con tono de acento o `null` si es neutro), pares tipográficos
y giros.

**Solo Pro (17):** `about/{portrait,statement,stats-strip,text-image-offset}`,
`gallery/{bento,grid,mosaic,strip}`, `locations/{map-link,with-contact}`, `marquee/ticker`,
`team/{grid,list,spotlight}`, `testimonials/{cards,quote-feature,rating-wall}`. Una variante sin tier
declarado ni blueprint (`locations/cards`, que ninguna plantilla usa) queda `tiers: []` y **no** es
solo Pro. El generador falla si una plantilla Básica usa una variante marcada solo Pro.

**Cómo se consume (sin importar el compilador):** `apps/web` (Vite) puede importar el JSON y los
tipos por ruta del workspace cuando el editor lo necesite (A1 no cambia el editor). `apps/api` **no**
depende del kit: su imagen se arma con `pnpm deploy --prod --legacy`, que hoy asume que la API no tiene
dependencias del workspace, y sumar una (o un paquete compartido nuevo) exige probar el build de
Docker, que no hay en esta máquina. Por eso WP4 genera desde el manifiesto un subconjunto mínimo
dentro de la API (`*.generated.ts`, comprobado por el mismo `--check`). Un paquete compartido
(`@lattiz/catalog`, solo JSON + tipos, sin dependencias) es lo correcto a mediano plazo, cuando se
pueda validar el Dockerfile.

### Inventario: bloques del editor ↔ variantes del kit

Los bloques del editor (`apps/web/src/features/editor/blocks/`) están escritos a mano con clases
`lzb-*`, **no** llevan `data-lz-slot`/`data-lz-variant` y no salen de `sections/`. `sectionBlocks`
da los Básicos a todos y suma los Pro solo con `templateAccess.proIncluded` (filtro solo en el
cliente). Equivalencias aproximadas (ninguna es el mismo markup):

| Bloque del editor    | Kit `basic-blocks.ts` / `pro-blocks.ts` | Variante del kit más cercana               | Marcadores solo Pro que lleva                         |
| -------------------- | --------------------------------------- | ------------------------------------------ | ----------------------------------------------------- |
| `lzb-hero-simple`    | Básico (`.lzb-hero`)                    | `hero/split` (sin foto: ninguna)           | ninguno (`data-lz-section="hero"`, inerte sin Motion) |
| `lzb-services-grid`  | Básico (`.lzb-services`)                | `services/cards`                           | ninguno                                               |
| `lzb-gallery-grid`   | Pro desde Fase C (`.lzb-gallery`)       | `gallery/grid` (**solo Pro** en el kit)    | ninguno (Pro por su variante)                         |
| `lzb-contact-hours`  | Básico (`.lzb-contact`)                 | `locations/single-card`                    | ninguno                                               |
| `lzb-hero-editorial` | Pro (`.lzb-hero-ed`)                    | `hero/columns`                             | `data-lz-words`, `data-lz-parallax`, `data-lz-reveal` |
| `lzb-marquee`        | Pro (`.lzb-marquee`)                    | `marquee/ticker`                           | ninguno de Motion (animación CSS)                     |
| `lzb-stacked-cards`  | Pro (`.lzb-stack`)                      | sin equivalente                            | `data-lz-reveal`                                      |
| `lzb-snap-gallery`   | Pro (`.lzb-snap`)                       | `gallery/strip`                            | `data-lz-reveal`, `data-lz-lightbox`                  |
| `lzb-before-after`   | Pro (`.lzb-compare-block`)              | sin equivalente                            | `data-lz-compare`                                     |
| `lzb-stats`          | Pro (`.lzb-stats`)                      | `about/stats-strip`                        | `data-lz-counter`, `data-lz-stagger`                  |
| `lzb-promo-bar`      | Pro (`.lzb-promo`)                      | `navbar/notice-bar` (sin cuenta regresiva) | `data-lz-countdown`                                   |
| `lzb-open-now`       | Pro (`.lzb-open`)                       | sin equivalente                            | `data-lz-open-now`                                    |
| `lzb-whatsapp-cards` | Pro (`.lzb-menu`)                       | `services/menu-columns`                    | `data-lz-reveal`, `data-lz-stagger`                   |

Fase C: cada bloque declara su `kitVariant` y su plan se deriva del manifiesto (`blocks/plan.ts`); la
galería pasó a Pro. Los 3 bloques Pro sin variante en el kit (`stacked-cards`, `before-after`,
`open-now`) quedan **solo editor** (`editorOnly`): son Pro por sus hooks de Motion y no se agregan al
kit. Los bloques `lzb-*` escritos a mano siguen sin `data-lz-slot`/`data-lz-variant`; los bloques nuevos
generados del kit (`lzb-hero-bento`, `-rail`, `-overlap`, `-stack`, `lzb-cta-band` y 7 piezas) sí los
llevan, así que el guard de la API los ve.

## Presupuesto de bytes y Web Vitals (A1 · WP5)

### Presupuestos (`packages/template-kit/budgets.json`)

Por tier, en bytes (aquí en KiB). Punto de partida: el máximo de las 42 plantillas el 2026-10-14
(compiladas en memoria con las imágenes del repo) + ~10 %, redondeado a KiB entero. `html` es el
`index.html` de vista previa (con el CSS en línea, lo que sirve un sitio); `imágenes` son las locales
de una página (total y la mayor); `js` es el gzip del runtime de Motion (solo Pro; Básico no lleva JS).

| Tier   | CSS (crudo / gzip) | HTML (crudo / gzip) | Imágenes (total / mayor) | JS gzip | Máximo de hoy (plantilla)                                                                                                                                            |
| ------ | ------------------ | ------------------- | ------------------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Básico | 28 / 6             | 48 / 11             | 175 / 175                | 0       | CSS 24.7 (`estetica-base-alheli`), gzip 4.9; HTML 42.8 (`floreria-base-flores-lupita`), gzip 9.8; imagen 158.9 (`restaurante-base-ceniza`)                           |
| Pro    | 38 / 7             | 67 / 15             | 2828 / 323               | 8       | CSS 33.7 y gzip 6.2 (`restaurante-margen`); HTML 60.8, gzip 13.4 (`barberia-oxido`); imágenes 2570.5 en 20 fotos, mayor 293 (`restaurante-hoja-y-barro`); Motion 7.1 |

- `kit:validate` (sobre manifiestos) imprime una línea `budget` por plantilla; pasarse es **WARN**
  y no cambia el código de salida. `kit:validate --strict-budget` lo vuelve **FAIL** (exit 1).
- `lattiz build` de un spec: si la plantilla **todavía no existe** en `templates/`, pasarse es un
  hallazgo `budget` y el build se niega (como cualquier hallazgo de `kit:validate`); si ya existe,
  queda como aviso y construye igual. Ninguna plantilla de hoy se pasa (`--strict-budget` sobre las
  42: 0 avisos, ~16 s).
- Los gzip de zlib varían un poco entre macOS y Linux; el 10 % lo cubre. El peso de las imágenes Pro
  lo dominan las fotos de la plantilla (hasta 20 por página): es el primer candidato a apretar.
- Subir un número solo con una razón escrita en el commit.

### Web Vitals en `lattiz check --lighthouse`

Además de los puntajes, la regla `cwv` imprime **LCP, CLS y TBT** del mismo reporte de Lighthouse (su
emulación móvil por defecto, con throttling simulado) contra LCP ≤ 2.5 s, CLS ≤ 0.1 y TBT ≤ 200 ms
(TBT hace de INP en laboratorio). Por ahora es **WARN**, nunca FAIL. Son números **de laboratorio
sobre la vista previa local estática** (sin CDN, fuentes servidas en local, imágenes del repo), **no
datos de campo**: sirven para comparar plantillas entre sí y ver tendencias. El SEO sale 66 en todas
porque la vista previa de `lattiz` se arma con `noindex` (artefacto local, no de la plantilla).

Línea base (2026-10-14, MacBook, una plantilla a la vez, un navegador):

| Plantilla                    | Tier   | Perf | LCP    | CLS   | TBT  | Veredicto | Tiempo | RSS pico\* |
| ---------------------------- | ------ | ---- | ------ | ----- | ---- | --------- | ------ | ---------- |
| `barberia-base-abeto-v1`     | Básico | 98   | 1.95 s | 0.002 | 0 ms | PASS      | 40 s   | 500 MB     |
| `barberia-abeto-v1`          | Pro    | 98   | 1.98 s | 0.001 | 0 ms | PASS      | 40 s   | 542 MB     |
| `restaurante-base-ceniza-v1` | Básico | 88   | 3.15 s | 0.002 | 0 ms | WARN LCP  | 40 s   | 539 MB     |
| `restaurante-ceniza-v1`      | Pro    | 81   | 4.06 s | 0.006 | 0 ms | WARN LCP  | 52 s   | 671 MB     |
| `clinica-base-cauce-v1`      | Básico | 90   | 2.93 s | 0.002 | 0 ms | WARN LCP  | 37 s   | 509 MB     |
| `clinica-cauce-v1`           | Pro    | 89   | 2.94 s | 0.000 | 0 ms | WARN LCP  | 41 s   | 540 MB     |

\* `/usr/bin/time -l` del proceso de `lattiz check` completo (las 7 medidas con Playwright más
Lighthouse); Chromium corre en procesos aparte. Accesibilidad y buenas prácticas: 100 en las seis.

Lectura: CLS y TBT están bien en todas (las métricas de fuente y la falta de JS en Básico se notan);
lo que falla es **LCP**. No lo explica solo el peso total (`barberia-abeto-v1` lleva 1.25 MiB de
fotos y pasa; `restaurante-ceniza-v1` lleva 2.05 MiB, la mayor de 265 KiB, y no; `clinica-cauce-v1`
lleva 0.87 MiB y queda en 2.94 s): manda la imagen y el tipo de portada que pintan el LCP. Siguiente
paso (A2 o después): revisar la imagen LCP de cada portada (peso, tamaño, `fetchpriority`) y apretar
el presupuesto de imágenes, sin tocar las plantillas existentes.

### Fase A2: diseño nuevo (rama `feat/kit-phase-a2`, desde `main` con A1)

Primitivos, direcciones de arte, portadas Pro nuevas e integración al compilador, todo `extended` y
aditivo. Estado al 2026-10-14:

| WP  | Qué                                                                            | Estado | Commits                                     | Desviaciones                                                                                                                                                                                  |
| --- | ------------------------------------------------------------------------------ | ------ | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| WP1 | Primitivos (7 familias), CSS solo si el markup los usa                         | hecho  | 6335862, 3c332d8                            | adoptarlos en variantes existentes queda fuera (cambia su salida)                                                                                                                             |
| WP2 | 6 direcciones de arte: registro, pruebas y galería                             | hecho  | 3f314d3, 27f31b8, b4908ca, 34e8e5a, 46b5271 | WP en varios commits; 2 FAIL `nojs` de la revisión en `team/spotlight` (falso positivo, documentado, regla sin cambiar); deriva al gris corregida con 3 paletas, queda neón × barbería Básico |
| WP3 | Portadas Pro nuevas: bento, rail, overlap, stack                               | hecho  | 266ed15, e35a13d                            | `bento` solo Pro (presupuesto Básico); copy de ejemplo en `meta.ts › sample`, no en `sample.es-MX.ts`                                                                                         |
| WP4 | Compilador: `layout`, arquetipos, rol `cta`, sample, lint de copy, CLI y skill | hecho  | 69f6846, 8a0a2bd, 80d018a                   | estilo en `brand.style.*` (no `layout.style`); arquetipos como registro aparte; `meta.sample` solo con `layout`; `cta` cuenta como sección                                                    |
| WP5 | LCP: diagnóstico y política para lo nuevo                                      | hecho  | 5460fb5, 34eb686                            | la causa principal (hoja de Google Fonts) se arregla en tenant-sites: propuesta, no aplicada; recodificar las 5 portadas pesadas pide re-baseline                                             |
| WP6 | Prueba de diversidad: 20 specs de ejemplo, 40 plantillas                       | hecho  | e35a13d, d282f0d, e25929f                   | 1 ronda de ajuste (despacho); `rail` corregido (marco vacío); CLS > 0.1 en 3 Pro por cambio de renglones del titular al cargar la fuente (A3); `lattiz review --root` nuevo                   |
| WP7 | Docs y decisiones                                                              | hecho  | 80d018a, (este)                             | decisiones: template-primitives, spec-direction-archetype-wiring, cta-role, lcp-policy, template-art-directions; template-palette-library actualizada                                         |

**Cierre A2 (2026-10-14):**

- `kit:verify-snapshot` idéntico (42 plantillas, 23 specs): ninguna plantilla existente se movió.
- `pnpm lint` (con `kit:manifest --check`, hash `2296b41e14c10336`) y `pnpm typecheck` (7/7) ok.
- Tests del kit: 201/201.
- Nada remoto: sin seed, deploy, publish, Stripe, R2 ni Vercel, y sin escrituras en Supabase. Rama
  local `feat/kit-phase-a2`, sin push.

La desviación heredada de A1 (`lzb-gallery-grid` Básico en el editor, `gallery` solo Pro en el kit) quedó
cerrada en la Fase C.

### Fase C: editor y dashboard (rama `feat/phase-c-editor-dashboard`, desde `main` @ `5549062`)

Que el editor y el dashboard reflejen el kit y que el plan sea uno solo de punta a punta (manifiesto →
API → editor → dashboard). Estado al 2026-10-17:

| WP    | Qué                                                         | Estado | Commits | Desviaciones                                                                                                       |
| ----- | ----------------------------------------------------------- | ------ | ------- | ------------------------------------------------------------------------------------------------------------------ |
| WP-C0 | Auditoría y plan                                            | hecho  | —       | `hero/bento` tenía `tiers: ['pro']` pero no era «solo Pro»; rail/overlap/stack son Básico + Pro en el kit           |
| WP-C1 | Fuente única del plan (manifiesto → API y editor)           | hecho  | bfbd69a | `meta.tiers` explícito gana al blueprint: `hero/bento` pasa a solo Pro; galería Pro también en el editor            |
| WP-C2 | Bloques del kit en el editor (portadas, `cta`, primitivos)  | hecho  | c22084e | los 3 bloques Pro sin variante quedan «solo editor» (sin cambio en el kit)                                          |
| WP-C3 | Dashboard: filtros por giro y dirección, rasgos Pro         | hecho  | bae05db | índice estático generado desde el kit; sin endpoint ni cambio de esquema                                            |
| WP-C4 | Pruebas, revisión en el editor local, docs                  | hecho  | 364b2f0, (este) | la revisión encontró 2 fallas (clic en bloque bloqueado, tokens en proyectos legacy), corregidas en 364b2f0 |

**Qué escribe ahora `kit:manifest`** (todo cubierto por `--check`, que corre en `pnpm lint`):
`catalog/catalog.manifest.json`, `apps/api/src/modules/sites/plan-catalog.generated.ts` y su copia
idéntica `apps/web/src/features/editor/blocks/plan-catalog.generated.ts`, los bloques del kit
`apps/web/src/features/editor/blocks/kit-blocks.generated.ts` (`src/cli/editor-blocks.ts`) y la identidad
por plantilla `apps/web/src/features/templates/template-identity.generated.ts` (`src/cli/template-identity.ts`).

**Plan de un bloque** (`apps/web/src/features/editor/blocks/plan.ts`): Pro si la variante del kit que
representa (`kitVariant`) es solo Pro o si su markup lleva un hook de Motion solo Pro. Es la misma regla
y la misma lista que el guard de la API. Sin Pro, los bloques Pro se ven con insignia «Pro», no se
arrastran y el clic abre el aviso para mejorar (`blocks.appendOnClick`: Studio 1.1.1 inserta por clic
aunque el bloque esté `disable` y no llama su `onClick`). `plan.test.ts` falla si el editor, el
manifiesto y la API no coinciden en una variante o un hook.

**Bloques del kit:** se renderizan desde `section.html` con copy neutro es-MX, `h1` → `h2`, sin `id` ni
`fetchpriority`, contacto como `{{lz:*}}`, y llevan solo el CSS que usa su markup: las reglas de
`core.css` cuyas clases están todas en el markup, los primitivos usados (con su estilo por defecto) y el
CSS de la variante. Studio agrega el `styles` de un bloque con `avoidUpdateStyle`, así que una regla que
el proyecto ya tiene nunca se reescribe (insertar no cambia lo existente). Los tokens van de respaldo en
`:where(html){…}`: sin especificidad, solo llenan los que el proyecto no define (proyectos legacy con su
propio `:root`); en una plantilla del kit su `:root` gana en cada token. Dentro de una plantilla cuya
dirección usa otro estilo de primitivo, una pieza insertada se ve con el estilo por defecto.

**Matriz de plan (después):**

| Elemento                         | Kit (`proOnly`) | API guard | Editor                                | Dashboard                    |
| -------------------------------- | --------------- | --------- | ------------------------------------- | ---------------------------- |
| `gallery/*`                      | Pro             | Pro       | `lzb-gallery-grid`, `lzb-snap-gallery` Pro | rasgo «Galería» Pro      |
| `hero/bento`                     | Pro             | Pro       | `lzb-hero-bento` Pro                  | rasgo «Portada con cifras»   |
| `hero/rail`, `overlap`, `stack`  | Básico + Pro    | libre     | bloques Básico                        | —                            |
| `cta/band`                       | Básico + Pro    | libre     | `lzb-cta-band` Básico                 | —                            |
| primitivos (7)                   | ambos tiers     | n/a       | «Piezas», Básico                      | —                            |
| hooks de Motion (9)              | Pro             | Pro (no bloquea) | bloques que los llevan, Pro    | rasgo «Animaciones» en Pro   |

**Verificación (2026-10-17, MacBook, Node 24.9 de Homebrew):** tests de `apps/web` 36/36 en los archivos
nuevos y viejos que vitest corre; API node 201/201 (5 nuevos del guard) y jest ok; kit 201/201;
`kit:manifest --check` ok (hash `db31f8c7389a84bb`); `kit:verify-snapshot` con las mismas 5 diferencias
de La Nota Azul que ya tenía `main` (ninguna nueva). Revisión manual en un arnés local del editor
(Studio + bloques + proyectos del kit y el fixture legacy `oxido`, guardando en `sessionStorage`, sin
API ni datos de producción): bloqueo en Básico, inserción de cada bloque nuevo, guardar y recargar,
tokens de la plantilla intactos, HTML exportado sin marcadores Pro en Básico. No revisado en navegador:
el dashboard (necesita la API con datos reales) y el diálogo para mejorar (necesita el router).

## Primitivos (A2 · WP1)

Piezas compartidas que las variantes **nuevas** componen, para que una sola elección de dirección de
arte reestilice toda la página. Viven en `packages/template-kit/primitives/<familia>/` (`base.css` +
un `<estilo>.css` por estilo) y se registran en `primitives/index.ts`. Solo catálogo `extended`.

| Familia               | Bloque BEM     | Estilos (los marcados «contextual» se escriben a mano)                    | Por defecto          | base gzip (B) |
| --------------------- | -------------- | ------------------------------------------------------------------------- | -------------------- | ------------- |
| Botón                 | `lz-btn`       | solid, outline, pill, underline, icon (contextual), on-image (contextual) | solid                | 569           |
| Tarjeta               | `lz-tile`      | flat, outlined, tinted, elevated                                          | tokens `--lz-card-*` | 450           |
| Etiqueta / antetítulo | `lz-tag`       | pill, outlined, plain, numbered                                           | plain                | 242           |
| Marco de imagen       | `lz-frame`     | arch, cut, offset, framed, duotone                                        | tokens `--lz-img-*`  | 422           |
| Cifra grande          | `lz-bignum`    | plain, ruled                                                              | plain                | 321           |
| Cita destacada        | `lz-pullquote` | rule, marks                                                               | rule                 | 340           |
| Separador             | `lz-rule`      | hairline, rule, ornament                                                  | hairline             | 149           |

Cada estilo cuesta 70–313 B gzip (cifras exactas en `catalog.manifest.json › primitives`). Un rol
(`lz-btn--secondary`) no es un estilo: el elemento que lo lleva conserva su aspecto propio.

**Cómo funciona.** La variante escribe el bloque (`class="lz-btn"`). El tema puede elegir un estilo
por familia (`theme.primitives`, p. ej. `{ "button": "pill", "card": "tinted" }`; lo escribe una
dirección de arte, WP2); al compilar, `applyPrimitiveStyles` agrega `lz-btn--pill` a cada elemento del
bloque que no nombre ya un estilo o un rol. Después, `primitiveCss` lee las clases del HTML de las
secciones y emite **solo** el `base.css` de las familias usadas y los estilos presentes, entre
`core.css` y el CSS de las variantes. Las variantes existentes no usan ninguna clase de primitivo, así
que su salida no cambia (`kit:verify-snapshot` idéntico, 42 plantillas); `kit:validate` revisa el CSS
de los primitivos usados como el de cualquier sección (colores, cortes, reduced-motion).

**Reglas que cumplen todos:** tokens con el look de hoy como respaldo; solo `transform`/`opacity`
animados (más cambios de color con `--lz-dur-ui`); presión con `--lz-press-scale`; hover bajo
`(hover: hover) and (pointer: fine)`; `:focus-visible` sin transición; override de
`prefers-reduced-motion`; texto ≥ 14 px; táctiles ≥ 44 px. Los modificadores explícitos de marco
(`offset`, `framed`, `duotone`) usan valores propios: si leyeran los tokens `--lz-img-*`, un tema con
`imageTreatment` los anularía (se vio en la galería, ronda 1). El marco `offset` reserva su margen.

**Galería:** `pnpm lattiz kit gallery --primitives` → `.lattiz/gallery/primitives.html`: cada familia
en tres temas (claro sin `style`, oscuro sin `style`, teñido con presets) a 390 y 1440 (42 capturas,
~25 s). Dos rondas de crítica: el `outline` principal se confundía con el secundario (ahora lleva un
tinte del acento), la sombra de `elevated` hacía halo en temas oscuros (ahora usa `--lz-color-ink`),
los marcos explícitos no se veían bajo un tema con presets y la cifra `plain` heredaba las mayúsculas
del display.

**Agregar un estilo:** archivo `primitives/<familia>/<estilo>.css` con selectores
`.<bloque>--<estilo>`, entrada en `primitives/index.ts` (con `intent`; `contextual: true` si solo se
escribe a mano), `pnpm lattiz kit gallery --primitives`, crítica y `kit:manifest`.

**Adoptarlos en una variante existente (futuro, opt-in):** cambiar su markup a los bloques
(`lz-button lz-button--primary` → `lz-btn`) cambia su salida, así que se hace variante por variante,
con su propio commit, la comparación `kit:compare` antes/después y un re-baseline explicado del
golden. A2 no lo hace.

## Direcciones de arte (A2 · WP2)

Una dirección de arte fija de una vez lo que un spec elegía por separado. Es un dato en
`packages/template-kit/directions/<id>.ts`, registrado en `directions/index.ts`, y lo validan
`src/spec/direction.ts`, `kit:manifest` y `pnpm lint`. Solo catálogo `extended`; un spec la pide con
`layout.direction`. Cada dirección incluye:

- listas ordenadas de paletas y pares (con `byGiro` opcional);
- los 8 presets de `style` y los 7 estilos de primitivos;
- arquetipos y portadas por tier;
- preset de Motion y diales V/M/D;
- los giros donde encaja;
- voz: registro, 3–5 reglas, palabras vetadas, titular y CTA de ejemplo;
- reglas de gusto.

| Dirección           | V/M/D | Motion    | Arquetipos         | Reglas                                          | Portadas Pro / Básico                        | Giros (los dos primeros se prueban)              |
| ------------------- | ----- | --------- | ------------------ | ----------------------------------------------- | -------------------------------------------- | ------------------------------------------------ |
| `cantera-editorial` | 6/5/3 | calm      | editorial, minimal | `scheme:light`, `display:serif`, `no-gradients` | rail, columns, split / columns, split        | despacho, restaurante, florería, estética        |
| `neon-nocturno`     | 8/7/7 | editorial | bold, showcase     | `scheme:dark`, `display:upper`, `no-gradients`  | poster, bento, image-bg / poster, image-bg   | barbería, gimnasio, restaurante, tienda          |
| `jardin-suave`      | 5/5/3 | calm      | soft, booking      | `scheme:light`, `no-gradients`                  | duo-arch, overlap, panel / duo-arch, overlap | estética, veterinaria, florería, dental, clínica |
| `tinta-papel`       | 4/4/5 | calm      | minimal, trust     | `accent:neutral`, `no-gradients`                | split, panel, columns / split, columns       | despacho, tienda, clínica, barbería              |
| `terracota-calida`  | 6/4/5 | calm      | catalog, showcase  | `scheme:light`, `no-gradients`                  | stack, framed, overlap / stack, framed       | restaurante, florería, tienda, estética          |
| `marmol-sobrio`     | 3/4/5 | calm      | trust, booking     | `no-gradients`                                  | panel, bento, split / panel, split           | clínica, dental, despacho, veterinaria           |

**Reglas del registro** (`registryProblems`):

- Dos direcciones difieren en **≥ 6 de las 15 elecciones**: los 8 presets de estilo más los 7
  primitivos.
- Dos direcciones no empiezan con la misma paleta ni con el mismo par.
- Las paletas y pares de cada lista cumplen las reglas de la dirección.
- Cada portada existe y está hecha para su tier.
- Ninguna portada centrada va con variación > 4.
- `motion` y `style.density` coinciden con sus diales.

**Compuerta al construir** (`directionFindings`, `rule: "direction"`):

- Revisa la plantilla compilada: fondo claro u oscuro, display en mayúsculas o serif, acento neutro.
- Busca `gradient(` en el CSS de los primitivos y de las variantes `extended`. Tres variantes legacy
  quedan exentas porque sus degradados sirven de velo sobre la foto.
- Con un hallazgo, `lattiz build` no escribe nada.
- Las mismas reglas filtran el respaldo de paletas y pares cuando la lista propia se agota.

### Pruebas: 24 plantillas, `lattiz check --lighthouse` (2026-10-14)

`pnpm lattiz kit gallery --directions` construye un Básico y un Pro por dirección en sus dos primeros
giros. Lo hace desde un spec real con `layout.direction`, fuera del kit: en
`.lattiz/gallery/directions/<dirección>--<giro>/`, con la hoja en `directions.html`. Cada prueba se
revisó con `lattiz check <id> --root <raíz> --lighthouse`, una a la vez (~40 s y ~2.2–2.7 GB de RSS
pico con Chrome). El script reanudable está en `.lattiz/a2/check-proofs.sh`.

**Números de laboratorio:** Lighthouse 12 con emulación móvil y throttling simulado, sobre la vista
previa local estática de `lattiz check` (sin CDN). Usa los placeholders del kit en lugar de fotos y
no son datos de campo. Se comparan con la línea base de A1 (abajo, «Web Vitals en `lattiz check
--lighthouse`»), medida en la misma máquina, pero sobre plantillas con fotos reales en algunos casos.

| Plantilla                              | Tier   | LCP    | CLS   | TBT  | HTML KiB | Total KiB | Veredicto |
| -------------------------------------- | ------ | ------ | ----- | ---- | -------- | --------- | --------- |
| `despacho-base-cantera-prueba-v1`      | Básico | 1.72 s | 0.001 | 0 ms | 44.4     | 148       | WARN      |
| `estetica-base-jardin-prueba-v1`       | Básico | 2.78 s | 0.000 | 0 ms | 41.1     | 113       | WARN LCP  |
| `estetica-jardin-prueba-v1`            | Pro    | 2.83 s | 0.002 | 0 ms | 60.1     | 236       | WARN LCP  |
| `veterinaria-base-jardin-prueba-v1`    | Básico | 2.64 s | 0.001 | 0 ms | 44.1     | 156       | WARN LCP  |
| `veterinaria-jardin-prueba-v1`         | Pro    | 2.93 s | 0.000 | 0 ms | 56.1     | 227       | WARN LCP  |
| `clinica-base-marmol-prueba-v1`        | Básico | 2.78 s | 0.000 | 0 ms | 42.3     | 135       | WARN LCP  |
| `clinica-marmol-prueba-v1`             | Pro    | 3.08 s | 0.000 | 0 ms | 59.2     | 293       | FAIL nojs |
| `dental-base-marmol-prueba-v1`         | Básico | 2.79 s | 0.001 | 0 ms | 42.3     | 124       | WARN LCP  |
| `dental-marmol-prueba-v1`              | Pro    | 2.78 s | 0.000 | 0 ms | 59.0     | 293       | FAIL nojs |
| `barberia-base-neon-prueba-v1`         | Básico | 2.51 s | 0.000 | 0 ms | 43.3     | 178       | WARN LCP  |
| `gimnasio-base-neon-prueba-v1`         | Básico | 2.79 s | 0.001 | 0 ms | 42.3     | 135       | WARN LCP  |
| `despacho-base-tinta-prueba-v1`        | Básico | 1.71 s | 0.001 | 0 ms | 43.1     | 167       | WARN      |
| `despacho-tinta-prueba-v1`             | Pro    | 2.06 s | 0.000 | 0 ms | 56.5     | 332       | WARN      |
| `tienda-base-tinta-prueba-v1`          | Básico | 1.73 s | 0.000 | 0 ms | 42.9     | 146       | WARN      |
| `tienda-tinta-prueba-v1`               | Pro    | 2.15 s | 0.000 | 0 ms | 54.6     | 399       | WARN      |
| `restaurante-base-cantera-prueba-v1`   | Básico | 1.73 s | 0.001 | 0 ms | 44.2     | 163       | WARN      |
| `barberia-neon-prueba-v1`              | Pro    | 2.97 s | 0.002 | 0 ms | 62.1     | 424       | WARN LCP  |
| `gimnasio-neon-prueba-v1`              | Pro    | 2.86 s | 0.002 | 0 ms | 60.6     | 256       | WARN LCP  |
| `floreria-base-terracota-prueba-v1`    | Básico | 2.64 s | 0.000 | 0 ms | 43.5     | 160       | WARN LCP  |
| `floreria-terracota-prueba-v1`         | Pro    | 3.16 s | 0.001 | 0 ms | 63.6     | 271       | WARN LCP  |
| `restaurante-base-terracota-prueba-v1` | Básico | 2.78 s | 0.001 | 0 ms | 43.5     | 120       | WARN LCP  |
| `restaurante-terracota-prueba-v1`      | Pro    | 3.09 s | 0.000 | 0 ms | 63.6     | 238       | WARN LCP  |
| `despacho-cantera-prueba-v1`           | Pro    | 1.98 s | 0.000 | 0 ms | 62.0     | 270       | WARN      |
| `restaurante-cantera-prueba-v1`        | Pro    | 2.94 s | 0.001 | 0 ms | 63.7     | 230       | WARN LCP  |

**Resumen:**

- **FAIL: 2 de 24.** Las dos son la misma falla de la regla `nojs`, que es un falso positivo de la
  revisión.
- **LCP:** media 2.56 s; 17 de 24 pasan de 2.5 s. Antes de las paletas nuevas eran 2.45 s y 14 de
  24 (ver «Deriva al gris»). Las siete pruebas que cambiaron, y las dos de `rail` tras su arreglo, se
  revisaron de nuevo.
- **CLS y TBT:** CLS ≤ 0.002 y TBT 0 ms en todas.
- **HTML:** dentro del presupuesto (Básico ≤ 48 KiB, Pro ≤ 67 KiB).

**Las tres FAIL de la primera corrida:**

1. **`fit`, `restaurante-base-cantera-prueba-v1`:** la portada `hero/split` medía 747 px contra
   744 px permitidos a 1440. Era un defecto real: el Básico de cantera tomaba la portada legacy
   `split`, que con el titular serif expresivo de la dirección no cabía por 3 px. La Pro gemela
   tomaba `columns` primero y al Básico solo le quedaba `split`. Se arregló reordenando las portadas
   Pro de la dirección (`heroes.pro: ['rail', 'columns', 'split']`): la Pro toma `rail` y el Básico
   `columns`. Ahora pasa. No se tocó la variante.
2. **`nojs`, `clinica-marmol-prueba-v1` y `dental-marmol-prueba-v1`** (`team › li`): es un falso
   positivo de la revisión.
   - `team/spotlight` oculta con `display:none` la lista de etiquetas de cada miembro.
   - El `<li>` hijo mide 0×0, pero su `display` calculado no es `none`, así que la regla lo cuenta
     como «oculto sin JS».
   - Sin JS no se oculta nada que con JS se vería: la lista no se muestra en ningún caso.
   - Por decisión de Santi queda como **FAIL documentada**: no se cambia la regla ni los arquetipos.
     Arreglarla (ignorar los descendientes de un ancestro con `display:none`) es un cambio de la
     revisión y va en su propio PR.

**Por qué el LCP:** en las 24 el elemento LCP es la imagen de la portada y el LCP ≈ FCP. La fase que
pesa es el retraso de render (1.3–2.7 s, con tiempo de carga de imagen 0). La hoja de Google Fonts
bloquea ~815 ms en todas. Es el mismo diagnóstico que `docs/template-kit-lcp.md` y no lo causan las
direcciones: entre la más rápida (1.71 s) y la más lenta (3.16 s) cambia el retraso de render, no la
carga de la imagen.

La causa exacta de esa diferencia no se aisló. No la explica el par tipográfico (Zilla Slab + IBM
Plex Sans da 1.71 y 2.64 s), ni los bytes de la foto (18–65 KiB), ni sus píxeles, ni la variante de
portada (`rail` da 1.86 y 3.08 s). El único patrón firme: los cuatro Básicos con `hero/columns` dan
1.71–1.73 s.

El número es repetible para un mismo build: una prueba sin cambios, revisada otra vez, da lo mismo.
Pero es muy sensible al layout. El arreglo de `rail` (WP6, solo el alto de la celda de la foto) movió
las dos Pro de cantera en sentidos opuestos: despacho bajó de 3.08 a 1.98 s y restaurante subió de
1.86 a 2.94 s. Así que la dispersión entre 1.7 y 3.1 s no habla de una dirección ni de una portada.
El retrofit propuesto allí (sacar la hoja del camino crítico en tenant-sites) es lo que más las
movería.

**Avisos heredados:** los WARN de `font` (12 px en `lz-index`, `lz-about-brief__label`,
`lz-location__label` y el título del pie) y los de `tap` (enlaces del pie de 32 px) vienen de
variantes legacy que las pruebas comparten con las plantillas existentes. No los introduce ninguna
dirección.

### Deriva al gris (A2, 2026-10-14)

**Medición.** `.lattiz/a2/drift.mts` lee el lock de cada prueba y marca, por tier:

- la paleta elegida;
- si es **propia** (de la lista de la dirección) o de **respaldo** (del pool filtrado por las reglas);
- si comparte algún ánimo (`mood`) con las paletas de la dirección.

En la primera corrida, 4 de 24 elecciones perdían el carácter de la dirección:

| Dirección × giro        | Tier   | Antes                                      | Después                            |
| ----------------------- | ------ | ------------------------------------------ | ---------------------------------- |
| cantera × restaurante   | Básico | `pal-niebla-grafito` (propia, gris)        | `pal-papel-violeta` (propia, 256°) |
| terracota × restaurante | Básico | `pal-niebla-grafito` (respaldo, sin ánimo) | `pal-coral-tinta` (propia, cálido) |
| neón × barbería         | Pro    | `pal-bosque-hueso` (respaldo)              | `pal-neon-uva` (propia, 294°)      |
| neón × barbería         | Básico | `petroleo` (respaldo legacy, 182°)         | igual: sigue en respaldo           |

Mármol y tinta también usan `pal-niebla-grafito`, pero está en su propia lista y va con su ánimo
(sobrio, clínico): no es deriva.

**Causa.** En los giros con muchas plantillas (restaurante 10, barbería 8), las paletas de la lista
chocan en tono (≥ 30°) o en distancia (ΔE00 ≥ 15) con las existentes o con la gemela Pro. El
compilador baja entonces a la siguiente de la lista o al respaldo, y lo que queda libre casi siempre
es neutro.

**Corrección.** Fue aditiva: solo catálogo `extended`, sin quitar paletas ni relajar reglas.

- **Paletas nuevas** en `palettes/seeds.ts`, bloque «A2». Pasan AA por construcción y quedan a
  ΔE00 ≥ 15 de toda paleta de su giro; ninguna entra en las tres parejas más cercanas de su giro:
  - `pal-neon-uva`: oscura, acento `#E04CF0` 294°; barbería, gimnasio, tienda.
  - `pal-adobe-tinta`: teñida adobe, acento tinta; restaurante, florería, tienda.
  - `pal-papel-violeta`: papel cálido, acento `#3F2A7A` 256°; restaurante, florería, estética.
- **Listas de las direcciones:**
  - neón suma `pal-neon-uva`;
  - terracota suma `pal-adobe-tinta`;
  - cantera cambia `pal-niebla-grafito` por `pal-papel-violeta`.
- **Paletas descartadas:**
  - `pal-neon-hielo`: 9.1 de `barberia:petroleo`;
  - `pal-neon-verde`: 10.7 de `barberia:hoja`;
  - `pal-papel-indigo`: 10.4 de `despacho:marino`. Se rediseñó como `pal-papel-violeta`, sin
    afinidad con despacho.

**Pruebas de que nada existente se movió:**

- `kit:verify-snapshot` idéntico (42 plantillas, 23 specs).
- `restaurante-margen` y `clinica-brote` se reconstruyeron con la caché de imágenes vacía y dieron
  byte a byte los mismos archivos.
- Ningún spec del repo usa `layout.direction`.
- Al reconstruir las 24 pruebas, las de jardín, tinta y mármol dieron el mismo `index.html`. Siete
  cambiaron, todas de las tres direcciones tocadas. Gimnasio × neón Pro también cambió (de
  `pal-jamaica-noche` a `pal-neon-uva`) porque la rotación por semilla recorre una lista más larga.

**Lo que queda.** Neón × barbería Básico sigue en respaldo. Barbería ya ocupa todas las paletas
oscuras de neón, y la nueva se la lleva la gemela Pro. El respaldo es oscuro por la regla
`scheme:dark`, pero sin el ánimo de neón. Arreglarlo pide otra paleta oscura con acento cálido y
lejana de las 9 legacy de barbería. Las candidatas probadas (verde, cian) chocaban con
`hoja`/`petroleo`, así que queda para cuando se agregue la siguiente.

**Capacidad** (`kit capacity --catalog extended`, Total antes → después):

- barbería 20 → 21
- clínica 20 → 21
- dental 24 → 27
- despacho 23 → 26
- estética 22 → 23
- florería 24 → 24
- gimnasio 25 → 25
- restaurante 18 → 19
- tienda 23 → 25
- veterinaria 25 → 26

Los pares Básico + Pro solo suben en despacho y tienda (11 → 12); los demás los siguen topando las
portadas Pro.

## Portadas nuevas (A2 · WP3)

Cuatro portadas con siluetas que no existían (todas `extended`, Básico + Pro, `data-lz-fit`, sin JS,
con primitivos: `lz-btn`, `lz-tag`, `lz-frame`, `lz-tile`, `lz-bignum`). Copy nuevo en
`meta.sample` (convención del repo; no hay `sample.es-MX.ts` aparte), nunca en `giros/` ni `content/`.

| Variante       | Silueta                                                                                            | Claves nuevas                                    | CSS crudo / gzip (B) | Revisión (`kit probe`, 16 casos)                                                                         |
| -------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------- | -------------------------------------------------------------------------------------------------------- |
| `hero/bento`   | Celdas: titular ancho, foto alta a la derecha, una celda por dato (≤ 3) debajo                     | `facts[].value?`, `facts[].label?`               | 3651 / 1191          | 3 rondas: gris secundario sin AA en celdas teñidas; en móvil no cabía → los datos eran solo de escritorio; luego el check `nojs` lo marcó y ahora van en fila de 3 celdas también en móvil, con la portada dentro del pliegue |
| `hero/rail`    | Texto primero: riel angosto con ficha de datos, titular a todo el ancho, foto en franja panorámica | `details[].label?`, `details[].value?`           | 3984 / 1239          | 3 rondas: encaje a 1024 con copy largo (columna de texto angosta); riel alineado arriba                  |
| `hero/overlap` | Partida con una foto de detalle con paspartú encimada en el borde de la foto grande                | `detailImage?`, `detailAlt?` (las de `duo-arch`) | 2822 / 983           | 1 ronda                                                                                                  |
| `hero/stack`   | Tarjeta elevada sobre una baraja de dos hojas; foto a sangre hasta el borde derecho de la ventana  | —                                                | 3562 / 1190          | 1 ronda                                                                                                  |

Reglas del reglamento que fijaron la forma: la portada no lleva listas ni barras de confianza, así
que `bento` muestra a lo sumo 3 datos y solo desde 993 px, y `rail` a lo sumo 3 filas; la foto
principal lleva `fetchpriority="high"` y nunca `loading="lazy"`; la foto de detalle de `overlap` no
compite por el LCP. Familias: `rail` → `type`, `bento` → `cells`, `overlap` → `media-text`, `stack`
→ `split-panel`; cada una entró en las preferencias Pro de dos arquetipos (editorial/minimal,
catalog/trust, soft, showcase).

**Portadas Pro libres** (`kit capacity --catalog extended`, 9 → 13 variantes):

| Giro        | Antes | Después | Pares Básico + Pro antes → después |
| ----------- | ----- | ------- | ---------------------------------- |
| barberia    | 5/9   | 9/13    | 5 → 9                              |
| clinica     | 6/9   | 10/13   | 6 → 10                             |
| dental      | 8/9   | 12/13   | 8 → 12                             |
| despacho    | 8/9   | 12/13   | 8 → 11                             |
| estetica    | 7/9   | 11/13   | 7 → 11                             |
| floreria    | 7/9   | 11/13   | 7 → 11                             |
| gimnasio    | 8/9   | 12/13   | 8 → 12                             |
| restaurante | 4/9   | 8/13    | 4 → 8                              |
| tienda      | 8/9   | 12/13   | 8 → 11                             |
| veterinaria | 8/9   | 12/13   | 8 → 12                             |

Meta (≥ 8 portadas Pro libres por giro): cumplida en los diez. El Total por giro no cambia (lo topan
las paletas para los Básicos).

**Agregar una portada:** carpeta `sections/hero/<nombre>/` (`section.html` con `data-lz-fit`,
`fetchpriority="high"` en la foto principal; `section.css` con el encaje `min(var(--lz-fit),
var(--lz-fit-max))`, título con tope en `svh`, texto primero bajo 992 y `max-height: 560px` sin
encaje; `meta.ts` con `tiers`, `intent`, `archetypes` y `sample`), familia en
`archetypes/families.ts`, preferencia en al menos un arquetipo, `pnpm lattiz kit probe hero/<nombre>`
hasta 16/16 y `kit:manifest`.

## Integración al compilador (A2 · WP4)

Todo opcional y aditivo; `specVersion` sigue en 1 y un spec sin `layout` compila exactamente igual
(`kit:verify-snapshot` idéntico). Campos nuevos (detalle y ejemplos en `docs/template-spec.md`):
`layout.direction`, `layout.archetype`, `layout.variantOverrides`, `layout.dials` y
`brand.primitives`, todos solo con `brand.catalog: "extended"`. Los presets de estilo siguen en
`brand.style.*` (desviación ya registrada en WP3 de la Parte 1: `brand.shape` y `brand.density`
existían con otro significado).

**Cómo elige el compilador con `layout`** (`src/spec/compile.ts › planSpec`):

1. **Dirección:** su `style` va debajo de `brand.style` (gana el spec); sus `primitives` debajo de
   `brand.primitives`; su Motion es el preset Pro salvo `motion.preset` o el dial de movimiento.
2. **Paleta y par:** primero las listas de la dirección (por giro si hay `byGiro`) rotadas con la
   semilla del id; si se agotan, el resto del pool **filtrado por las reglas de la dirección**
   (esquema claro/oscuro, acento neutro, display serif). La primera prueba mostró por qué: una Básica
   de `terracota-calida` cayó en una paleta oscura y la compuerta de la dirección la rechazó.
3. **Variantes por rol:** variante del spec > lock > `layout.variantOverrides` (fija) > la preferida
   del arquetipo (`archetypes/`, la primera que el blueprint permite) > la del giro. La portada usa
   primero las de la dirección (ordenadas por el dial de variación) y luego las del arquetipo; la
   unicidad entre Pro del giro sigue igual.
4. **Diales:** `density` → `style.density` (≤ 3 airy, 4–6 cozy, ≥ 7 compact) si el spec no lo fija;
   `motion` → preset (≤ 3 none, 4–5 calm, 6–7 editorial); `variance` ordena las portadas.
5. **Copy:** el `meta.sample` de cada variante elegida llena las claves que el giro no escribe (solo
   specs con `layout`; los specs `extended` existentes no cambian). `spec validate` lo cuenta igual.
6. **Lock:** guarda `layout { direction, archetype }` por tier (ausente en los demás specs).
7. **Compuerta:** `lattiz build` agrega las reglas de la dirección (`rule: "direction"`) a
   `kit:validate`; con un hallazgo no escribe nada.

**Arquetipos:** registro aparte (`archetypes/`), no entradas nuevas en los blueprints: el compilador
lo lee solo con `layout`, y `manifest.archetype` sigue siendo el arquetipo del blueprint
(`blueprintArchetype` del registro en Pro, `essential` en Básico).

**Rol `cta`:** opcional en Básico y Pro (`src/tiers.ts`, blueprints, `verticals` → slot `cta`),
**cuenta** como sección (`marquee` y `floating-whatsapp` siguen fuera). Los roles obligatorios y los
rangos (Básico 6–7, Pro 8–10) no cambian: en Básico, `cta` reemplaza a `about` para seguir en 7.

**Motion:** no hay `meta.motion`; el tipo sale de `SLOT_TYPES` del seed (sin tocarlo). Las variantes
nuevas usan el tipo de su slot (`hero` → hero, `cta` → cta), así que no necesitan corrección; si una
variante futura lo pide, el spec (`motion.overrides`) o la dirección escriben `manifest.motion.sections`.

**Texto genérico** (`spec validate --strict`, avisos): `muletilla` (aperturas y muletillas de IA del
reglamento §3), `rayas` (más de una raya por texto), `mayusculas` (sostenidas, o Títulos En
Mayúsculas), `esqueleto` (tres frases seguidas que arrancan igual, o cuatro de la página con el mismo
arranque de dos palabras). Las promesas siguen siendo error. En los specs de `main`: 0 avisos salvo
uno justo en `estetica-alheli` (cuatro frases que arrancan «manicura de…»).

**CLI:** `lattiz direccion list|show <id> [--json]`, `lattiz kit list [--slot s] [--json]`,
`lattiz giro show` con direcciones (menos usadas primero), arquetipos usados y portadas Pro libres,
`lattiz spec init|new --direccion <id>` y `lattiz check <id> --root <dir>` (revisa una prueba
construida con `lattiz build <spec> --out <dir>` sin tocar el kit). La skill `lattiz-template` tiene
el paso 2b (dirección y diversidad) y sus referencias actualizadas.

## Prueba de diversidad (A2 · WP6)

Los 20 specs de `packages/template-kit/specs/_kit-examples/` (dos por giro, cada par con otra dirección
y otro arquetipo) se construyeron como gemelas: 40 plantillas. Se hizo fuera del kit, en
`.lattiz/a2/diversity/<stem>/`, con `.lattiz/a2/diversity-build.mts`. Cada spec queda único contra las
plantillas del kit y contra el otro spec de su giro (`extraPeers`). Todo fue secuencial y reanudable;
nada entró a `templates/`.

**Resultados:**

- **`kit:validate`:** 40 de 40 sin hallazgos.
- **`lattiz review --root`:** 40 de 40. La opción `--root` es nueva en esta fase.
- **`lattiz check --root --lighthouse`**, ~38 s y ~2.0–2.6 GB de RSS pico por plantilla:
  - **FAIL: 5 de 40.** Las cinco son el mismo falso positivo `nojs` de `team/spotlight` (ver
    «Direcciones de arte»).
  - **LCP:** media 2.61 s, rango 1.72–3.09 s; 32 de 40 pasan de 2.5 s. Es la misma hoja de fuentes;
    son números de laboratorio en la vista previa local.
  - **HTML:** máximo 44.4 KiB en Básico y 63.5 KiB en Pro, dentro del presupuesto.
- **CLS > 0.1 en 3 Pro** (WARN `cwv`):
  - `estetica-atelier-musgo-v1`: 0.247 (Newsreader, `rail`);
  - `veterinaria-especialidad-roble-v1`: 0.159 (Red Hat Display, `panel`);
  - `tienda-mercado-ocre-v1`: 0.128 (Gloock, `stack`).

  En los tres, Lighthouse atribuye el desplazamiento a la foto de portada al cargar la fuente web: el
  titular, que va arriba de la foto, cambia de renglones entre el fallback métrico y la fuente. Las
  pruebas de dirección con el mismo par y el mismo titular corto dieron ≤ 0.002. No se arregla con el
  spec: va a A3, con dos opciones a medir:
  - reservar el alto del titular en esas portadas;
  - afinar el `size-adjust` de esos tres displays.

**Comparación visual** (`kit:compare-visual`, 82 plantillas: las 42 del kit y las 40 nuevas, por
giro). El par más parecido al pliegue que incluye al menos una plantilla nueva:

| Giro        | Distancia mínima | Similitud máxima | Par                                                                       |
| ----------- | ---------------- | ---------------- | ------------------------------------------------------------------------- |
| barberia    | 0.343            | 0.657            | `barberia-base-solar-v1` ~ `barberia-base-taller-recto-v1`                |
| clinica     | 0.355            | 0.645            | `clinica-base-brisa-norte-v1` ~ `clinica-brisa-norte-v1`                  |
| dental      | 0.363            | 0.637            | `dental-base-sonrisa-del-cerro-v1` ~ `dental-sonrisa-del-cerro-v1`        |
| despacho    | 0.434            | 0.566            | `despacho-base-cifra-clara-v1` ~ `despacho-base-mesura-v1`                |
| estetica    | 0.394            | 0.606            | `estetica-base-alheli-v1` ~ `estetica-atelier-musgo-v1`                   |
| floreria    | 0.375            | 0.625            | `floreria-flores-lupita-v1` ~ `floreria-patio-de-luna-v1`                 |
| gimnasio    | 0.406            | 0.594            | `gimnasio-nave-norte-v1` ~ `gimnasio-base-yunque-v1`                      |
| restaurante | 0.411            | 0.589            | `restaurante-base-ceniza-v1` ~ `restaurante-base-trompo-sur-v1`           |
| tienda      | 0.344            | 0.656            | `tienda-base-lote-doce-v1` ~ `tienda-papel-y-nudo-v1`                     |
| veterinaria | 0.346            | 0.654            | `veterinaria-clinica-nogal-v1` ~ `veterinaria-base-especialidad-roble-v1` |

Ninguna nueva queda bajo 0.33. Cinco pares **del kit** ya estaban por debajo antes de A2, y no se
tocan porque no se editan plantillas existentes:

- `clinica-base-alba` ~ `brote` 0.241, `alba` ~ `cauce` 0.251 y `brote` ~ `cauce` 0.232;
- `estetica-base-alheli` ~ `estudio-nacar` 0.199;
- `restaurante-base-casa-comal` ~ `ceniza` 0.310.

**Ajustes (1 ronda de 2 permitidas, solo specs):**

- `despacho-base-alcala-ibarra` y `despacho-base-mesura` daban 0.227: los dos claros, con
  `hero/columns` y serif. Con `overrides.basico.brand.palette.preset: "pal-petroleo-hueso"` en
  `despacho-alcala-ibarra`, el par más cercano del giro queda en 0.434 (`e25929f`).
- No hizo falta una segunda ronda.

**Defecto encontrado en la hoja (no de spec):** en `hero/rail`, la celda de la foto se estiraba con la
fila `1fr` y el marco `offset` dibujaba un bloque oscuro vacío bajo la foto. Ya estaba en las pruebas
de cantera y la crítica de WP2 no lo vio. Se arregló con `align-self: start` en la celda (`e35a13d`;
`kit probe hero/rail` 16/16, snapshot idéntico porque ninguna plantilla del kit usa `rail`).

**Crítica** (completa por plantilla en la hoja):

- Dentro de cada giro, las gemelas y los dos specs se separan bien.
- Entre giros se repite la firma de cada dirección, y los placeholders la acentúan:
  - jardín: pastel con arcos o panel punteado;
  - mármol y tinta: panel oscuro de dos tarjetas;
  - neón Pro: azul noche con franjas.
- Queda la deriva al gris en barbería × neón Básico (`pal-pizarra-plata`).

**Capacidad** (`kit capacity --catalog extended`): idéntica antes y después, porque los ejemplos no
entran al kit. Los totales son los de «Deriva al gris».

**Hoja:** `.lattiz/gallery/diversity.html` (capturas de `lattiz review`, elecciones, revisión,
distancia más cercana y crítica por plantilla) y `.lattiz/gallery/diversity.png` (miniaturas,
`kit:compare-visual --sheet`). Ninguna de las dos va en git. Para regenerarlas:

```bash
npx tsx .lattiz/a2/diversity-sheet.mts
```

## Hallazgos de la Parte 2

- **Snapshot tras el merge:** `main` trajo `restaurante-hoja-y-barro` en paralelo a la Parte 1; su
  acento Básico (~154°) ocupa el de «agave», así que el fixture sin lock `restaurante-la-lumbre` pasó
  a «talavera». Se creó `specs/restaurante-hoja-y-barro.lock.json` (reproduce sus 7 archivos) y se
  re-baseó el snapshot (`2060205`). Los tamaños gzip del snapshot cambian entre Linux y macOS (zlib);
  los hashes no, y `verify` no compara gzip.
- **`hero/split` legacy con copy largo** se pasa del encaje y deja el CTA bajo el pliegue a 1024 y
  1440 (lo mismo que la primera lectura de WP2 vio en la galería); `hero/offset-card` igual a 1024,
  1440 y 1366×768. No se tocó (extender, nunca mutar): backlog de WP9.
- **El copy de los giros trae `{{branch}}` crudo** (lo sustituye el compilador de specs); las
  herramientas que arman páginas desde un giro deben reemplazarlo (`composePage` lo hace).

## Verificación de la Parte 2 (2026-10-12, MacBook, Node 24.9)

- `pnpm lattiz kit probe` (16 variantes, Básico/Pro según `meta.tiers`, 3 temas, copy demo y largo):
  **156/156 casos sin FAIL**; con copy corto 78/78 después de dar `min-width: 44px` a la marca de
  `notice-bar` («Jo»). `gallery/bento` con 3 fotos reparte el ancho (`auto-fit`).
- `pnpm lattiz kit archetypes`: **16/16 páginas sin FAIL** (los WARN son de variantes legacy).
- `pnpm lattiz kit gallery --extended`: 225 capturas (`.lattiz/gallery/sections/<slot>.html`).
- `kit:verify-snapshot` idéntico después de cada familia (28 plantillas, 16 specs); `pnpm lint`,
  `pnpm typecheck`, `pnpm build` y los tests del kit (189) pasan.
- No se sembró, desplegó ni escribió nada remoto; tampoco se leyó Supabase (la Parte 2 no lo
  necesitó).
