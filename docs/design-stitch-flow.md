# Flujo de diseño con Google Stitch

Stitch alimenta el **paso de diseño** del kit, no el de publicación. Genera candidatos de diseño, se
guardan como datos en `design-library/stitch/`, un _harvester_ extrae paleta, tipografía y patrones de
sección, y solo lo que pasa las compuertas del kit entra al catálogo `extended`. El HTML de Stitch
**nunca** se sirve ni se importa a un tenant.

Principio: extender, nunca mutar. Las plantillas existentes compilan byte por byte igual y nada de esto
toca la publicación (`apps/tenant-sites`, Motion, seed, API, validadores, rangos).

## Qué es y qué no es

| Es                                                                                       | No es                                                                |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Un sistema de diseño de Stitch generado desde nuestras direcciones de arte               | Ingerir el HTML de Stitch para servirlo (Modelo A, descartado)       |
| Una biblioteca versionada de candidatos con una bandera de estado                        | Bloques arrastrables del editor GrapesJS                             |
| Borradores (paleta, par tipográfico, sección) que el compilador inserta desde el spec    | Importar imágenes de Stitch como activos                             |
| Compuertas A2: AA, distancia entre paletas, contrato de variantes, `kit probe`, snapshot | Promoción automática: la decide una persona (o la skill, a petición) |

Por qué se descartó el Modelo A: Tailwind por CDN, JS suelto, imágenes sin rehospedar; rompe LCP, sin-JS,
presupuestos, snapshot y CMS.

## Licencia

Santi confirmó en el foro oficial de Stitch (respuesta de una persona de Google, abr-2026) que los
diseños generados pueden usarse comercialmente. Cada `candidate.json` lleva `license_ref` apuntando a
esta sección. **Pendiente:** pegar aquí la URL del hilo del foro. La precaución que queda: las imágenes
generadas por Stitch (URLs `googleusercontent` / `aida-public`) no son activos de producción; seguimos
con nuestro flujo de imágenes (colocación manual + R2 + optimización de portada). El harvester no copia ni
enlaza ninguna imagen: solo cuenta cuántas ignoró (`images_ignored`).

## La biblioteca

```
design-library/
├─ index.json                       generado: lattiz design reindex
└─ stitch/<giro>/<candidate-id>/
   ├─ candidate.json                metadatos y bandera `status`
   ├─ design.md                     el DESIGN.md que se dio o devolvió Stitch
   ├─ source.html                   pantalla de Stitch (solo lectura para el harvester; nunca se sirve)
   ├─ screenshot.png                referencia visual
   └─ harvest.json                  lo que extrajo el harvester (paleta, tipografía, patrones)
```

`candidate.json`: `id` (`<giro>-<nombre>-<nn>`), `giro`, `source: "stitch"`, `status`, `tags[]`, `spin`
(etiqueta libre del giro visual), `license_ref`, `reuse_of` (si deriva de otro candidato), `created_at`,
`stitch: { project_id?, screen_ids[]? }`, `direction?`, `promoted?: { palette?, fonts?, section? }`.

Bandera `status`:

```
collected ──harvest──▶ harvested ──promote──▶ promoted
    │                      │
    └──────── shelved ◀────┘      (shelved vuelve a collected/harvested)
    └──────── rejected            (terminal)
```

`promoted` es terminal; para deshacerlo se revierte el commit de la promoción. El tipo y las validaciones
están en `packages/lattiz-cli/src/design/types.ts`.

## Comandos (`pnpm lattiz design …`)

| Comando                                                                                       | Qué hace                                                                                                       |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `system --giro g [--direccion d] [--out f]`                                                   | Imprime el DESIGN.md de Stitch generado desde la dirección: paleta, par tipográfico, forma y densidad nuestros |
| `gen --giro g [--n 2] [--direccion d] [--brief f]`                                            | Prepara `design.md` + `prompt.md` + `plan.json` en `.lattiz/stitch/` para correr el MCP                        |
| `gen --giro g --import <html\|md> [--design-md f] [--screenshot f] [--tags a,b] [--spin s] …` | Registra un candidato (`collected`) desde archivos locales                                                     |
| `list [--giro] [--status] [--tag] [--spin] [--json]`                                          | Tabla desde `index.json`                                                                                       |
| `harvest <id>`                                                                                | Extrae paleta, escala tipográfica y patrones a `harvest.json`; pasa a `harvested`                              |
| `promote <id> [--palette] [--fonts] [--section] [--dry-run]`                                  | Pasa los borradores por las compuertas; si una falla no queda nada escrito                                     |
| `shelve <id>` · `reject <id>` · `reindex`                                                     | Mueve la bandera · regenera `index.json`                                                                       |

