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

## Cómo se usa (resumen)

```bash
pnpm lattiz spec init --giro floreria --nombre "Flores Lupita" --twin   # specs/floreria-flores-lupita.spec.json
# edita business, copy, marca y fotos en el spec
pnpm lattiz spec validate floreria-flores-lupita
pnpm lattiz build floreria-flores-lupita            # o --dry-run --diff primero
pnpm lattiz dev floreria-flores-lupita-v1           # y floreria-base-flores-lupita-v1
pnpm lattiz motion floreria-flores-lupita-v1
pnpm lattiz check floreria-flores-lupita-v1         # una a la vez
pnpm lattiz ship floreria-base-flores-lupita-v1 floreria-flores-lupita-v1
```

Atajo: `pnpm lattiz new --modo spec --twin --giro floreria --nombre "Flores Lupita"` (init + build).
Del lado del kit: `pnpm --filter @lattiz/template-kit kit:spec build|validate|schema|presets`.

Qué genera un spec (`<stem>` = `id` o `idBase`; los dos tiers de un par comparten el copy):

| Archivo                                        | Qué es                                                               |
| ---------------------------------------------- | -------------------------------------------------------------------- |
| `packages/template-kit/specs/<stem>.spec.json` | **la fuente** (lo único que se edita)                                |
| `templates/<id>.ts`                            | manifiesto (Básico: `props` con lo que difiere de la Pro)            |
| `themes/<id>.json`                             | tema propio de cada plantilla (nombre = id)                          |
| `content/<giro>.<nombre>.es-MX.ts`             | pack de copy compartido                                              |
| `demo-profiles/<id>.json`                      | perfil demo para `lattiz dev`/`check` (JSON-LD, «Abierto ahora»)     |
| `assets/<giro>/<id>/*.jpg` + `CREDITS.json`    | imágenes (placeholders, archivos o Pexels) y de dónde salió cada una |
| `dist/<id>/`                                   | lo de siempre (`kit:compile`), no se commitea                        |

Cada archivo generado empieza con
`GENERATED from specs/<stem>.spec.json (spec <hash>, file <hash>). Do not edit: use the spec, or freeze.`
(comentario en TS, clave `$lattiz` en JSON). El hash `file` es del **valor** (JSON canónico), no del
texto: pasar prettier no cuenta como edición.

## Referencia del spec (`specVersion: 1`)

Esquema: `packages/template-kit/src/spec/schema.ts` (zod); JSON Schema en
`packages/template-kit/specs/spec.schema.json` (`pnpm lattiz spec schema`). Los specs de `specs/`
traen `"$schema": "./spec.schema.json"` para autocompletar en el editor.

