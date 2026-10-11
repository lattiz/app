# Auditoría de Lattiz Motion — plantilla piloto `barberia-norte-v1`

Fecha: 2026-10-11. Objetivo: tener evidencia de por qué Motion v1 se siente inconsistente antes de
cambiar nada, y una línea base de rendimiento para comparar después (WP4, al final de este documento).

## Dónde vive cada pieza (WP0.1)

| Pieza | Ubicación real |
|---|---|
| Runtime (fuente) | `apps/tenant-sites/lib/lz-motion/src/runtime.js` + `src/style.css` |
| Runtime minificado (commiteado) | `apps/tenant-sites/lib/lz-motion/runtime.generated.ts` (lo genera `pnpm --filter @lattiz/tenant-sites build:motion`) |
| Inyección | `apps/tenant-sites/app/route.ts` → `injectMotion()` como último paso, solo si `site.isPro` y el HTML trae un atributo de motion |
| Seed | `scripts/parse-and-seed-template.ts` (un template por ejecución, upsert por `--id`) |
| Decorador `--motion` | `scripts/lib/motion-decorate.ts` en v1 (mismas reglas sobre el JSON de GrapesJS y sobre el HTML del preview); en v2 lo reemplaza el clasificador `scripts/lib/motion-sections.ts` |
| Fuente de la plantilla | **No hay `.grapesjs` a mano**: `packages/template-kit/templates/barberia-norte-v1.ts` (manifiesto) + `sections/<slot>/<variant>/` + `themes/norte-atelier.json` + `content/barberia.norte.es-MX.ts`. `kit:build` genera `dist/barberia-norte-v1/{barberia-norte-v1.grapesjs,index.html,template.meta.json}` |
| Preview | `apps/template-previews/public/barberia-norte-v1/index.html` (lo escribe el seed, con el runtime inline por ser Pro) |

Desviación respecto al prompt: las plantillas no se editan como `.grapesjs`/HTML sueltos; son código
fuente en `packages/template-kit` y el `.grapesjs` es un artefacto de compilación.

## Fila en Supabase vs fuente (WP0.2)

Lectura con el MCP de Supabase (`public.templates`, sin escribir nada):

| id | tier | activo | bytes JSON | reveal | words | stagger | lightbox | section |
|---|---|---|---|---|---|---|---|---|
| barberia-norte-v1 | pro | sí | 85 801 | 7 | 6 | 2 | 1 | 0 |
| barberia-concreto-v1 | pro | sí | 91 112 | 7 | 6 | 0 | 1 | 0 |
| barberia-oxido-v1 | pro | sí | 94 115 | 7 | 6 | 0 | 1 | 0 |
| barberia-base-{claro,oscuro,solar}-v1 | basic | sí | ~59 000 | 4 | 4 | 0 | 0 | 0 |
| barberia-v1, medical-center-v1, neuraltech-v1 | basic | sí | — | 0 | 0 | 0 | 0 | 0 |

La fila de Norte coincide con el preview commiteado: se sembró con `--motion editorial`
(7 secciones con `data-lz-reveal`, 6 `h2` con `data-lz-words`, 2 listas con `data-lz-stagger`, lightbox
en la galería). La tabla `templates` no tiene `updated_at`; el JSON vive en `grapesjs_json`.

## Qué recibe cada sección hoy (390 px y 1440 px, mismos resultados)

Medido con Playwright sobre el preview servido en local (`probe.mjs`, ver «Cómo se midió»).
«Texto» = `h1–h4, p, li, blockquote, figcaption, summary, botones` con texto; «sin cubrir» = nodos de
texto/medios que no tienen animación propia ni la heredan de un ancestro animado.

| # | Sección (slot/variante) | Nodos | Texto | Medios | Nodos con `data-lz-*` | Qué anima | Texto sin cubrir | Medios sin cubrir |
|---|---|---|---|---|---|---|---|---|
| 0 | navbar/centered-logo | 20 | 6 | 0 | 0 | nada | 6 | 0 |
| 1 | hero/split | 14 | 6 | 1 | 0 | **nada** | 6 | 1 |
| 2 | about/statement | 31 | 5 | 1 | 2 | sección (fade-up) + h2 por palabras | 0 | 0 |
| 3 | services/editorial-table | 47 | 36 | 0 | 3 | sección + h2 palabras + `ol` stagger | 0 | 0 |
| 4 | team/list | 41 | 18 | 4 | 3 | sección + h2 palabras + `ul` stagger | 0 | 0 |
| 5 | gallery/strip | 33 | 10 | 8 | 2 | sección + h2 palabras (+ lightbox) | 0 | 0 |
| 6 | testimonials/quote-feature | 22 | 10 | 0 | 1 | sección (zoom), sin h2 | 0 | 0 |
| 7 | faq/two-col | 49 | 16 | 0 | 2 | sección + h2 palabras | 0 | 0 |
| 8 | locations/with-contact | 40 | 11 | 2 | 2 | sección + h2 palabras | 0 | 0 |
| 9 | floating-whatsapp | 5 | 0 | 0 | 0 | nada (correcto: es `position: fixed`) | 0 | 0 |
| 10 | footer/minimal-centered | 40 | 10 | 0 | 0 | nada | 10 | 0 |