**El MCP de Stitch no es parte del CLI.** Es una herramienta de Claude, no algo que este proceso pueda
llamar: `gen` (sin `--import`) deja el sistema de diseño y el prompt listos y la skill
`/lattiz-design` corre los pasos del MCP (`list_projects` de solo lectura para confirmar que responde,
`create_project`, `upload_design_md` → `create_design_system_from_design_md`,
`generate_screen_from_text`, `get_screen`) y registra cada pantalla con `gen --import`. Si el MCP está
caído o con límite, el flujo sigue con un `design.md`/HTML traído a mano; el harvester trabaja igual
sobre archivos locales. El estado intermedio vive en `.lattiz/stitch/` (no versionado).

## El sistema de diseño que se le da a Stitch

Un DESIGN.md por dirección de arte, versionado en `design-library/stitch/_design-systems/<dirección>.md`
(se regeneran con `pnpm lattiz design system --all`; un test falla si el archivo quedó viejo) y ya subido
a un proyecto privado de Stitch (`stitch-assets.json`: un asset por dirección). Traduce la dirección
(`directions/<id>.ts`) a colores (Material-3-like con los hex de nuestra paleta), dos familias, `rounded`
de la forma, espaciado de la densidad y una cuadrícula de 12 columnas.

`--rigor` decide cuánto se le deja a Stitch:

- **`loose`** (por defecto): la paleta es un punto de partida (se permiten variantes cercanas mientras el
  ánimo —claro/oscuro, cálido/frío/neutro— se mantenga), la tipografía son **ejemplos de estilo** (una
  display + una de texto, no una lista cerrada), se permiten bento, encimados y apilados. Más variedad y más
  candidatos que piden ajustes antes de `promote`. La compuerta real está en `promote`, no al generar.
- **`tight`**: exige exactamente la paleta y las familias del giro (usa el DESIGN.md del giro, no el de la
  dirección; hay que subirlo a Stitch).

Restricciones **duras** en ambos (para que el harvester pueda mapear): sin degradados como fondo del texto
principal y texto con contraste alto; íconos como SVG en línea (nada de fuentes de íconos como Material
Symbols); estructura semántica por sección (encabezado, portada con un h1, prueba social, servicios,
testimonios, FAQ, CTA, contacto, pie); una columna en móvil; sin formularios, carruseles, video, iframes ni
canvas; sin copy de marcas reales ni imágenes de personas reales identificables; copy es-MX.
`--direccion unused` elige la dirección que menos usan las plantillas del giro (`giro show`).
`design-library/stitch/_design-systems/` no es un candidato: el listado lo ignora.

## El harvester

Entrada: `design.md` (preferido: es el sistema de diseño de Stitch) y/o `source.html` (la config de
Tailwind se lee **sin evaluarla**; ningún JS se ejecuta ni se copia). Salida: `harvest.json`,
**determinista e idempotente** (sin fecha; volver a correrlo da los mismos bytes y no cambia la bandera de
un candidato ya `harvested` o `promoted`). Solo genera borradores; nunca promueve.

- **Paleta**: fondo, texto y acento (el rol más cromático entre `primary`/`tertiary`/`secondary`; casi gris
  deja `primary`), superficies, modo. Se agrupan los colores por rol (`roles`: superficie, texto, acento,
  borde), se mapean a **`--lz-color-*`** (`lz`, derivados con `buildPalette`; nunca los nombres de Stitch),
  se calcula el contraste de cada par texto/fondo (`pairs[].aa_pass`) y la **distancia ΔE00** al palette más
  cercano de cada giro afín con el método de A2 (`distance[]`), para que `promote` decida.
- **Tipografía**: escala (rol, familia, tamaño, peso, interlineado), familias de Google con métricas
  Capsize (`metrics`), fuentes de íconos excluidas (`excludedFamilies`), el par del kit que ya usa esas
  caras (`existingPair`) y `delivery` (¿cabe en cómo el kit entrega fuentes?: dos familias, de Google, con
  métricas).
- **Patrones de sección**: `slot` + `layout`, ítems y superficie. Cada uno cae en una de tres: **ya existe**
  (`existing`: «usa `hero/split`», no se crea nada), **borrador** (`draft`: `section.html` con clases `lz-*`,
  `section.css` solo con lo que el markup usa y tokens, `meta.ts`, y bytes; sin Tailwind, sin CDN, sin
  `<script>`) o **no mapeable** (`not_mappable` con la razón: iframe, video, canvas, tabla, carrusel, o
  sin variante equivalente ni generador). No se fuerza el kit.
- **Interactividad** (`interactivity`): detecta revelado al hacer scroll, encabezado que cambia y parallax y
  los traduce a una recomendación (Motion solo Pro con preset calm; encabezado: omitir; parallax:
  descartado o fade suave). Nunca importa código.