| Campo                   | Tipo                                                                              | Notas                                                                                                                                                                                                                                                                                   |
| ----------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `specVersion`           | `1`                                                                               | obligatorio                                                                                                                                                                                                                                                                             |
| `id` + `tier`           | id + `"pro"` \| `"basico"`                                                        | un solo tier                                                                                                                                                                                                                                                                            |
| `idBase` + `twin: true` | `<giro>-<nombre>`                                                                 | el par: `<giro>-<nombre>-v1` (Pro) y `<giro>-base-<nombre>-v1` (Básico)                                                                                                                                                                                                                 |
| `giro`                  | `restaurante` \| `clinica` \| `floreria` \| `barberia`                            | registro en `packages/template-kit/giros/`                                                                                                                                                                                                                                              |
| `name`, `description`   | texto                                                                             | nombre y descripción de la galería; por defecto el nombre del negocio y la descripción del giro                                                                                                                                                                                         |
| `business`              | objeto                                                                            | `name` (obligatorio), `shortName`, `tagline`, `city`, `branch` (colonia), `address`, `hours`, `phone`, `whatsapp` (dígitos), `whatsappMessage`, `email`, `year`, redes, `googleReviewsUrl`, `googleReviewUrl`, `branches[]` (`name`, `address`, `shortAddress?`, `hours`, `mapsQuery?`) |
| `brand.palette`         | `{ "preset": "<id>" }` \| `{ "custom": { "bg", "accent", "text?", "scheme?" } }`  | curada del giro, o propia: se derivan los 14 tokens con AA o se rechaza                                                                                                                                                                                                                 |
| `brand.fontPair`        | id curado \| `{ "display", "body" }`                                              | familias permitidas en `CUSTOM_FONTS` (todas con métricas para el fallback sin CLS)                                                                                                                                                                                                     |
| `brand.shape`           | `filete` \| `urbano` \| `sutil` \| `redondo` \| `suave` \| `organico` \| `brutal` | radios, borde, sombra, densidad y arquetipo Pro                                                                                                                                                                                                                                         |
| `brand.*` (ajuste fino) | `density`, `photoTreatment`, `placeholder`, `container`, `displayScale`, `rhythm` | `rhythm` = tokens del tema (`sectionPad`, `gutter*`, `space`, `textScale`, `title*`)                                                                                                                                                                                                    |
| `sections.pro/basico`   | `[{ "role", "variant?", "slot?" }]`                                               | en orden de página; sin `variant` elige el compilador (y puede cambiarla para cumplir unicidad/similitud); con `variant` queda fija                                                                                                                                                     |
| `copy`                  | `{ "<slot>": { claves del kit }, "head": { title, description } }`                | se fusiona sobre el copy del giro (objetos por clave, listas completas); `copy.hero.alternates[]` = titulares de repuesto                                                                                                                                                               |
| `images`                | `[{ "key", "source", "alt?", "orientation?" }]`                                   | `key`: `hero`, `about`, `team-1…4`, `gallery-01…08`; `source`: `"placeholder"`, `{ "pexels": "búsqueda" }` o `{ "file": "ruta" }`                                                                                                                                                       |
| `demoProfile`           | objeto (`business_profile`)                                                       | se fusiona sobre el que arma el compilador (categoría, horario, dirección)                                                                                                                                                                                                              |
| `motion` (solo Pro)     | `{ "preset", "progress?", "overrides?" }`                                         | `overrides` → `motion.sections` del manifiesto (slot, `#id` o índice → tipo o `{ type, pattern }`)                                                                                                                                                                                      |
| `overrides.pro/basico`  | `{ "name?", "description?", "brand?", "copy?" }`                                  | lo que cambia en un tier del par; la marca de la Básica sale de aquí o la elige el compilador                                                                                                                                                                                           |
| `todo`                  | lista de textos                                                                   | `spec validate` avisa mientras no esté vacía; no cambia la salida                                                                                                                                                                                                                       |

Reglas que conviene saber:

- **Copy y datos.** El copy usa las variables del kit (`{{name}}`, `{{shortName}}`, `{{city}}`,
  `{{phone}}`, `{{address}}`, `{{whatsappUrl:mensaje}}`, `{{index}}`) y `{{branch}}` (la colonia de
  `business.branch`, que el compilador reemplaza al generar). Menú, pie, sucursales y mapas se
  derivan de las secciones y de `business`; si pones `navbar.links`/`footer.links`, se filtran por las
  anclas de cada tier. **`{{lz:*}}` no se usa**: el kit no lo compila y en `templates.lattiz.app`
  quedaría vacío; pasar a esos tokens es decisión aparte (ver «Pendientes»).
- **Twin.** La Pro usa `brand` y `copy` tal cual; la Básica recibe su propia paleta, tipografía y
  forma (las siguientes libres del giro, o `overrides.basico.brand`), evita la portada de la Pro y
  toma un titular alternativo (o `overrides.basico.copy.hero.title`). Básico: sin Motion.
- **Errores.** `spec validate` y `build` dicen la ruta JSON y una sugerencia
  (`brand.palette.preset: la paleta "rosa" no existe para Florería → ¿"rosa-palo"? Opciones: …`).
  Faltantes de copy salen por variante: `copy.services.prices[2].name: falta (lo pide
services/editorial-table en Pro)`.

### Ejemplos

Los specs completos (copy entero, ~400 líneas) son los de `packages/template-kit/specs/`:
`restaurante-casa-comal`, `clinica-alba` y `floreria-flores-lupita`. Un spec mínimo es válido: todo
lo demás sale del giro.

