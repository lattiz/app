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


---

# Motion v3 — auditoría (WP0)

Fecha: 2026-10-11. Pilotos: `barberia-norte-v1` y **`barberia-oxido-v1`** (confirmado por Santi; había
tres candidatos con «óxido»: esta plantilla Pro del kit, la Básico `barberia-v1` «Barbería Premium»
con la marca ÓXIDO dentro de su JSON, y el export de Studio `packages/template-kit/fixtures/oxido`).
Medido sobre el HTML de los previews (assets en R2) con Motion v2 y el clasificador del seed.

## Percepción en móvil: cuándo se dispara vs. cuándo se ve (WP0.1–0.2)

Herramienta: Playwright con emulación móvil (390×844, 360×640, 844×390, DPR 2, touch) y escritorio
(1440×900, 1366×768, 1920×1080); scroll continuo a 900 px/s (lectura) y 2 500 px/s (flick). Por cada
elemento animado: distancia recorrida (`translate` resuelto al arrancar), duración, alto, `scrollY` al
dispararse y al entrar al viewport, y si al entrar la animación ya había terminado, estaba en curso o
aún no empezaba.

| Viewport (900 px/s) | Norte: espera tras entrar (mediana / p90) | ÓXIDO: espera (mediana / p90) | Terminó antes de verse | Recorrido | Duración | Recorrido / alto (mediana) |
|---|---|---|---|---|---|---|
| 390×844 | 100 / 103 ms | 100 / 101 ms | 0 | 32 px | 880 ms | 23 % |
| 360×640 | 68 / 84 ms | 67 / 87 ms | 0 | 32 px | 880 ms | 21–22 % |
| 844×390 | 34 / 36 ms | 34 / 51 ms | 1 (hero, norte) | 32 px | 880 ms | 29–31 % |
| 1440×900 | 101 / 307 ms | 101 / 386 ms | 0 | 32 px | 880 ms | 25–26 % |
| 1366×768 | 84 / 369 ms | 84 / 370 ms | 0 | 32 px | 880 ms | 25–26 % |
| 1920×1080 | 134 / 324 ms | 134 / 498 ms | 0 | 32 px | 880 ms | 25–26 % |

Al dispararse, cada elemento ya muestra de mediana 81 px (390×844), 54 px (360×640) y 84–107 px
(escritorio) dentro de la pantalla; a 2 500 px/s la espera baja a 17–34 ms pero el p90 de escritorio
sigue en 200–500 ms (son los escalones de cascada, hasta 8 × 95 ms).

**Hallazgo principal (bug, no hipótesis): contenido que se queda invisible.** En 360×640 Norte deja
8 elementos y ÓXIDO 40 (galería y equipo completos) en `opacity: 0` para siempre, aun volviendo a
subir. Dos causas, ambas en el runtime v2:

1. **Ancla diferida que se borra a sí misma.** Cuando un ancla se dispara, `play()` recalcula qué
   está «en pantalla» con `top < 0.88 × vh`; el observer usa `rootMargin: -12%` y redondea distinto.
   Si el ancla queda en la frontera (sub-píxel), `play()` la vuelve a elegir como siguiente ancla y la
   registra *dentro* del callback del observer, que justo después borra el watcher de ese elemento.
   La cadena de esa sección se corta. Es intermitente (depende de la posición exacta y del DPR).
2. **Franja inferior muerta.** Con `rootMargin` inferior negativo, lo que vive en el último 12 % de la
   página nunca cruza la línea (p. ej. la línea legal del footer). El failsafe de 2.5 s no lo cubre:
   solo actúa si el observer nunca reportó nada.

**Hipótesis:**

