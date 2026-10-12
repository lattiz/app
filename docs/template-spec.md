# Plantillas desde un spec (`template.spec.json`)

Fase 2 del CLI de plantillas: un solo archivo describe el negocio (giro, tier, marca, secciones,
copy es-MX, fotos, perfil demo, Motion) y el compilador genera el manifiesto, el tema, el pack de
copy y el perfil demo con el kit actual, únicos por construcción. Guía del CLI:
`docs/lattiz-cli.md`.

## Descubrimiento (qué hay en el kit, sacado del código)

Revisado el 2026-10-11 sobre `main` (`e8d278c` + arreglos de la revisión de la Fase 1). Si algo de
aquí ya no coincide, manda el código.

### Manifiesto (`packages/template-kit/templates/<id>.ts`)

Tipo `Manifest` en `src/types.ts`; un módulo TS con `export default {…} satisfies Manifest`:

| Campo                 | Qué es                                                                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                  | `^[a-z0-9-]{3,60}$` en el kit; el CLI exige `^[a-z0-9]+(-[a-z0-9]+)*$`, máx. 60                                                                      |
| `name`, `description` | nombre comercial y descripción de la galería (los usa el seed)                                                                                       |
| `category`            | categoría de la galería, en plural (`barberias`)                                                                                                     |
| `family`              | blueprint (`service-landing`, el único)                                                                                                              |
| `tier`                | `basic` \| `pro`                                                                                                                                     |
| `vertical`            | rubro; resuelve roles a slots y agrupa las reglas de unicidad                                                                                        |
| `archetype`           | uno de `blueprints/<family>.<tier>.ts › archetypes` (Basic: `essential`; Pro: `street-luxe`, `editorial-atelier`, `neo-brutal`)                      |
| `theme`               | nombre de `themes/<tema>.json`                                                                                                                       |
| `content`             | pack de copy `content/<rubro>.<voz>.es-MX` sin extensión                                                                                             |
| `business?`, `head?`  | sobrescriben campos del pack (`Business`, `{ title, description }`)                                                                                  |
| `sections[]`          | `{ slot, variant, props? }` en orden; `props` es un merge superficial sobre `pack.sections[slot]`                                                    |
| `motion?`             | `{ preset?: calm\|editorial\|none, sections?: { <slot>\|#id\|<índice>: tipo \| { type, pattern } }, progress?: boolean }`; va a `template.meta.json` |

### Tema (`themes/<nombre>.json`)

`Theme` en `src/types.ts`, validado por `parseTheme` (`src/lib/load.ts`); es la única fuente de
tokens `--lz-*` (`src/lib/theme.ts › themeVariables`):

- `name` (= nombre del archivo), `label`, `tier` (un tema Pro solo sirve a plantillas Pro y
  viceversa), `fontPair` (id del par, único por rubro), `container`.
- `colors`: 14 tokens obligatorios — `bg surface surface-2 text muted accent on-accent accent-text
line line-strong overlay on-overlay navbar-bg ink` (hex o `color-mix()`/`var()` sobre otros tokens).
- `fonts`: `display`, `serif` (palabras de acento `.lz-title__serif`), `body`, `mono?`,
  `googleFonts` (query css2), `displayTransform` (`uppercase|none`), `displayLeading`,
  `displayWeight`, `displayScale?`, `accentStyle` (`italic|normal`), `accentTransform`
  (`lowercase|none`). Cada familia con métricas en `@capsizecss/metrics` recibe un fallback local
  medido (CLS ≈ 0); `CAPS_SIZE_ADJUST` solo calibra Anton y Archivo Black para mayúsculas.
- `shape`: `radiusCard` (≤ 32 px), `radiusPill`, `border`, `shadow` (`none|soft|hard-offset`).
- `density` (`airy|regular|compact` → `--lz-section-pad` y `--lz-stack`), `photoTreatment`
  (`none|duotone|grayscale|warm`), `placeholder` (`grain|rules|stripes|blobs|arches|dots`),
  `accentWords` (`color|highlight`), `effects` (`mapFilter`, `heroImageFilter`).