```json
{
  "$schema": "./spec.schema.json",
  "specVersion": 1,
  "idBase": "restaurante-casa-comal",
  "twin": true,
  "giro": "restaurante",
  "business": {
    "name": "Casa Comal",
    "branch": "Santa María la Ribera",
    "address": "Jaime Torres Bodet 150, Santa María la Ribera, CDMX",
    "email": "reservas@casacomal.mx"
  },
  "brand": {
    "palette": { "preset": "terracota" },
    "fontPair": "young-serif+figtree",
    "shape": "suave"
  },
  "copy": {
    "hero": {
      "title": "Comida hecha con <span class=\"lz-title__serif\">tiempo</span>, para compartir."
    },
    "services": {
      "intro": "Precios en pesos mexicanos, IVA incluido. Pregunta por el platillo del día."
    }
  },
  "motion": { "preset": "calm" }
}
```

```json
{
  "specVersion": 1,
  "id": "clinica-dra-ruiz-v1",
  "tier": "pro",
  "giro": "clinica",
  "business": {
    "name": "Consultorio Dra. Ruiz",
    "shortName": "Dra. Ruiz",
    "branch": "Del Valle"
  },
  "brand": {
    "palette": { "custom": { "bg": "#F4F7F6", "accent": "#0F6E66" } },
    "fontPair": { "display": "Lora", "body": "Figtree" }
  },
  "sections": {
    "pro": [
      { "role": "header" },
      { "role": "hero", "variant": "split" },
      { "role": "about", "variant": "stats-strip" },
      { "role": "catalog" },
      { "role": "team" },
      { "role": "proof" },
      { "role": "testimonials" },
      { "role": "faq" },
      { "role": "contact" },
      { "role": "whatsapp" },
      { "role": "footer" }
    ]
  },
  "images": [
    {
      "key": "hero",
      "source": { "file": "fotos/alba-hero.jpg" },
      "alt": "Doctora atendiendo a un paciente"
    }
  ]
}
```

```json
{
  "specVersion": 1,
  "idBase": "floreria-flores-lupita",
  "twin": true,
  "giro": "floreria",
  "business": {
    "name": "Flores Lupita",
    "shortName": "Lupita",
    "branch": "Coyoacán"
  },
  "brand": {
    "palette": { "preset": "rosa-palo" },
    "fontPair": "cormorant-garamond+work-sans",
    "shape": "organico"
  },
  "overrides": {
    "basico": {
      "brand": { "palette": { "preset": "eucalipto" } },
      "copy": {
        "hero": {
          "title": "Ramos hechos a mano, <span class=\"lz-title__serif\">el mismo día</span>."
        }
      }
    }
  },
  "images": [
    { "key": "hero", "source": { "pexels": "ramo de flores papel kraft" } }
  ]
}
```

## Catálogo de giros

Sale de `packages/template-kit/giros/<giro>.ts` (`pnpm --filter @lattiz/template-kit kit:spec
presets` imprime paletas, contraste y tono del acento). Todas las paletas pasan los pares de contraste
de `kit:validate`; dentro de un giro los acentos están a ≥ 30° entre sí, así que caben al menos 4
plantillas por giro sin chocar. Barbería conserva sus 6 plantillas hechas a mano: sus temas son sus
primeras 6 paletas (todas ocupadas) y una barbería nueva cae en `petroleo`, `uva` u `hoja`.

No hizo falta ninguna variante de sección nueva: el menú del restaurante, las consultas de la clínica y
los arreglos de la florería son `services` (`price-list`, `cards`, `editorial-table`), y el resto de
roles existe tal cual. Los tres giros son rubros del kit con el mismo mapa rol → slot que barbería
(`blueprints/service-landing.shared.ts`). Los placeholders usan motivos del giro (platos y cubiertos;
cruz, estetoscopio y corazón; flores, hojas y macetas).

#### Barbería (`barberia`)

Categoría `barberias` · business_profile `barbershop` · schema.org `BarberShop` · Motion `editorial` + barra de progreso

- **Pro:** header→inline · hero→image-bg · marquee→ticker · about→text-image-offset · catalog→price-list · proof→grid · contact→with-contact · team→grid · testimonials→cards · faq→list · whatsapp→bubble · footer→big-wordmark
- **Básico:** header→inline · hero→centered-arch · about→brief · catalog→price-list · faq→list · contact→single · whatsapp→bubble · footer→columns
- **Paletas:** `oxido` (oscura, 13°), `norte-atelier` (clara, 150°), `concreto-brutal` (clara, 74°), `trazo-noche` (oscura, 338°), `trazo-papel` (clara, 226°), `trazo-solar` (clara, 262°), `petroleo` (oscura, 182°), `uva` (clara, 294°), `hoja` (oscura, 116°)
- **Tipografías:** `anton+space-grotesk`, `playfair-display+inter`, `archivo-black+space-grotesk`, `dm-serif-display+dm-sans`, `fraunces+nunito-sans`, `unbounded+manrope`, `bricolage-grotesque+inter`, `syne+karla`, `young-serif+figtree`
- **Formas:** `urbano`, `filete`, `brutal`, `sutil`, `suave`, `redondo`
- **Menú:** about «Nosotros», services «Servicios», team «Barberos», gallery «Trabajo», testimonials «Reseñas», faq «Preguntas», locations «Visítanos»