| | Resultado | Evidencia |
|---|---|---|
| **H1** se dispara por sección y lo de abajo termina antes de verse | **No se cumple en v2** | 0 elementos terminaron antes de verse (salvo 1 del hero en horizontal). Pasa lo contrario: entran ocultos y esperan. El problema real son las cadenas rotas de arriba. |
| **H2** distancias fijas en px pensadas para escritorio | **Se cumple (en parte)** | `--lz-dist` = 32 px (editorial) en todos los viewports; es 21–31 % del alto del elemento, perceptible en tarjetas bajas pero 5 % en tarjetas de 576 px (equipo de ÓXIDO en móvil). No escala con la pantalla. |
| **H3** el observer se dispara demasiado pronto en móvil | **No** | Se dispara cuando el elemento ya está 54–81 px dentro; si acaso, tarde. |
| **H4** duración/curva corta o reduced-motion/failsafe interfiriendo | **Parcial** | Duración 880 ms (editorial) / 640 ms (calm): no es corta. Reduced-motion no estaba activo. El failsafe **sí falla**: no cubre cadenas rotas ni la franja inferior. Además el hero escalona hasta ~700 ms: el CTA aparece tarde. |

## Viewport-fit (WP0.3)

`header` = alto del header sticky; disponible = `innerHeight − header`. Contenido = caja que une los
hijos visibles de la sección (sin su padding).

**barberia-norte-v1** — altura de contenido / 0.9 × disponible (✓ cabe, ✗ no cabe)

| Sección | 1440x900 | 1366x768 | 1280x720 | 1920x1080 | 390x844 | 360x640 | 844x390 |
|---|---|---|---|---|---|---|---|
| *header / disponible* | 130 / 770 | 130 / 638 | 130 / 590 | 130 / 950 | 75 / 769 | 75 / 565 | 85 / 305 |
| hero/split | 649/693 ✓ | 651/574 ✗ | 650/531 ✗ | 644/855 ✓ | 774/692 ✗ | 747/509 ✗ | 1061/275 ✗ |
| about/statement | 947/693 ✗ | 931/574 ✗ | 909/531 ✗ | 950/855 ✗ | 1053/692 ✗ | 1054/509 ✗ | 691/275 ✗ |
| services/editorial-table | 965/693 ✗ | 965/574 ✗ | 960/531 ✗ | 965/855 ✗ | 1767/692 ✗ | 1767/509 ✗ | 1375/275 ✗ |
| team/list | 917/693 ✗ | 914/574 ✗ | 911/531 ✗ | 919/855 ✗ | 790/692 ✗ | 787/509 ✗ | 889/275 ✗ |
| gallery/strip | 688/693 ✓ | 685/574 ✗ | 679/531 ✗ | 690/855 ✓ | 613/692 ✓ | 580/509 ✗ | 659/275 ✗ |
| testimonials/quote-feature | 736/693 ✗ | 718/574 ✗ | 641/531 ✗ | 737/855 ✓ | 963/692 ✗ | 963/509 ✗ | 704/275 ✗ |
| faq/two-col | 1006/693 ✗ | 1006/574 ✗ | 1006/531 ✗ | 1006/855 ✗ | 1444/692 ✗ | 1538/509 ✗ | 1266/275 ✗ |
| locations/with-contact | 898/693 ✗ | 893/574 ✗ | 886/531 ✗ | 902/855 ✗ | 1675/692 ✗ | 1672/509 ✗ | 1072/275 ✗ |
| footer/minimal-centered | 370/693 ✓ | 370/574 ✓ | 369/531 ✓ | 370/855 ✓ | 471/692 ✓ | 471/509 ✓ | 351/275 ✗ |

**barberia-oxido-v1** — altura de contenido / 0.9 × disponible (✓ cabe, ✗ no cabe)