- **Imágenes**: no importa URLs. `image_needs` anota por sección qué foto pide el diseño (orientación y si va
  de fondo) y `images_ignored` cuántas descartó.

## Compuertas de `promote`

Todo o nada: ante la primera falla se restauran todos los archivos tocados y la bandera no cambia.

| Qué         | Compuertas                                                                                                                                                                                                                                                     |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--palette` | AA (`buildPalette`) · `kit:palettes` (ΔE00 ≥ 15 contra cada paleta de cada giro afín) · `kit:manifest` + `--check` · `kit:verify-snapshot` **sin moverse** · sin archivos inesperados                                                                          |
| `--fonts`   | Si el par ya existe se reutiliza sin escribir. Si no: familias de Google con métricas Capsize · `kit:fonts --only <par>` (licencia, glifos, KB) · manifiesto y snapshot                                                                                        |
| `--section` | Patrón → variante nueva `sections/<slot>/<superficie>-<layout>/` (hoy: `services/{bento,card-grid}`, `about/quote`, `cta/{centered,band}`) · contrato `extended-sections` · `kit probe` (3 temas, overflow, texto, táctiles, contraste) · snapshot sin moverse |

Notas:

- **El snapshot se compara, no se exige limpio.** Al escribir esto `main` ya tenía 5 diferencias en
  `kit:verify-snapshot` (la-nota-azul, antes de esta rama); la compuerta exige que el conjunto de
  diferencias sea **idéntico** antes y después de la promoción.
- **Una paleta nueva toca dos archivos generados** que `kit:manifest` reescribe: `catalog.manifest.json` y la
  línea `manifestHash` de `apps/api/.../plan-catalog.generated.ts`. Es el procedimiento de siempre del kit
  ("tras cambiar el kit, `kit:manifest`").
- **Una sección nueva cambia datos reales**: aparece en el manifiesto y, por el plan de bloques, en
  `apps/api` y `apps/web`. Santi aprobó el uso de `--regenerate-manifest` (2026-10-19); probado: añade el bloque al manifiesto y cambia solo la línea `manifestHash` de la API. Por eso `--section` es **solo una prueba** (se restaura todo) salvo que se pase
  `--regenerate-manifest`, y no se combina con `--palette`/`--fonts` sin esa bandera. Decisión de producto
  pendiente: las secciones de Stitch deben insertarlas el compilador desde el spec, no ser bloques del
  editor; hoy el manifiesto las listaría también como bloques.
- **Aviso de uso** (no es compuerta): si el acento de la paleta está a < 30° de un tono ya ocupado del giro,
  el compilador no la elegirá ahí (la regla de unicidad de la plantilla); `promote` lo avisa. Se puede
  fijar a mano en un giro con tono libre.

## Prueba de punta a punta (sin MCP)

Ejecutada con el fixture «Executive Vision – Dental» (`packages/lattiz-cli/test/fixtures/`):

1. `design gen --giro dental --import …/screen.html --design-md …/design.md` → `collected`.
2. `design harvest` → paleta oscura AA (`#08132a` / `#d9e2ff` / `#b9c7e4`), Playfair Display + Inter,
   patrones `hero/split` y `footer/link-columns` (ya existen: `hero/split`, `footer/columns`) y borradores `about/tinted-quote`, `services/glass-bento`, `cta/glass-centered`; tres recomendaciones de JS y 2 imágenes ignoradas.
3. `design promote --palette` → pasa todas las compuertas (`pal-clinical-eminence`).
4. Spec de veterinaria con `brand.palette.preset: "pal-clinical-eminence"` (dental no tiene tono libre cerca
   de 220°) → `lattiz build --out` → `check` (kit:validate PASS, axe PASS) y `review`.
5. Se revirtió: `kit:manifest --check` y `kit:verify-snapshot` quedan como la línea base.

Los tests: `pnpm --filter @lattiz/cli test` (herméticos, runner falso y copia de los archivos del kit) y,
con `LATTIZ_DESIGN_E2E=1`, tres pruebas contra el kit real (~2 min: promoción en seco, paleta demasiado
cercana restaurada, sección promovida y revertida con snapshot idéntico). No corren en `turbo test`
porque escriben un momento en `palettes/` y `sections/`.

## Límites conocidos y siguiente paso

- Solo 4 patrones tienen generador de sección (`services/bento`, `services/card-grid`, `about/quote`, `cta/centered`); portadas y pies no (sus contratos son más estrictos) y quedan «ya existe» o `not_mappable`.
- Las paletas de giros saturados en tono solo se usan fijadas a mano o con acento neutro.
- Falta el enlace del foro en «Licencia».
- Siguiente: decidir cómo se registran las secciones de Stitch para que el compilador las inserte sin
  volverlas bloques del editor (hoy `--regenerate-manifest` las lista en el manifiesto).