#### Clínica / consultorio (`clinica`)

Categoría `clinicas` · business_profile `medical` · schema.org `MedicalClinic` · Motion `calm`

- **Pro:** header→inline · hero→split · about→stats-strip · catalog→cards · team→grid · proof→strip · testimonials→cards · faq→two-col · contact→with-contact · whatsapp→bubble · footer→columns
- **Básico:** header→inline · hero→centered-arch · about→brief · catalog→cards · faq→list · contact→single · whatsapp→bubble · footer→minimal-centered
- **Paletas:** `salvia` (clara, 167°), `cielo` (clara, 210°), `lavanda` (clara, 252°), `arena` (clara, 12°), `medianoche` (oscura, 47°)
- **Tipografías:** `libre-baskerville+source-sans-3`, `sora+inter`, `lora+figtree`, `fraunces+nunito-sans`, `instrument-serif+instrument-sans`
- **Formas:** `suave`, `redondo`, `organico`, `sutil`, `filete`
- **Menú:** about «Nosotros», services «Servicios», team «Especialistas», gallery «Instalaciones», testimonials «Opiniones», faq «Preguntas», locations «Citas»

#### Florería (`floreria`)

Categoría `florerias` · business_profile `store` · schema.org `Florist` · Motion `editorial`

- **Pro:** header→centered-logo · hero→offset-card · marquee→ticker · about→statement · catalog→cards · proof→mosaic · team→grid · testimonials→quote-feature · faq→list · contact→with-contact · whatsapp→bubble · footer→minimal-centered
- **Básico:** header→inline · hero→split · about→brief · catalog→price-list · faq→two-col · contact→single · whatsapp→bubble · footer→columns
- **Paletas:** `rosa-palo` (clara, 340°), `eucalipto` (clara, 132°), `cempasuchil` (clara, 35°), `bugambilia` (oscura, 292°), `lavanda` (clara, 261°)
- **Tipografías:** `cormorant-garamond+work-sans`, `instrument-serif+instrument-sans`, `bodoni-moda+karla`, `fraunces+nunito-sans`, `lora+figtree`
- **Formas:** `organico`, `filete`, `suave`, `sutil`, `redondo`
- **Menú:** about «Nosotros», services «Arreglos», team «Floristas», gallery «Galería», testimonials «Reseñas», faq «Preguntas», locations «Pedidos»

#### Restaurante (`restaurante`)

Categoría `restaurantes` · business_profile `restaurant` · schema.org `Restaurant` · Motion `calm`

- **Pro:** header→centered-logo · hero→split · marquee→ticker · about→text-image-offset · catalog→editorial-table · proof→mosaic · team→list · testimonials→quote-feature · faq→two-col · contact→with-contact · whatsapp→bubble · footer→big-wordmark
- **Básico:** header→inline · hero→centered-arch · about→brief · catalog→price-list · faq→list · contact→single · whatsapp→bubble · footer→columns
- **Paletas:** `terracota` (clara, 10°), `nocturno` (oscura, 42°), `olivo` (clara, 82°), `talavera` (clara, 219°), `agave` (oscura, 149°), `jamaica` (oscura, 338°)
- **Tipografías:** `young-serif+figtree`, `bricolage-grotesque+inter`, `cormorant-garamond+work-sans`, `dm-serif-display+dm-sans`, `playfair-display+inter`
- **Formas:** `suave`, `filete`, `sutil`, `redondo`, `organico`, `brutal`
- **Menú:** about «Nosotros», services «Menú», team «Cocina», gallery «Platillos», testimonials «Reseñas», faq «Preguntas», locations «Reservar»

Pares tipográficos (`src/spec/presets.ts › FONT_PAIRS`):