| Sección | 1440x900 | 1366x768 | 1280x720 | 1920x1080 | 390x844 | 360x640 | 844x390 |
|---|---|---|---|---|---|---|---|
| *header / disponible* | 85 / 815 | 85 / 683 | 85 / 635 | 85 / 995 | 75 / 769 | 75 / 565 | 85 / 305 |
| hero/image-bg | 900/734 ✗ | 804/615 ✗ | 778/572 ✗ | 1080/896 ✗ | 844/692 ✗ | 754/509 ✗ | 600/275 ✗ |
| about/text-image-offset | 793/734 ✗ | 793/615 ✗ | 793/572 ✗ | 793/896 ✓ | 1317/692 ✗ | 1322/509 ✗ | 1665/275 ✗ |
| services/price-list | 977/734 ✗ | 977/615 ✗ | 977/572 ✗ | 977/896 ✗ | 2019/692 ✗ | 2172/509 ✗ | 1630/275 ✗ |
| gallery/grid | 855/734 ✗ | 851/615 ✗ | 846/572 ✗ | 857/896 ✓ | 1073/692 ✗ | 1068/509 ✗ | 1397/275 ✗ |
| locations/with-contact | 903/734 ✗ | 895/615 ✗ | 877/572 ✗ | 907/896 ✗ | 1641/692 ✗ | 1636/509 ✗ | 1078/275 ✗ |
| team/grid | 684/734 ✓ | 680/615 ✗ | 675/572 ✗ | 686/896 ✓ | 2691/692 ✗ | 2533/509 ✗ | 1455/275 ✗ |
| testimonials/cards | 485/734 ✓ | 485/615 ✓ | 485/572 ✓ | 485/896 ✓ | 1261/692 ✗ | 1315/509 ✗ | 852/275 ✗ |
| faq/list | 1383/734 ✗ | 1379/615 ✗ | 1374/572 ✗ | 1386/896 ✗ | 1724/692 ✗ | 1810/509 ✗ | 1349/275 ✗ |
| footer/big-wordmark | 566/734 ✓ | 553/615 ✓ | 537/572 ✓ | 569/896 ✓ | 895/692 ✗ | 895/509 ✗ | 945/275 ✗ |

Lectura:

- **Header de Norte: 130 px** (fila de 84 px + navegación de 46 px), no ~290 px como decía el brief;
  sigue siendo el más caro (ÓXIDO: 85 px).
- **Hero de Norte**: cabe en 1440×900 y 1920×1080 pero la imagen termina en 906 px (recortada en
  900); a 1366×768 y 1280×720 el CTA cae bajo el pliegue (822 y 809 px). Titular 90–104 px.
- **Hero de ÓXIDO**: alto = `100vh` completo sin descontar el header, titular de 150–168 px en
  escritorio; **el CTA queda bajo el pliegue en todos los tamaños de escritorio** y en 360×640.
- Las secciones de contenido (servicios, FAQ, sucursales, galería, equipo) no caben ni deben caber:
  fluyen. Composición (hero, about en dos columnas) sí son candidatas a encajar.
- Horizontal 844×390: nada cabe (305 px disponibles); se tratará con el fallback `max-height: 560px`.
- No hay scroll horizontal en ningún viewport.

## Referencia flor-coco (WP0.5, solo técnica)

Hero a `height: 100dvh` con la navegación como píldora flotante encima (no consume alto del flujo),
titular moderado y bloque de texto+CTA anclado abajo. Tomamos la técnica (unidades de viewport,
header que no resta altura) con `svh` en vez de `dvh` para evitar saltos de la barra del navegador.

## Línea base (WP0.6)

| Métrica (Lighthouse móvil, mediana de 3) | Norte v2 | ÓXIDO v2 |
|---|---|---|
| Score | 88 | 79 |
| LCP | 3 231 ms (imagen del hero) | 3 021 ms (imagen del hero) |
| CLS | 0.120 | 0.207 |
| TBT | 0 ms | 0 ms |
| Runtime | 22 557 B min · 8 068 B gzip | igual |
| Observados | máx. 10 a la vez, ~50 `observe()` por recorrido | máx. 11, ~60 |

CLS de carga en ambos: «Web font loaded» (Playfair / Anton reacomodan el titular). No es motion.