«0 sin cubrir» en las secciones 2–8 es engañoso: todo está «cubierto» porque **la sección entera es la
unidad que aparece**. El único movimiento interno visible es el título por palabras y, en dos secciones,
una lista escalonada. Por eso se percibe «solo animan los títulos».

## Causas raíz demostradas

1. **El decorador solo conoce tres patrones** (`scripts/lib/motion-decorate.ts`): la raíz de cada
   sección (`fade-up`, o `zoom` en testimonios), el primer `h2` (`data-lz-words`) y la primera `ul/ol`
   con ≥ 3 hijos (`data-lz-stagger`). Grids hechos con `div`/`article`/`figure`/`details` nunca se
   escalonan: testimonios (3 `figure`), FAQ (6 `details`), sucursales (`article`), canales de contacto
   y la galería (excluida a propósito del stagger).
2. **Hero, navbar y footer están en `STATIC_SLOTS`**: la primera pantalla —lo que más se ve— no tiene
   ninguna entrada. Medido: 0 nodos animados en el hero a 390 y 1440 px.
3. **Animaciones anidadas con disparadores independientes.** La sección (`data-lz-reveal`), su `h2`
   (`data-lz-words`) y su lista (`data-lz-stagger`) tienen *cada una* su propio `IntersectionObserver`
   (`onEnter()` crea uno por elemento). La sección se dispara cuando su borde superior entra al 90 % del
   viewport; el `h2` y la lista, cuando *ellos* entran. Resultado: la sección se desvanece mientras sus
   palabras siguen ocultas, o las palabras arrancan dentro de un padre aún en opacidad 0. La misma
   sección se ve distinta según la velocidad de scroll.
4. **16 `IntersectionObserver` para 16 nodos** (7 secciones + 6 títulos + 2 listas + 1 sonda del
   failsafe), medido interceptando el constructor. No hay un único observador por página.
5. **«Arriba del pliegue» se decide por elemento, no por sección.** Una sección que asoma en el primer
   viewport no se oculta, pero su `h2` (más abajo) sí: animación parcial. En la piloto no ocurre a 390 ni
   a 1440×900 porque el hero ocupa toda la pantalla, pero sí en viewports altos (tablet vertical).
6. **Stagger sin tope**: el retardo es `índice × 90 ms` sin límite; una lista de 12 elementos tarda
   > 1 s en terminar.
7. **El failsafe vigila un solo nodo**: observa `pending[0]`; si ese reporta, el failsafe se desarma
   para todos los demás aunque sus observadores fallen.
8. **Sin tokens de movimiento compartidos**: duraciones (500/600/700 ms), distancias (24/32 px) y
   escalas viven sueltas en el CSS/JS; `calm` y `editorial` del seed solo cambian *qué* se decora, no
   *cómo* se mueve.
9. **Parallax v1 usa un listener de `scroll`** (pasivo + rAF). La piloto no lo usa, pero el contrato lo
   permite.

Descartados (medidos, no son causa aquí): ancestros con `overflow:hidden`/transform que escondan el
objetivo (los objetivos son raíces de sección y `h2`, no hay contenedores intermedios de GrapesJS que
oculten el nodo real); elementos que nunca se disparan (0 nodos quedaron con `.lz-hide` tras recorrer la
página con CPU 4×).

Hallazgos de rendimiento ajenos a motion:

- **CLS 0.15 en móvil viene de la carga de fuentes web, no del runtime**: el mismo HTML *sin* runtime da
  CLS 0.15. Lighthouse lo atribuye a `img.lz-hero-split__image` con causa «Web font loaded» (Playfair
  Display con `display=swap` reacomoda el titular y empuja la imagen). Corregirlo pide métricas de fuente
  de respaldo (`size-adjust`) en el kit; queda fuera de este trabajo.
- **El elemento LCP es la imagen del hero** (`section#hero … img.lz-hero-split__image`) en móvil. Regla
  para v2: esa imagen nunca empieza oculta ni recortada.

## Línea base (WP0.4) — Motion v1

| Métrica | v1 (preview Pro actual) | Mismo HTML sin runtime |
|---|---|---|
| Lighthouse móvil, mediana de 3 (score) | 87 | 87 |
| LCP | 3 092 ms | 3 110 ms |
| CLS | 0.149 | 0.150 |
| TBT | 0 ms | 0 ms |
| Runtime minificado / gzip | 11 450 B / **4 390 B** | — |
| `IntersectionObserver` creados / nodos observados | 16 / 16 | — |
| Nodos que animan (390 px y 1440 px) | 46 en 7 secciones; 0 en hero, navbar y footer | — |
| Long tasks durante scroll completo con CPU 4× | 390 px: 2 (78, 74 ms) · 1440 px: 2 (51, 65 ms) | — |