- `anton+space-grotesk` — Anton + Space Grotesk (condensada en mayúsculas)
- `playfair-display+inter` — Playfair Display + Inter (editorial)
- `archivo-black+space-grotesk` — Archivo Black + Space Grotesk + Space Mono (brutalista)
- `dm-serif-display+dm-sans` — DM Serif Display + DM Sans (serif clásica)
- `fraunces+nunito-sans` — Fraunces + Nunito Sans (serif cálida)
- `unbounded+manrope` — Unbounded + Manrope (geométrica ancha)
- `cormorant-garamond+work-sans` — Cormorant Garamond + Work Sans (serif fina, elegante)
- `libre-baskerville+source-sans-3` — Libre Baskerville + Source Sans 3 (serif de confianza)
- `lora+figtree` — Lora + Figtree (serif amable)
- `sora+inter` — Sora + Inter (sans moderna)
- `bricolage-grotesque+inter` — Bricolage Grotesque + Inter (grotesca con carácter)
- `young-serif+figtree` — Young Serif + Figtree (bistró)
- `instrument-serif+instrument-sans` — Instrument Serif + Instrument Sans (editorial ligera)
- `bodoni-moda+karla` — Bodoni Moda + Karla (alto contraste)
- `syne+karla` — Syne + Karla (display ancha)

Formas (`SHAPES`):

- `filete` — Filetes de 1px, sin radios ni sombras (editorial) (radio 0px/0px, borde 1px, sombra none, densidad airy, arquetipo Pro editorial-atelier)
- `urbano` — Esquinas casi rectas, bordes finos (urbano) (radio 2px/2px, borde 1px, sombra none, densidad regular, arquetipo Pro street-luxe)
- `sutil` — Radios pequeños, sin sombras (radio 4px/4px, borde 1px, sombra none, densidad regular, arquetipo Pro editorial-atelier)
- `redondo` — Tarjetas redondeadas con borde de 2px y sombra suave (radio 12px/12px, borde 2px, sombra soft, densidad regular, arquetipo Pro editorial-atelier)
- `suave` — Tarjetas suaves y botones píldora (radio 14px/999px, borde 1px, sombra soft, densidad regular, arquetipo Pro editorial-atelier)
- `organico` — Radios amplios y botones píldora, sin sombras (radio 24px/999px, borde 1px, sombra none, densidad airy, arquetipo Pro editorial-atelier)
- `brutal` — Bordes de 3px y sombras desplazadas duras (neo-brutal) (radio 0px/0px, borde 3px, sombra hard-offset, densidad compact, arquetipo Pro neo-brutal)

## Cómo se garantiza la unicidad

Antes de compilar, `planSpec` (`src/spec/compile.ts`) compara cada tier contra **todas** las
plantillas del giro (las del repo, menos las que este spec genera, más la gemela ya resuelta):

1. **Paleta**: tono del acento a ≥ 30° de cualquier otra plantilla del giro (regla `accent-hue`).
2. **Tipografía**: `fontPair` que nadie use en el giro (`unique-font-pair`).
3. **Tema**: cada plantilla tiene el suyo (`themes/<id>.json`), así que `unique-theme` y
   `theme-ownership` se cumplen solos.
4. **Portada**: variante de hero libre entre las Pro del giro (`unique-hero`); la Básica de un par
   evita la de su Pro.
5. **Titular**: normalizado distinto de los del giro (`unique-headline`): el del spec, luego
   `copy.hero.alternates`, luego los alternos del giro.
6. **Similitud**: si pasa el límite del tier (Pro 0.5, Básico 0.85), cambia variantes **no fijadas**
   (servicios, about, pie, navbar, equipo, reseñas, galería, FAQ) hasta cumplir.

Lo que el spec fija explícitamente se respeta: si choca, una paleta o tipografía curada se cambia por
la siguiente libre (y el build lo dice: `paleta: "rosa-palo" choca con otra plantilla del giro; usé
"lavanda"`); una paleta propia, una portada fija en Pro o un titular imposible fallan con sugerencias.
La elección es determinista (sembrada con el id): mismo spec + mismo kit = mismos bytes. Al final el
build compila y corre `kit:validate` completo en una carpeta temporal; si hay un hallazgo no escribe
nada (`--force` escribe de todos modos y lo avisa en grande).