- `rhythm?` (opcional): `sectionPad gutter gutterMd gutterSm space textScale titleHero titleHeroSm
titleSection titleSectionSm titleSub`; los valores por defecto son los literales originales.

### Pack de copy (`content/<rubro>.<voz>.es-MX.ts`)

`ContentPack = { vertical, locale, business, head, sections }`. `business` tiene 16 campos
(`name shortName tagline city phone whatsapp whatsappMessage address year instagramUrl tiktokUrl
facebookUrl email googleReviewsUrl googleReviewUrl`); en el copy se usan como `{{name}}`,
`{{address}}`, `{{whatsappUrl:mensaje}}`, `{{phoneUrl}}`, `{{emailUrl}}`, `{{index}}` (secciones
numeradas). `sections` es un objeto por slot con las claves de su variante. Los packs de barbería usan
helpers de `content/barberia.shared.ts` (`branchCards`, `footerBranches`, `galleryItems`) y
`singleBranch` de `barberia.trazo.es-MX.ts` para las Basic.

**`{{lz:*}}` no existe en el kit.** `interpolate` (`src/lib/content.ts`) trata `{{lz:phone}}` como la
variable desconocida `lz` y la compilación falla. Esos tokens los reemplaza tenant-sites al servir
con el `business_profile` del cliente; en `templates.lattiz.app` no hay perfil y quedarían vacíos.
Por eso el copy del spec usa las variables del kit (`{{name}}`, `{{phone}}`, `{{address}}`,
`{{city}}`), que salen de `business` del spec.

### Blueprints, tiers y roles

`src/tiers.ts` manda: secciones contadas = todos los slots menos `floating-whatsapp` y `marquee`.

| Tier  | Contadas | Roles obligatorios                                                                | Opcionales    | Similitud máx. |
| ----- | -------- | --------------------------------------------------------------------------------- | ------------- | -------------- |
| Basic | 6–7      | header, hero, catalog, contact, faq, footer, whatsapp                             | about         | 0.85           |
| Pro   | 8–10     | header, hero, about, catalog, proof, testimonials, faq, contact, footer, whatsapp | team, marquee | 0.5            |

`blueprints/service-landing.{basic,pro}.ts` restringen variantes por rol: Basic `about: brief`,
`contact: single`; Pro `about: text-image-offset|statement|stats-strip`, `contact: with-contact`.
`blueprints/service-landing.shared.ts › verticals` resuelve rol → slot por rubro (barbería: header
navbar, hero hero, marquee marquee, about about, catalog services, proof gallery, team team,
testimonials testimonials, faq faq, contact locations, whatsapp floating-whatsapp, footer footer) y
fija el `schemaType` (`BarberShop`). El compilador rechaza (antes de validar) slots repetidos, slots sin
rol, regiones fuera de orden (`header` → `main` → `footer`), `hero` que no es el primero de `<main>`,
`floating-whatsapp` que no es el último y variantes no permitidas.

### Reglas de `kit:validate` (`src/lib/validate.ts`)

Por sección y página: literales de color fuera de `:root` (solo `#25D366`), `style=""`, reglas
`#id`, imágenes no locales, `alt`, `data-lz-slot` + `data-lz-variant`, clases `lz-*` (sin Tailwind),
sin JS, un solo `<h1>`, `prefers-reduced-motion` para toda animación/transición, breakpoints solo 992
y 480, anclas internas que resuelven, sin `<form>`, encabezados sin saltos, `<img>` con
`width`/`height`, enlaces con href y nombre accesible, `<html lang>` + `<title>` + meta
description, FAQ con `<details open><summary>`, proyecto `web` de una página.

