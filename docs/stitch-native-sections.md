# Stitch → secciones nativas (Modelo D)

Segundo camino, aditivo, junto al flujo de cosecha (`docs/design-stitch-flow.md`, Modelo B). Stitch **no se
importa ni se sirve**: su diseño es una especificación visual de alta fidelidad y cada patrón nuevo se
**reconstruye a mano como sección del kit**. Así hereda gratis lo que ya hace `compose-site` (tokens, SEO,
JSON-LD, GA, WhatsApp, Motion Pro) y el validador la cuenta por tipo y tier. No se toca `apps/tenant-sites`,
el runtime de Motion, el seed ni plantillas, paletas o secciones existentes.

## El contrato de una sección nativa

| #   | Regla                                                                                   | Quién lo comprueba                                                    |
| --- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1   | Markup `lz-*` semántico; CSS a mano solo con tokens `--lz-*`, clase raíz `lz-<slot>-<variante>` | `extended-sections`, `kit:validate`, `kit-blocks.test` (web)         |
| 2   | Sin JS: se ve igual con JavaScript apagado                                              | `kit:validate`, `lattiz check` (nojs)                                 |
| 3   | Presupuesto: foto de portada ≤ 120 KiB; CSS del borrador ≤ 1.2 KB gzip                  | `budgets.json`, `promote --section`, `hero-photo-ribbon.test`         |
| 4   | Animación solo con el preset Motion (Pro); Básico estático. El markup no trae animación | el seed pone Motion por slot; `prefers-reduced-motion` obligatorio    |
| 5   | Slots de imagen declarados; el hero obliga a foto real al publicar                      | `lattiz check` (aviso) y `ship`/`publish` (falla), `hero-photo.test`  |
| 6   | Contenido por claves de copy (mismas que sus hermanas siempre que se pueda)             | `meta.contentKeys`, `extended-sections`                               |
| 7   | Par Básico + Pro                                                                        | `tiers: ['basic','pro']`; el tier decide Motion                       |

## Lo construido (WP0–WP6)

- **`hero/photo-ribbon`** (Básico + Pro): foto a sangre, velo oscuro desde el pie, contenido a la izquierda,
  insignia con tres franjas (en colores del tema: un literal rojo/azul no pasa el validador), titular,
  texto, CTA de WhatsApp con ícono SVG en línea, segundo CTA y línea de confianza. `fetchpriority="high"`,
  `width`/`height`, sin `lazy`. 16/16 en `kit probe`. Se registró como última alternativa de los
  arquetipos `showcase` y `bold` para no mover ninguna elección existente.
- **Bloque del editor** `lzb-hero-photo-ribbon`: sale del mismo markup y CSS del kit (Fase C, `src/cli/editor-blocks.ts`),
  Básico y Pro porque la variante no es solo Pro. `SLOT_TYPES` es la clasificación de Motion del seed y ya
  mapea `hero`: no hizo falta tocarlo.
- **`pal-musgo-y-plata`** (paleta, desde el candidato `barberia-don-porfirio-01`) y la dirección
  **`insignia-musgo`** (paleta, par Libre Caslon + Schibsted, estilo, portada, voz).
- **Par La Insignia** (`barberia-la-insignia-v1` + `barberia-base-la-insignia-v1`), construido por spec con la
  dirección y `variantOverrides: { hero: photo-ribbon }`.
- **Compuerta de foto de portada**: `lattiz ship`/`publish` fallan si `images[] «hero»` sigue siendo un
  placeholder (mensaje es-MX con el campo exacto); `lattiz check` y el build lo muestran como aviso.
- **Harvest y promote**: `primary` es el acento por defecto (antes se elegía «el más cromático» y salía el
  rojo del poste), `harvest --accent <rol>`, `promote --set bg=#… --name …` para ajustes guiados por las
  compuertas, reconocimiento de foto + velo (`hero/photo-overlay` → ya existe `hero/photo-ribbon`), reporte
  de variantes parecidas y tres frenos en `promote --section`.

## Disciplina anti-inflación

Antes de crear, el harvest dice si el patrón ya existe (`existing`) y qué variantes de su familia de
composición se le parecen (`similar`). `promote --section` se niega si hay parecidas salvo `--allow-similar`
(decisión deliberada), si ya hay 6 secciones nacidas de Stitch (`// Stitch:` en su `meta.ts`) o si el CSS
del borrador pasa de 1.2 KB gzip. **En la prueba real casi todo ya existía**: del diseño de Don Porfirio
solo la portada era nueva; servicios, testimonios, preguntas, equipo y pie se reutilizan, y no se creó
ninguna sección de cuerpo. Eso es lo esperado: Stitch deja de ser indispensable conforme el kit crece.

## Fidelidad (hero, 1440×900 y 390, contra la captura de Stitch)

Coincide: composición, jerarquía, insignia con franjas, titular serif en mayúsculas con espaciado amplio, ícono de
WhatsApp, línea de confianza, filete de acero al pie, escala del titular (se contuvo de «cartel» a ~64 px
tras comparar). Se aproxima o difiere, por presupuesto o por reglas del kit:

- La **foto** es un marcador de posición hasta que se ponga la real (`images[]`); sin ella el bloque se ve
  vacío, por eso existe la compuerta.
- El CTA principal es del color de acento del tema (plata), no el verde tintado de Stitch.
- Las franjas de la insignia usan acento / blanco / acento atenuado, no rojo-blanco-azul literales.
- El titular envuelve en 3 líneas (Stitch, 2): lo decide la escala tipográfica de la dirección.
- Sin efectos caros (`backdrop-filter`, parallax, zoom de imagen): quedan fuera del presupuesto de LCP.

## Hallazgos que conviene recordar

- **Un giro puede estar saturado para una paleta.** Verde oscuro + plata ya lo ocupan Abeto, Pinar y
  `barberia-norte`: no existe un verde musgo/pino con acento plata a ΔE ≥ 15 de toda paleta y plantilla de
  barbería. La paleta nueva sirve en otros giros; en barbería la dirección aporta portada, tipografía, estilo
  y voz con la paleta que elija el compilador. La compuerta de la biblioteca mira paletas, no plantillas.
- Los roles de Stitch son Material: `primary` es el acento de marca; `tertiary` suele ser un resaltado.
- `kit:manifest` valida dirección ↔ diales (airy ⇒ densidad ≤ 3): lo atrapó la regeneración, no las pruebas.

## No verificado

- **Editor en vivo** (insertar, guardar y recargar el bloque con cuentas Básico y Pro): exige Supabase y la API
  locales y no se corrió. Lo cubren las pruebas de `apps/web` (`kit-blocks`, `plan`) y que el bloque salga del
  mismo markup del kit; falta la prueba manual.
- **`kit:snapshot:add`** de las plantillas nuevas: `main` ya trae 5 diferencias (la-nota-azul) y el comando
  se niega a agregar con el snapshot rojo. Se agrega cuando eso se resuelva.