Fuera de `kit:validate` queda `kit:compare-visual` (distancia ≥ 0.33 en la mitad superior): corre
`pnpm --filter @lattiz/template-kit kit:compare-visual dist/<id>…` y mira el contact sheet.

## Dónde ajustar (de lo amplio a lo puntual)

1. **El spec** — copy, datos, paleta, tipografía, forma, variantes de sección, `motion.overrides`.
2. **Tokens del tema desde el spec** — `brand.rhythm` (`sectionPad`, `gutter*`, `space`,
   `textScale`, `titleHero*`, `titleSection*`, `titleSub`), `brand.displayScale`, `brand.density`,
   `brand.container`. Terminan en `themes/<id>.json › rhythm`, que es único por plantilla.
3. **Una variante de sección nueva** — si la forma de una sección no sirve, se agrega
   `sections/<slot>/<variante>/` (compartida, con Motion v3 y tokens de encaje); nunca se edita una
   compartida para una sola plantilla.
4. **Congelar** — `pnpm lattiz freeze <id>`: los archivos generados pasan a ser de mano; el build
   ya no los toca y enseña el diff contra el spec. `pnpm lattiz unfreeze <id>` (con confirmación) los
   devuelve al spec y se pierden las ediciones.

**`overrides.css` no existe a propósito** (decisión `template-rhythm-tokens`): rompería el
validador y la similitud entre plantillas. Lo que haría un override va en el paso 2 o en el 3.

## Imágenes y créditos

- `--images placeholder` (por defecto): placeholders con la paleta, el patrón y motivos del giro.
  Son deterministas y se regeneran si cambia el tema.
- `{ "file": "ruta" }` en `images`: se recorta al tamaño de la variante (sharp, `cover`) y se copia.
- `--images pexels`: para cada imagen que usan las secciones busca en Pexels (la consulta del spec o
  la del giro, con la orientación de la variante), toma la primera foto no usada en la plantilla, la
  recorta y la guarda en `assets/<giro>/<id>/`. Lee `PEXELS_API_KEY` de la terminal, `.env` o
  `apps/api/.env` (donde ya la tiene el proxy de stock de la API); nunca la imprime. Respeta el límite
  (200/hora, pausa entre llamadas, se detiene en 429) y guarda búsquedas y descargas en
  `.lattiz/cache/pexels/` (no se commitea). Después, el seed convierte a WebP ≤ 2000 px como siempre.
- `--images none`: no toca imágenes.
- `assets/<giro>/<id>/CREDITS.json` registra cada imagen (`placeholder`, `file` o `pexels` con
  fotógrafo, URL de la foto y búsqueda) y su hash. Una foto que alguien puso a mano (hash distinto)
  **nunca** se sobrescribe; una de Pexels se conserva en builds posteriores sin `--images pexels`.
  `lattiz check` lista los créditos como INFO.
- **Decisión pendiente (Santi):** si y dónde mostrar los créditos de Pexels en el sitio publicado. La
  licencia de Pexels no exige atribución, pero la agradece; hoy solo quedan en `CREDITS.json`.

## Ciclo de venta con spec

1. `pnpm lattiz doctor`.
2. `pnpm lattiz spec init --giro <giro> --nombre "<negocio>" --twin` → `specs/<giro>-<nombre>.spec.json`.
3. Edita el spec: `business` (dirección, colonia, horario, teléfono, WhatsApp), el copy (precios,
   equipo, reseñas, preguntas), la marca y las fotos; vacía `todo`. `pnpm lattiz spec validate <stem>`.
4. `pnpm lattiz build <stem>` (`--dry-run --diff` para ver antes; `--images pexels` para fotos).
5. `pnpm lattiz dev <id>` para cada una (7 tamaños, Motion solo en Pro).
6. `pnpm lattiz motion <idPro>` y, si hace falta, `motion.overrides` en el spec + `build`.
7. `pnpm lattiz check <id>` para cada una, **una a la vez** (~25–40 s, ~1 GiB), hasta que no haya FAIL.
8. `pnpm lattiz ship <idBásico> <idPro>`; comparte `https://templates.lattiz.app/<id>`.
9. Commitea el spec y los archivos generados (`templates/`, `themes/`, `content/`, `demo-profiles/`,
   `assets/<giro>/<id>/`) y `apps/template-previews/public/<id>/index.html`.

## Contrato para la skill de Claude Code (Fase 4)