Las dos long tasks aparecen igual sin runtime: son el decode/raster de imágenes al entrar en pantalla.

### Cómo se midió

- Preview servido con `python3 -m http.server` desde `apps/template-previews/public`.
- `probe.mjs` (Playwright, Chromium 1243): intercepta `IntersectionObserver` para contar instancias y
  `observe()`, registra `longtask` y `layout-shift`, recorre la página en pasos de 120 px con
  `Emulation.setCPUThrottlingRate = 4` y cuenta por sección nodos, texto, medios y atributos.
- Lighthouse 12.8.2 CLI, `--form-factor=mobile` (throttling simulado por defecto), 3 corridas, mediana.
- Los scripts de medición son herramientas de desarrollo en el scratchpad, no tests; no se commitean.

## Antes / después (WP4)

Mismo HTML del preview (assets en R2) para todas las columnas; v2 = las mismas secciones etiquetadas
por el clasificador del seed y el runtime v2 final. Lighthouse móvil: mediana de 5 corridas.
Probe: Playwright, scroll completo con CPU 4×, CLS por ventana de sesión (como Lighthouse/CrUX).

| Métrica | v1 | v2 `calm` | v2 `editorial` |
|---|---|---|---|
| Lighthouse móvil (score) | 87 | 89 | 89 |
| LCP | 3 093 ms | 3 090 ms | 3 087 ms |
| CLS (carga) | 0.150 | 0.124 | 0.123 |
| TBT | 0 ms | 0 ms | 0 ms |
| Runtime gzip | 4 390 B | 8 068 B | 8 068 B |
| `IntersectionObserver` creados | 16 | **1** | **1** |
| Nodos observados a la vez (máx.) | 16 | 10 (8 secciones + centinela del header + 1 ancla diferida) | 10 |
| Llamadas a `observe()` en todo el scroll | 16 | 53 a 390 px · 43 a 1440 px | 51 · 43 |
| Secciones con movimiento | 7 de 9 | **9 de 9** (hero y footer incluidos) | 9 de 9 |
| Nodos animados | 46 (7 bloques de sección + 33 palabras + 6 filas) | 91 (titulares por palabra, textos, botones, filas, imágenes) | 91 |
| Long tasks en scroll con CPU 4× (390 px) | 2 (60–71 ms) | 2 (54–55 ms) | 3 (55–88 ms) |
| CLS con scroll completo (390 / 1440 px) | 0.140 / 0.019 | 0.113 / 0.023 | 0.115 / 0.023 |
| Nodos ocultos al terminar el scroll | 0 | 0 | 0 |

Lectura:

- **Sin regresión en LCP ni TBT.** El LCP sigue siendo la imagen del hero y no cambia: v2 solo le
  aplica `scale`. El runtime corre antes del primer paint (medido en 6/6 cargas), así que el hero
  no parpadea.
- **El CLS de carga baja de 0.150 a 0.124** sin que hayamos tocado su causa (la fuente web que
  reacomoda el titular); la imagen del hero, al estar animándose, deja de contarse completa en el
  desplazamiento. No es un arreglo real: la causa sigue pendiente (ver hallazgos).
- **Observadores: de 16 a 1.** Las 53 llamadas a `observe()` son anclas diferidas que se observan de
  una en una por sección y se sueltan al dispararse; nunca hay más de 10 nodos observados a la vez.
- Las long tasks son decodificación de imágenes; aparecen igual en el HTML sin runtime (2–3 de 55–92 ms).
- En 1440 px el CLS con scroll sube 0.004 por un artefacto de medición: Chrome atribuye un
  «desplazamiento» al título que se anima dentro del aside `position: sticky` del FAQ, aunque su
  layout no cambia (medido: mismo tamaño y posición antes, durante y después). Como el CLS se reporta
  por ventana de sesión, no supera la ventana de carga.
- Tamaño: 8.1 KB gzip, dentro del presupuesto de 10 KB. Crece 3.7 KB por la coreografía, el
  clasificador de grupos/filas, las anclas diferidas, los tokens y los helpers CSS (marquee, stack,
  fill, lift, zoom, progreso, drift).

Verificado además a mano: `prefers-reduced-motion` y sin JS → 0 nodos ocultos, sin palabras partidas;
`data-lz-motion="none"` → el runtime ni se inyecta; Básico → mismo HTML sin runtime (las 6 plantillas
del kit compilan pixel-idénticas tras el cambio de tokens); al saltar a media sección (ancla o scroll
rápido) lo visible aparece de inmediato y lo de más abajo espera a su ancla.