Tema: `radiusCard` ≤ 32 px y contraste AA de pares de tokens — 4.5:1 para `text/bg`,
`text/surface`, `text/surface-2`, `muted/bg`, `muted/surface`, `on-accent/accent`,
`on-overlay/overlay`, `text/navbar-bg`; con `accentWords: color`, 3:1 para `accent-text` sobre
`bg`, `surface` y `overlay`; con `highlight`, 4.5:1 para `accent-text/accent`. Superficies
translúcidas se componen sobre `bg`.

Tier: tema del mismo tier (`theme-ownership`), rango de secciones contadas, roles obligatorios,
`floating-whatsapp` con enlace `wa.me`.

Unicidad **dentro del rubro** (`vertical`, cualquier tier): tema único, `fontPair` único, titular del
hero único (normalizado: minúsculas, sin acentos ni etiquetas), tono del acento a ≥ 30° de cualquier
otra plantilla (los acentos casi grises no cuentan) y, entre Pro, variante de hero única.

Similitud (`src/lib/similarity.ts`) contra plantillas del **mismo rubro y tier**: Jaccard de pares
slot:variante 0.25 + orden (LCS) 0.05 + misma variante de hero 0.15 + de servicios 0.10 + mismo tema
0.15 + mismo par tipográfico 0.15 + misma forma (radios, borde, sombra) 0.15.

Fuera de `kit:validate`: `kit:compare-visual` (distancia de la mitad superior ≥ 0.33 contra el rubro,
decisión `template-distinctness-gate`) y `kit:shots`/`lattiz check` (overflow, texto, táctiles,
encaje `data-lz-fit`). `lattiz check` no corre `compare-visual`.

### Catálogo de secciones (`sections/<slot>/<variante>/`)

`section.html` (fragmento con `data-lz-key|attr-*|if|each`), `section.css`, `meta.ts`
(`contentKeys`). Anclas fijas por slot: `#nosotros`, `#servicios`, `#equipo`, `#galeria`, `#resenas`,
`#preguntas`, `#sucursales` (Pro) / `#ubicacion` (Basic).

| Slot (rol)                  | Variantes (tier)                                                                | Claves de copy                                                                                                                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| navbar (header)             | `inline`, `centered-logo` (ambos)                                               | `cta`, `links[].label/href`                                                                                                                                                                           |
| hero (hero)                 | `image-bg`, `split` (con `data-lz-fit`), `centered-arch`, `offset-card` (ambos) | `image`, `imageAlt`, `eyebrow`, `title`, `text`, `primaryCta`, `secondaryCta`, `secondaryHref`, `sticker?`                                                                                            |
| marquee (marquee)           | `ticker` (Pro)                                                                  | `label`, `items[]`                                                                                                                                                                                    |
| about (about)               | `brief` (Basic); `text-image-offset`, `statement`, `stats-strip` (Pro)          | brief/stats-strip: `kicker title summary stats[]`; statement: `kicker statement image imageAlt paragraphs[]`; text-image-offset: `kicker image imageAlt sticker? title paragraphs[] stats[]`          |
| services (catalog)          | `price-list`, `cards`, `editorial-table` (ambos)                                | `kicker title intro? prices[].name/price/description promos[].tag?/title/text?/cta/href`                                                                                                              |
| gallery (proof)             | `grid`, `mosaic`, `strip` (Pro)                                                 | `kicker title items[].image/alt/caption` (8 fotos)                                                                                                                                                    |
| team (team)                 | `grid`, `list` (Pro)                                                            | `kicker title members[].name/role/tags[]/image/imageAlt` (4)                                                                                                                                          |
| testimonials (testimonials) | `cards`, `quote-feature` (Pro)                                                  | `kicker score summary allReviewsCta writeReviewCta? reviews[].text/author`                                                                                                                            |
| faq (faq)                   | `list`, `two-col` (ambos)                                                       | `kicker title intro? cta? items[].question/answer`                                                                                                                                                    |
| locations (contact)         | `single` (Basic), `with-contact` (Pro), `cards` (ninguno de los dos blueprints) | single: `kicker title branch{…} hoursLabel whatsappCta callCta directionsLabel`; with-contact: `kicker title contactText whatsappLabel whatsappValue callLabel emailLabel directionsLabel branches[]` |
| floating-whatsapp           | `bubble` (ambos, obligatorio)                                                   | `label`                                                                                                                                                                                               |
| footer (footer)             | `big-wordmark`, `columns`, `minimal-centered` (ambos)                           | `about branchesTitle? branches[] linksTitle? links[] contactTitle?`                                                                                                                                   |