Todo sin preguntas y con códigos de salida estables: **0** ok · **1** falló una verificación
(validación, unicidad, archivo editado a mano o congelado, FAIL en `check`) · **2** uso o datos
(spec inválido, falta un flag, falta una variable). En error, stdout queda vacío y el mensaje va a
stderr.

| Paso                    | Comando                                                                                                 | Salida                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Esquema (una vez)       | `pnpm lattiz spec schema`                                                                               | JSON Schema del spec                                                                                                                             |
| Crear y compilar        | `pnpm lattiz new --spec <archivo> --yes --json` (si el archivo no existe, con `--giro --nombre --twin`) | `{ spec, build: BuildReport }`                                                                                                                   |
| Validar un spec editado | `pnpm lattiz spec validate <archivo\|id> --json`                                                        | `{ file, ok, ids, problems[] }` (cada problema: `level`, `path`, `message`, `hint?`)                                                             |
| Recompilar              | `pnpm lattiz build <archivo\|id> --json`                                                                | `BuildReport`: `ok`, `code`, `ids`, `tiers[]` (`choices`, `findings`, `similarity`, `images`), `files[]` (`action`, `diff?`), `problems[]`, `ms` |
| Revisar                 | `pnpm lattiz check <id> --json` (secuencial)                                                            | resultado por regla y tamaño; código 1 si hay FAIL                                                                                               |
| Estado                  | `pnpm lattiz list --offline --json`                                                                     | filas con `origin` (generated/frozen/clone/manual, `drift[]`) + `unbuilt`                                                                        |
| Publicar                | `pnpm lattiz ship <idBásico> <idPro> --yes` **solo con aprobación humana**                              | pasos y URLs                                                                                                                                     |

Secuencia segura: `new --spec … --yes --json` → bucle { editar spec → `build --json` → `check <id>
--json` por id } hasta que ninguno tenga FAIL → aprobación humana (dev/capturas) → `ship --yes`. La
skill nunca usa `--force` ni `unfreeze --yes` sin que el humano lo pida, y nunca edita los archivos
generados: edita el spec.

## Pendientes y decisiones abiertas

- Créditos de Pexels en el sitio (arriba).
- `{{lz:*}}` en las plantillas: el copy generado usa datos de demostración en `business`; pasar a
  tokens de `business_profile` exige que el kit los compile (hoy fallan) y decidir qué se ve en
  `templates.lattiz.app` sin perfil.
- Giros de `bases.json` sin registro (despacho, estética, tienda, otro) siguen por clonación.
- `categories` nuevas (`restaurantes`, `clinicas`, `florerias`) llegan a la galería con el seed;
  revisa que el dashboard las muestre bien antes de publicarlas.

## Verificación (2026-10-11, local)

- **Reproducción:** `pnpm lattiz build packages/template-kit/fixtures/spec/barberia-norte-v1.spec.json --out <tmp>`
  da `index.html`, `.grapesjs`, `template.meta.json` y los 14 assets **idénticos byte a byte** a los de
  `barberia-norte-v1` hecha a mano. Solo cambian los nombres en `manifest.json` (tema y pack con el
  nombre del spec, etiqueta del tema). El spec vive en `fixtures/` para que ningún build toque la Norte
  real.
- **Gemelas** (`restaurante-casa-comal`, `clinica-alba`, `floreria-flores-lupita`, placeholders):
  `kit:validate` sin hallazgos (las 12 plantillas del kit), `lattiz check` sin FAIL en las 6 (WARN:
  texto < 14 px y objetivos táctiles < 44 px, los mismos que las barberías), `kit:compare-visual` pasa
  (par más cercano: clínica 0.387).
- **Determinismo:** dos builds del mismo spec → mismos bytes (fuentes, placeholders y `dist/`); un
  rebuild sin cambios reporta «sin cambios» en todo.
- **Deriva y congelado:** editar a mano un tema generado detiene el build (código 1, diff); reformatear
  no; `freeze` → el build se niega con diff; `unfreeze` pide `--yes`; después el build regenera.
- **Tiempos:** `build` de una gemela ≈ 4.7 s (incluye `kit:compile` de las dos); `--dry-run` ≈ 2 s;
  `check` ≈ 24–27 s y ~0.9–1.1 GiB por plantilla.
- **No verificado:** `--images pexels` (la clave de `apps/api/.env` responde 401), seed y deploy.
