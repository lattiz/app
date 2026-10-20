---
name: lattiz-template
description: Crea plantillas de sitio Lattiz (el par Básico + Pro) para un negocio mexicano ficticio con el CLI `pnpm lattiz`. Elige el giro, escribe el spec con copy es-MX, valida, compila, corre los checks, revisa las capturas y entrega el comando de publicación sin publicar nada. Úsala cuando pidan «hazme/crea un template/plantilla para <negocio> en <ciudad>», «genera el par básico y pro de …», «una plantilla de taquería/dentista/gimnasio…», o con /lattiz-template.
argument-hint: '<negocio> en <ciudad> [tono] [básico|pro|par]'
allowed-tools: Bash(pnpm lattiz *) Bash(pnpm --filter @lattiz/template-kit kit:compare-visual *) Read Edit(packages/template-kit/specs/**) Write(packages/template-kit/specs/**)
---

# Plantilla Lattiz desde un pedido en lenguaje natural

Pedido: $ARGUMENTS

Produces un **par Básico + Pro** (o un solo tier si lo piden) a través del CLI, lo revisas visualmente
y te detienes **antes** de cualquier escritura remota. Todo pasa por un spec en
`packages/template-kit/specs/<giro>-<nombre>.spec.json`.

## Reglas (siempre)

1. **Nunca imprimas secretos.** No hagas `cat`, `echo`, `grep` ni leas `.env*` o claves. Para saber si
   existe una variable: `pnpm lattiz doctor` (solo nombres y presencia).
2. **Solo editas specs.** Nunca edites archivos generados (`templates/`, `themes/`, `content/`,
   `demo-profiles/`, `assets/`, `dist/`), ni otras plantillas, ni secciones compartidas, ni código del
   kit/CLI. Si el spec no alcanza (falta una variante o un giro), detente y dilo.
3. **Datos ficticios.** Nombre del negocio, personas, reseñas y marcas inventados; teléfonos de demo con
   `0000` (p. ej. `+52 442 000 0000` / `5214420000000`); cédulas `0000000`. Nunca un negocio real,
   aunque el usuario lo nombre: propón uno ficticio y dilo.
4. **Copy:** variables del kit para contacto (`{{phone}}`, `{{whatsappUrl:mensaje}}`, `{{email}}`,
   `{{address}}`, `{{city}}`, `{{branch}}`), nunca `{{lz:*}}` ni datos escritos a mano. Sin promesas
   ni superlativos. Guía completa: `references/copy-guide-es-mx.md`.
5. **Checks en secuencia.** `lattiz check` y `lattiz review` usan ~1 GiB y 20–40 s: uno a la vez,
   nunca en paralelo ni en segundo plano junto a otro.
6. **Nada remoto.** No corras `seed`, `deploy`, `publish` ni `ship` (ni `--confirm-remote`) salvo que el
   usuario lo pida **explícitamente en esta conversación**. Tampoco `build --force`, `unfreeze --yes`,
   `git push` ni commits si no te lo piden.
7. **Fotos:** con `PIXABAY_API_KEY` (`pnpm lattiz doctor` dice si está; nunca la muestres) `build` las
   trae solo de Pixabay: escribe en `images[]` búsquedas en inglés concretas al negocio
   (`{ "key": "hero", "source": { "search": "pink frosted layer cake bakery" } }`). Tras el build lee los
   `tags` de cada foto en `assets/<giro>/<id>/CREDITS.json`, mira las fotos y ajusta `alt`/pies a lo que
   muestran; si una no sirve, cambia su búsqueda y recompila (la foto se queda mientras la búsqueda no
   cambie). `team-*` deben ser retratos; si no, quita la sección opcional. Sin clave: placeholders, o
   URLs que pegue el usuario como `{ "url": "https://…" }` (`images.pexels.com`, `images.unsplash.com`,
   `pixabay.com`, `cdn.pixabay.com`). En `copy` queda siempre el nombre local (`"image": "hero.jpg"`).
8. **Paradas:** máximo 4 vueltas de validar/compilar/checar y 2 rondas de revisión visual. Si algo
   sigue fallando, detente y reporta qué falta.

## Paso opcional: diseño con Stitch (antes del paso 1)

Solo si el usuario pide explícitamente «usa Stitch» o si el giro está saturado de diseño
(`pnpm lattiz kit capacity --giro <giro> --catalog extended --json` en 0 pares, o `giro show` sin
`freeHueRanges` ni direcciones sin usar). Si no, sáltalo. Stitch alimenta el diseño, no la publicación:
guía en `docs/design-stitch-flow.md`, detalle del MCP en la skill `/lattiz-design`.

1. **Generar.** `pnpm lattiz design gen --giro <giro> --n 2 --direccion <dirección|unused> [--rigor loose|tight]`
   deja `design.md`, `prompt.md` y `plan.json` en `.lattiz/stitch/`. Corre los pasos del plan con el MCP
   de Stitch (solo diseño; `list_projects` primero) y registra cada pantalla con
   `pnpm lattiz design gen --giro <giro> --import <html> --design-md <design.md> --screenshot <png> …`:
   quedan 2 candidatos `collected`. `loose` (por defecto) deja explorar; `tight` exige la paleta y la
   tipografía de la dirección (menos variedad, menos ajustes antes de promover).
2. **Elegir.** Muestra las 2 capturas (`screenshot.png`) con un resumen breve de cada una; elige el
   usuario. Si no quiere elegir, toma el más distinto de lo que el giro ya tiene (`pnpm lattiz list`,
   direcciones usadas en `giro show`; después de `harvest`, la mayor `palette.distance` y más secciones
   con `draft`).
3. **Extraer.** `pnpm lattiz design harvest <id>` sobre el elegido.
4. **Traducir y promover.** Con los borradores del harvest, promueve solo lo que cabe:
   `pnpm lattiz design promote <id> --palette --fonts` (siempre primero con `--dry-run`). Una sección
   (`--section`) solo si el usuario lo pidió, y `--regenerate-manifest` solo si pidió promover esa sección
   concreta. Lo que falla una compuerta **no se promueve**: `pnpm lattiz design shelve <id> --note
"<compuerta que falló>"` y sigue con el kit actual.
5. **Construir.** Sigue el flujo de abajo con el spec referenciando la dirección, la paleta, el par
   tipográfico y las secciones (incluidas las recién promovidas, con `layout.variantOverrides`). Con
   `layout.direction` el compilador elige la paleta de la dirección y **ignora** una paleta fija: para usar
   la paleta promovida, fíjala sin `layout.direction` (o pide agregarla a la dirección, que es un cambio del
   kit). Recordatorio: las secciones nuevas las inserta el compilador al construir desde el spec; además
   tienen un bloque del editor generado desde el kit (Fase C). Para reconstruir lo que falta, ver «Flujo Stitch nativo»
   en `/lattiz-design`.

**Lista de traducción** (de `harvest.json` a su destino; la skill nunca promueve ni publica algo que falle
una compuerta y, en duda, deja el candidato `shelved`):

| En el harvest                                          | Destino                                                                                                                               |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Mood y estilo (superficie, forma, densidad)            | Elegir la **dirección** más cercana; no se copia nada                                                                                 |
| `palette` con `aa.ok` y `distance[].ok`                | **Paleta** nueva (`promote --palette`); si el aviso de tono dice que choca, solo fijada a mano                                        |
| `typography.existingPair` / `delivery.ok`              | **Par tipográfico**: reutilizar el existente o `promote --fonts`; sin métricas o fuente de Google → descartar                         |
| `sections[].existing`                                  | Ya existe: usar esa variante (`layout.variantOverrides`), no se crea nada                                                             |
| `sections[].draft`                                     | **Sección nueva** (`promote --section`, solo si el usuario lo pide)                                                                   |
| `not_mappable`, JS (`interactivity`), iconos de fuente | Se descartan (JS → Motion Pro solo como recomendación); el candidato o ese elemento queda `shelved`                                   |
| `image_needs`                                          | Guían las fotos del flujo normal (`images[]` del spec, o un `IMAGES.md` si el proyecto lo usa); nunca se importa una imagen de Stitch |

## Flujo

Comandos, flags y formas JSON: `references/commands.md`. Detalle de cada paso:
`references/workflow.md`.

1. **Intake.** Extrae: tipo de negocio, ciudad y colonia (o una típica de la ciudad), tono, tiers
   (por defecto el par) y nombre ficticio (propón uno si falta). Pregunta **máximo 2 cosas cortas**
   y solo si son indispensables; si no, decide y anota tus supuestos.
2. **Giro.** `pnpm lattiz giro list --json`; mapea el negocio con `references/giro-mapping.md`
   (taquería → restaurante, etc.). `pnpm lattiz giro show <giro> --json` te da variantes por tier,
   paletas/tipografías libres con su tono, claves de copy con límite de caracteres y reglas del giro.
   Si ningún giro sirve, dilo y propone el más cercano o el camino «giro nuevo» (no escribas código).
   2b. **Dirección y diversidad.** En la salida de `giro show` mira `directions` (ordenadas: primero las
   menos usadas en el giro, luego por afinidad), `archetypesUsed` y `freeProHeroes`; corre
   `pnpm lattiz kit capacity --giro <giro> --catalog extended --json`. Elige una **dirección** y un
   **arquetipo** que el giro todavía no use y que vayan con el tono (`references/giro-mapping.md` ›
   Dirección y arquetipo). `pnpm lattiz direccion show <id> --json` te da su voz: escribe todo el copy
   con ella. Si la capacidad del giro está en 0 pares, dilo antes de seguir.
3. **Spec.** `pnpm lattiz spec init --giro <giro> --nombre "<Nombre>" --twin --direccion <id> --json`.
   Luego edita **solo ese archivo**:
   - `business`: ciudad, `branch` (colonia), dirección ficticia con calle y colonia, horario,
     teléfono/WhatsApp de demo con la lada de la ciudad, correo con el dominio del nombre. Borra `todo`.
   - `brand` y `layout`: con dirección, **no fijes** paleta, tipografía ni forma (las elige el
     compilador dentro de la dirección); `layout.archetype` si quieres otro que el primero de la
     dirección; `layout.dials` (1–10) solo para empujar variación/densidad/movimiento con motivo. Sin
     dirección: paleta y tipografía **libres** (`free: true`) que vayan con el tono; forma del giro.
   - `copy`: reescribe para este negocio al menos hero (title ≤ 40 caracteres ideal, text), about,
     services (precios de ejemplo), testimonials, faq, footer.about y head.description, respetando
     los límites de `giro show`. Sabor local (colonia, ciudad, platillos o servicios típicos) sin
     clichés. `overrides.basico.copy.hero` con titular y texto propios para la Básica.
   - `sections`: deja los roles del giro; fija una variante solo si tienes motivo (mejor en
     `layout.variantOverrides`, p. ej. `{ "hero": "bento" }`). El rol opcional `cta` (franja de cierre)
     cuenta como sección: en Básico reemplaza a `about`.
   - `images`: deja las búsquedas del giro o ajústalas al negocio (en inglés funcionan mejor).
4. **Validar y compilar** (bucle, máx. 4):
   `pnpm lattiz spec validate <stem> --strict --json` → corrige errores y los avisos de `generico`,
   `repetido`, `acentos` → `pnpm lattiz build <stem> --json` → por cada id, **uno a la vez**,
   `pnpm lattiz check <id> --json`. Arregla cada FAIL editando el spec según `findings[].specHint`.
   El WARN `fold` (CTA del hero bajo el pliegue) **sí se arregla**, como un FAIL. Los WARN `font`/`tap`/`images` con `specHint: null` son de la variante: se aceptan.
5. **Revisión visual** (máx. 2 rondas): `pnpm lattiz review <id>` por cada id; abre
   `movil-390x844.png`, `laptop-1366x768.png`, `escritorio-1440x900.png` y las capturas de
   `secciones/` que haga falta; lee `review.md`. Critica con `references/review-rubric.md`; cambia el
   spec y repite build → check → review solo del id afectado.
6. **Entrega (nunca publiques).** Reporta: ids, `pnpm lattiz dev <id>` para verlas, resumen de WARN,
   supuestos y lo que adivinaste, 2–3 frases de crítica por plantilla, y el comando exacto
   `pnpm lattiz ship <idBásico> <idPro>` para que el humano lo corra cuando quiera.

## Si algo falla

- Código 2 en `spec validate`/`build`: el spec es inválido; lee `problems[].path` y `hint`.
- Código 1 en `build`: unicidad, archivo editado a mano o congelado. Nunca uses `--force`; si es
  «congelado» o «editado a mano», detente y pregunta.
- `check` FAIL sin `specHint` (tokens, sin JS, runtime): no es del spec; repórtalo.
- Similitud o paleta ocupada: deja que el compilador elija (quita la variante/paleta fija) o toma otra
  `free: true` de `giro show`.