### Imágenes

Referencias relativas en el copy (`hero.jpg`, `about.jpg`, `team-1.jpg`…`team-4.jpg`,
`gallery-01.jpg`…`gallery-08.jpg`) que el compilador apunta a `assets/<rubro>/<tema>/`. Si el archivo
no existe genera un placeholder JPEG con la paleta y el patrón del tema y un motivo **de barbería**
(tijeras, peine, navaja, poste; `src/lib/placeholders.ts`) y lo deja en esa carpeta (se commitea).
`dist/<id>/assets/` recibe la copia; el seed las sube a R2 como WebP ≤ 2000 px. No hay registro de
créditos.

### Compilador (`src/lib/compile.ts`)

`compileManifest(manifest)`: carga blueprint, tema y pack **por nombre desde las carpetas del kit**,
verifica el blueprint, renderiza cada sección con su copy (`renderSection`), resuelve imágenes
(generando placeholders), compone `<head>` (título, descripción, Google Fonts) y la página, arma el
CSS (`:root` del tema + `core.css` + CSS de cada sección), lo pasa por GrapesJS headless y devuelve
proyecto, HTML del editor y preview. `writeCompiled` escribe `dist/<id>/` (`<id>.grapesjs`,
`index.html`, `manifest.json` con la instantánea, `template.meta.json`, `assets/`). La compilación es
determinista (desde `e10c73e` también el `.grapesjs`).

### Lattiz Motion

Las secciones del kit **no** llevan `data-lz-section`: el seed (`scripts/lib/motion-sections.ts`) las
clasifica por slot (services → `cards`, gallery → `gallery`…) y aplica `manifest.motion.sections`. El
runtime solo se inyecta en sitios Pro. Para el spec, «tags de Motion» = `motion` del manifiesto Pro.

### Perfil demo

`lattiz dev`/`check` leen `packages/template-kit/demo-profiles/<id>.json` (forma de
`business_profile`: `name category phone whatsapp email address{street city region postalCode
country} hours{mon…sun:[{open,close}]} timezone priceRange social`) si existe; la carpeta no existía.
`category` es el enum de la API: `restaurant medical dental legal accounting beauty_salon barbershop
store other` (no hay florería: `store`).

### `lattiz new` (Fase 1)

Clona el manifiesto base de `packages/lattiz-cli/bases.json` como texto: reescribe id, nombre,
categoría, descripción, nombre del negocio y `motion` (Pro), compila y valida. Mantiene tema, copy y
rubro de la base, así que `kit:validate` falla para el clon y para el resto del rubro.

### Qué faltaba para un flujo desde spec

1. Rubros fuera de barbería: no hay mapa rol → slot ni `schemaType` para restaurante, clínica o
   florería en `verticals`, ni copy, paletas o fuentes curadas por giro.
2. Un esquema del spec con errores legibles y su JSON Schema.
3. Paletas y pares tipográficos curados con contraste verificado, y derivación AA para colores propios.
4. Elegir tema, par, titular y variantes sin chocar con el rubro (hoy lo hace una persona a mano).
5. Compilar sin escribir en el kit hasta validar: `compileManifest` lee tema y pack del disco y genera
   placeholders dentro de `assets/`.
6. Placeholders con motivos del giro (hoy siempre barbería).
7. Marcas de archivo generado, detección de ediciones a mano y congelado.
8. Fotos de Pexels con caché, créditos y rutas del kit.
9. Perfiles demo (`demo-profiles/`).
