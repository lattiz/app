# Principios de diseño del template kit

Reglamento corto y con opinión para las variantes, paletas, tipografías y arquetipos nuevos del kit
(`docs/template-kit-catalog.md`). Sale de leer dos colecciones de skills de diseño, **destiladas y
adaptadas** a lo que el kit puede hacer (HTML + CSS por sección, tokens `--lz-*`, sin JS en Básico,
Lattiz Motion propio en Pro). Cuando una regla de aquí choca con un invariante del kit (snapshot,
tiers, contrato de Motion, presupuestos de peso, validador), **gana el invariante**.

## Créditos y versiones

- **taste-skill** de Leonxlnx (`github.com/Leonxlnx/taste-skill`, licencia MIT), commit `d237dd3`
  (2026-10-12): `design-taste-frontend` (v2, marcada como experimental), `redesign-existing-projects`,
  `high-end-visual-design`, `minimalist-ui`, `industrial-brutalist-ui`, `full-output-enforcement` y
  las notas de `research/`.
- **Skills de Emil Kowalski** (`github.com/emilkowalski/skill`, licencia MIT; el nombre que dio el
  fundador funcionó tal cual, sin la `s`), commit `2d22863`: `emil-design-eng`, `animate`,
  `review-animations`, `animation-performance`, `animation-vocabulary`,
  `find-animation-opportunities`, `mobile-native`, `break-ui`, `apple-design` y
  `performance-cheatsheet.md`.
- Instaladas **en el ámbito del usuario** (`npx skills add <repo> -g -a claude-code --copy`, quedan en
  `~/.claude/skills/`), **no en el repo**. No se ejecutó ningún script de esos repos; se leyeron como
  material de referencia. Aquí todo está parafraseado; no hay pasajes copiados.
- Fuera de alcance (no se leyeron): generación de imágenes, `image-to-code`, `stitch`, `write-swift`,
  `animate-expo`, `ask-sonner`, `pick-ui-library`, y todo lo que da por hecho React, Tailwind o GSAP.

**Volver a destilar cuando cambien los repos:** `npx skills add <repo> --list` para ver qué hay,
`npx skills add <repo> -g -a claude-code --copy --skill <nombre>…` para actualizar, comparar con el
commit de arriba (`git ls-remote <repo> HEAD`) y releer solo lo que cambió. Si una regla nueva choca
con un invariante, se anota en «Lo que no tomamos». Las skills nunca agregan dependencias, fuentes
externas ni scripts al kit.

## 1. Diales de gusto → palancas del kit

taste-skill ajusta tres diales del 1 al 10 antes de diseñar (por defecto 8 / 6 / 4) y exige
justificarlos desde el encargo. En el kit se vuelven palancas concretas:

| Dial                                        | 1–3                                                           | 4–7                                                                | 8–10                                                     | Palanca del kit                                                                           |
| ------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Variación** (simetría → asimetría)        | retícula simétrica, todo centrado; portada centrada permitida | desfases, proporciones mezcladas, títulos alineados a la izquierda | mosaico/bento, fracciones `2fr 1fr`, mucho espacio vacío | arquetipo + variante de portada y de galería (`split` asimétrico, bento, masonry)         |
| **Densidad** (galería → cabina)             | 128–192 px entre secciones                                    | 64–96 px                                                           | compacto, filetes de 1 px en vez de tarjetas             | `density` (`airy` · `cozy` · `compact`) + `rhythm`; ≥ 7 → `surface: flat` + `divider`     |
| **Movimiento** (estático → cinematográfico) | sin animación automática; solo `:hover`/`:active`             | transiciones de `transform`/`opacity`; revelado en secciones clave | coreografía de scroll, parallax                          | preset de Motion: ≤ 3 `none` (todo Básico) · 4–5 `calm` · 6–7 `editorial` · 8+ no se hace |

Reglas de los diales que adoptamos: con variación > 4 no hay portada centrada (salvo un arquetipo
`minimal`/`trust` que lo pida); con movimiento > 4 el movimiento **se tiene que ver** (portada,
revelado en secciones clave, estado del CTA) o se baja a 3 y se entrega estático; con densidad > 7 no
hay tarjetas genéricas.

**Diales por arquetipo** (Básico siempre con movimiento `none`; el arquetipo fija los presets de
WP3, el spec puede moverlos):

| Arquetipo   | V / M / D | Intención                                        | shape | surface  | density | divider  | imageTreatment  | typeScale  | Motion (Pro) |
| ----------- | --------- | ------------------------------------------------ | ----- | -------- | ------- | -------- | --------------- | ---------- | ------------ |
| `editorial` | 6 / 5 / 3 | revista: tipografía grande, filetes, aire        | sharp | flat     | airy    | hairline | offset          | expressive | calm         |
| `showcase`  | 8 / 6 / 3 | el trabajo primero: galería y fotos dominan      | soft  | flat     | airy    | none     | plain           | normal     | editorial    |
| `catalog`   | 5 / 4 / 6 | menú/productos/precios arriba, se escanea rápido | soft  | outlined | cozy    | hairline | plain           | normal     | calm         |
| `booking`   | 4 / 4 / 5 | conversión: CTA de cita/WhatsApp siempre a mano  | round | elevated | cozy    | none     | framed          | normal     | calm         |
| `trust`     | 3 / 4 / 5 | credenciales, equipo, proceso, muchas preguntas  | soft  | outlined | cozy    | hairline | plain           | tight      | calm         |
| `bold`      | 9 / 7 / 4 | cartel: condensada en mayúsculas, oscuro, cinta  | sharp | flat     | compact | rule     | duotone-overlay | expressive | editorial    |
| `soft`      | 5 / 5 / 3 | amable: redondo, fondos teñidos, arcos           | pill  | tinted   | airy    | none     | arch            | normal     | calm         |
| `minimal`   | 5 / 4 / 2 | suizo: texto manda, filetes finos, una sola foto | sharp | flat     | airy    | hairline | plain           | tight      | calm         |

Lectura por giro (orientativa, el WP7 la fija): confianza (clínica, dental, despacho, veterinaria)
3–4 / 3–4 / 4–5; consumo cuidado (estética, florería) 6–7 / 5 / 3; cartel (barbería, gimnasio) 8–9
/ 6–7 / 3–4; restaurante 6 / 4–5 / 3; tienda 5 / 4 / 5–6. **Los diales nunca saltan el blueprint, la
unicidad ni las reglas de Básico y Pro.**

## 2. Contra lo genérico

### Composición

- **Nada de tres tarjetas idénticas con icono en fila.** Alternativas: lista con precio a dos
  columnas, zigzag de dos, retícula asimétrica, tira con scroll-snap, bento con celdas distintas.
- **Nada centrado por defecto.** Títulos de sección alineados a la izquierda; lo centrado se usa a
  propósito (cita grande, cierre), no por inercia.
- **Una familia de composición una vez por página**; 8 secciones usan al menos 4 familias; como máximo
  dos «imagen + texto» seguidas (la tercera es falla).
- **Encabezado de sección apilado** (título, luego texto), no título enorme a la izquierda con
  explicación flotando a la derecha.
- **Bento con N celdas para N elementos**, sin celdas vacías, y al menos 2–3 celdas con variación real
  (foto, tinte, patrón).
- **Portada:** cabe en la primera pantalla (nuestro `data-lz-fit`), titular ≤ 2 líneas en escritorio,
  texto de apoyo ≤ 20 palabras, como máximo 4 elementos de texto (antetítulo, titular, apoyo, CTAs:
  uno principal y uno secundario), el CTA a la vista sin scroll. Sin listas, sellos de confianza ni
  avatares dentro de la portada: van en la sección siguiente.
- **Listas de más de 5 elementos** con otra forma (dos columnas agrupadas, retícula, `<details>`), no
  un renglón con filete cada uno.
- **Un tema por página:** ninguna sección invierte el tema a media página (los tintes de la misma
  familia sí).
- **Tarjetas solo cuando la elevación significa jerarquía**; si no, agrupar con filete superior,
  separadores o aire.

### Tipografía

- Jerarquía con **peso, tamaño e interlínea juntos**; usar 500 y 600, no solo 400 y 700.
- Interlínea inversa al tamaño: display ≈ 0.9–1.1, cuerpo ≈ 1.5–1.6. Tracking según tamaño: display
  negativo (−0.01 a −0.03 em), cuerpo 0, etiquetas pequeñas positivo (+0.04 a +0.1 em).
- Cuerpo a **45–75 caracteres** por línea; `text-wrap: balance` en títulos y `pretty` en párrafos;
  cifras tabulares (`font-variant-numeric: tabular-nums`) en precios, horarios y estadísticas.
- **Antetítulos (kicker/eyebrow) con medida**: idealmente uno cada tres secciones; nunca el número de
  sección como antetítulo («01 · Servicios»), ni texto vertical rotado.
- Palabras de acento en itálica: con descendentes (g, j, p, q, y) la interlínea del título ≥ 1.1 o
  reserva inferior, para que no se recorten.
- La serif no es el comodín de «creativo»: se usa cuando el giro y el tono la piden (editorial,
  tradición, lujo), y se rota entre plantillas del mismo giro.

### Color

- **Un acento por página** (saturación contenida) y **una familia de grises** (no mezclar fríos y
  cálidos). Sin negro ni blanco puros: tinta y papel.
- Sin degradados en texto, sin halos, sin el resplandor morado/azul de «hecho con IA».
- Sombras teñidas con el color del fondo y una sola dirección de luz; nunca sombras negras duras salvo
  el arquetipo `bold` (sombra desplazada, decisión de marca).
- **Ojo con el cliché «crema + latón + espresso»** (fondos crema, acentos ocre/arcilla/vino, texto café
  muy oscuro): las paletas nuevas lo evitan como opción por defecto y rotan familias (frío elegante,
  bosque, negro + tostado, cobalto + crema, terracota + pizarra, oliva + ladrillo + papel, monocromo
  con un solo acento).

### Imágenes

- Toda portada lleva una imagen real (o el placeholder dirigido del kit hasta que llegue); nada de
  «texto + mancha de degradado».
- Sin etiquetas o píldoras encima de las fotos (el pie va abajo), sin créditos falsos decorativos, sin
  capturas falsas hechas con `div`, sin ilustraciones SVG decorativas hechas a mano.
- Fotos con `aspect-ratio` + `object-fit: cover` y un fondo de respaldo con el token de superficie si
  la imagen falta; cada `<img>` con `alt` que describe la foto (sin emoji).
- Como máximo **una cinta (marquee)** por página.

### Clichés que no entran en una plantilla

Tres tarjetas iguales con icono · todo centrado · portada con degradado genérico · iconos emoji
decorativos · collage de fotos de stock sin jerarquía · antetítulo numerado en cada sección · puntos
de estado decorativos · «scroll para descubrir» · barras de confianza dentro de la portada · el mismo
botón con cinco textos distintos.

## 3. Copy es-MX sin relleno

- **Aperturas y muletillas de IA a evitar** (se vuelven heurística WARN en `spec validate --strict`,
  Parte 3): «eleva/lleva al siguiente nivel», «sin complicaciones», «desata», «de vanguardia»,
  «revoluciona», «sumérgete/adéntrate», «un tapiz de», «en el mundo de…», «experiencia única/
  inigualable», «más que un…», «tu mejor versión», «calidad premium», «transforma tu…».
- **Sin promesas ni superlativos** (ya es regla del kit): nada de «garantizado», «el/la mejor», «número
  uno», «100 %», curas o resultados.
- **Rayas (—) con medida:** se usan poco; un punto, coma, dos puntos o paréntesis casi siempre leen
  mejor. Rangos con guion o «a» («10:00 a 20:00»). Como máximo un `·` por renglón.
- **Mayúsculas de oración**, no de título («Nuestros servicios», no «Nuestros Servicios»); nada de
  gritar en mayúsculas fuera de los estilos display.
- **Un texto por intención de CTA en toda la página** (si es «Agenda tu cita», lo es en el menú, la
  portada y el pie), ≤ 3 palabras.
- Etiquetas llanas: «Servicios», «Horarios», «Opiniones»; nada de «Bitácora», «Desde el taller», «Hecho
  con alma».
- Cifras creíbles y marcadas como ejemplo; nombres ficticios variados y regionales; ninguna persona,
  marca ni negocio real.
- Antes de entregar, **releer cada cadena** (alt y pie incluidos): lo aburrido y claro gana a lo
  ingenioso.

## 4. Interacción y movimiento (Emil Kowalski)

Filosofía: la mejor animación a veces es ninguna; lo que se ve 100 veces al día no se anima; cada
movimiento tiene un propósito nombrable (retroalimentación, estado, continuidad espacial, evitar un
cambio brusco, explicar, y deleite solo en lo raro). Para un sitio de negocio que se visita de vez en
cuando, el revelado al hacer scroll es legítimo; los enlaces y CTAs llevan presión y un hover sutil.

**Tokens de interacción** (WP3; solo los usan las variantes nuevas):

| Token              | Valor                             | Para qué                                                |
| ------------------ | --------------------------------- | ------------------------------------------------------- |
| `--lz-ease-out`    | `cubic-bezier(0.23, 1, 0.32, 1)`  | entrar, salir, presión: el valor por defecto            |
| `--lz-ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | algo que ya está en pantalla y se mueve                 |
| `--lz-dur-press`   | `120ms`                           | `:active`                                               |
| `--lz-dur-ui`      | `160ms`                           | hover, cambios de color, iconos                         |
| `--lz-dur-reveal`  | `240ms`                           | aparecer/ocultar dentro de una sección (nunca > 300 ms) |
| `--lz-press-scale` | `0.97`                            | botones y tarjetas pulsables                            |

Reglas para todo CSS nuevo:

1. **Solo `transform` y `opacity`** en transiciones y animaciones (componen en GPU). Excepción
   acotada: cambios de color en hover (`color`, `background-color`, `border-color`) con
   `--lz-dur-ui`, que pintan pero no mueven el layout. **Nunca** `width`, `height`, `margin`,
   `padding`, `top/left`, `border-width` ni `box-shadow` animados (para «levantar» una tarjeta:
   `transform` + `filter: drop-shadow()` o nada).
2. **Nunca `transition: all`**, nunca desde `scale(0)` (mínimo 0.95 y siempre con opacidad), nunca
   `ease-in` en interfaz.
3. **Hover solo bajo `@media (hover: hover) and (pointer: fine)`** (Emil exige el par; es más estricto
   que solo `(hover: hover)` y evita el hover pegado en teléfonos). El toque se responde con
   `:active`, que va **sin** media query.
4. **Presión:** todo lo pulsable lleva `:active { transform: scale(var(--lz-press-scale)) }` con
   `--lz-dur-press` y `--lz-ease-out`; la salida es más rápida que la entrada.
5. **Foco:** `:focus-visible` con anillo de alto contraste que aparece **al instante** (sin
   transición: lo que se hace con teclado no se anima).
6. **`prefers-reduced-motion`:** menos y más suave, no cero. Se quitan desplazamientos y escalas; se
   puede conservar un cambio de opacidad o color corto. El validador ya exige el override.
7. **Nada de** parallax, fondos de pantalla completa en movimiento, ciclos lentos (~0.2 Hz), pulsos o
   brillos perpetuos, botones magnéticos, cursores especiales.
8. `will-change` solo después de ver un salto de 1 px o caída de cuadros medida, y nunca en
   contenedores grandes. Desenfoques animados < 20 px (mejor 2–5 px), y ninguno en Básico.

**Motion v3 en vocabulario estándar:** `cascade` = escalonado en orden del DOM (stagger); `wave` =
escalonado por la diagonal de la retícula; `center-out` = escalonado desde el centro; `converge` =
entradas desde los dos lados hacia el centro; `alternate` = entradas alternando lados (zigzag; no es
el «alternate/yoyo» de CSS). La barra de progreso es una animación ligada al scroll. Pasos de
escalonado de 30–80 ms con tope por grupo; nunca bloquear la interacción mientras revela. En Básico
nada empieza oculto: el estado inicial oculto solo existe si el runtime puso su clase.

## 5. Móvil nativo

- `100svh` para portadas y primeras pantallas (el kit ya usa `--lz-avail`); nunca `vh`/`lvh` ahí.
- Áreas seguras: barras fijas y el botón flotante con `env(safe-area-inset-*)` (requiere
  `viewport-fit=cover` en la meta del viewport; hoy el kit no la emite, así que es una mejora futura
  que **no** se aplica a plantillas existentes).
- `touch-action: manipulation` en botones y enlaces (sin el retraso de 300 ms);
  `-webkit-tap-highlight-color: transparent` **solo** si el elemento tiene su propio `:active`.
- `user-select: none` solo en botones-CTA, nunca en teléfonos, direcciones o correos (son contenido que
  el cliente copia).
- Tiras horizontales con `scroll-snap-type: x mandatory` nativo (sin JS); nunca `touch-action: none`
  en algo que se recorre.
- Objetivos táctiles ≥ 44 px; texto de cuerpo ≥ 16 px, nada < 14 px.

## 6. Estrés (break-ui)

Toda variante nueva se prueba con datos del peor caso, inyectados en el copy (no tocando el CSS):

- **Nombres:** muy largos con acentos («Peluquería y Barbería Hermanos Domínguez-Echeverría»), de una
  letra («J»), con partículas («de la Cruz y Ávila»), en minúsculas.
- **Cadenas sin cortes:** correos largos («contacto.reservaciones@barberiahermanosdominguez.com.mx»),
  URLs con parámetros, palabras compuestas largas.
- **Cantidades:** 0, 1, 3, 8 y 12 elementos (una retícula de uno no debe verse rota; una de 12 no debe
  volverse una pared).
- **Faltantes:** sin imagen, sin texto opcional, sin precio.
- **Títulos de tres líneas**, precios largos («Desde $1,250 MXN»), horarios con dos turnos, Ñ/Á/É en
  mayúsculas bajo interlíneas cortas.
- **Entornos:** 320, 360, 390, 768, 1024, 1366, 1440 px; zoom 200 %; tema claro y oscuro.

Arreglos típicos: `min-width: 0` (o `minmax(0, 1fr)`) en hijos de flex/grid; `overflow-wrap:
anywhere` para correos y URLs (no `word-break: break-all`); `flex-shrink: 0` en avatares e iconos;
`white-space: nowrap` en etiquetas cortas; `line-clamp` solo en vistas previas, **nunca** en precios,
horarios ni datos de contacto; `aspect-ratio` + `object-fit` + fondo de respaldo en imágenes. Cada
hallazgo se califica: **Roto**, **Feo** o **Frágil**.

## 7. Protocolos de revisión

Se usan en la galería (WP2), en cada variante nueva (WP6) y en la prueba de diversidad (WP9). Máximo
tres rondas por variante; el veredicto queda en la tabla de variantes.

**A. Pre-vuelo (taste-skill, adaptado)**

1. Intención de diseño en una línea (qué la distingue y para qué negocio) y diales razonados.
2. Silueta: a 1440 y a 390 se distingue de sus hermanas (otra retícula, alineación, proporción,
   tratamiento de imagen, jerarquía tipográfica), no es un cambio de piel.
3. Portada: cabe, ≤ 2 líneas de titular, ≤ 20 palabras de apoyo, ≤ 4 elementos de texto, CTA visible.
4. Composición: sin familia repetida, ≤ 2 zigzags seguidos, bento con N celdas, listas > 5 con otra
   forma, sin encabezado partido.
5. Tipografía: jerarquía por peso/tamaño/interlínea, 45–75 ch, antetítulos con medida, itálicas sin
   recorte.
6. Color: un acento, una familia de grises, AA en CTAs y velos, sin halo ni degradado en texto.
7. Imágenes: con `alt`, `aspect-ratio`, respaldo sin imagen, sin píldoras encima.
8. Copy: sin muletillas, sin superlativos, un texto por CTA, rayas con medida.
9. Movimiento: propósito en una frase, visible si el preset lo promete, solo transform/opacity,
   reduced-motion.
10. Móvil: colapso declarado para cada sección de varias columnas, táctiles ≥ 44 px, nada < 14 px.
11. ¿Es genérico? Si se parece a una plantilla cualquiera, no pasa.

**B. Auditoría de rediseño (para plantillas existentes, solo lectura en este trabajo)**

Escanear → decidir modo (conservar o rehacer) → auditar antes de tocar (tokens, arquitectura y rutas
de conversión, bloques que trabajan vs relleno, clichés, lectura de diales, SEO: títulos, JSON-LD,
OG) → diagnosticar (tipografía, color y superficies, composición, interacción, contenido, patrones,
iconos, omisiones: enlaces legales, salto al contenido, favicon, alt, enlaces `#` muertos) → arreglar
por palancas en orden (tipografía → ritmo → color → movimiento → recomponer portada/sección clave →
reemplazar bloque) y parar cuando el encargo se cumple. **Nunca cambiar en silencio:** anclas, nombres
de slot, tokens `{{lz:*}}`, textos legales.

**C. Revisión de movimiento (review-animations, estricta)**

Se bloquea si hay: `transition: all`, `scale(0)` o entrada solo con opacidad sin transform inicial (en
Pro; en reduced-motion sí vale), `ease-in`, animación en algo de teclado o de uso constante, > 300 ms
de interfaz sin razón, keyframes en algo que se dispara rápido, propiedades de layout o `box-shadow`
animados, `:hover` sin el media query, presión simétrica, falta de reduced-motion. Orden de arreglo:
borrar → reducir → curva → origen → interrumpible → GPU → asimetría → pulido → accesibilidad. En la
duda, se borra.

## 8. Guardia de originalidad

El objetivo es **extender la identidad del kit**, no importar la de otro. Cada variante, paleta o
arquetipo nuevo lleva una «intención de diseño» de una línea, no reproduce un sitio conocido ni los
ejemplos de las skills (sus paletas y fuentes de muestra no se copian: se toman las reglas), y se
critica contra la sección 2 en la galería antes de aceptarse.

## 9. Lo que no tomamos (y por qué)

- **Frameworks y JS:** React/Next, Tailwind, Framer Motion, GSAP, springs, gestos, scroll suave,
  parallax, botones magnéticos, texto que se revuelve. Lattiz Motion es nuestro runtime y Básico no
  lleva JS.
- **Fuentes y recursos externos:** auto-hospedar fuentes o usar Fontshare/fuentes de pago, CDNs de
  iconos o logos, `picsum`, imágenes generadas. El kit sigue con Google Fonts + fallback métrico
  (decisión `font-metric-fallbacks`) y sus placeholders dirigidos.
- **Efectos pesados:** vidrio/`backdrop-filter`, orbes de degradado, ruido global, scanlines, halftone.
  Cuestan pintado y estorban en el editor de GrapesJS.
- **Cortes 640/768/1024/1280 y `100dvh`:** el kit valida 992/480 y usa `svh`.
- **Modo oscuro con interruptor, estados de app (cargando, vacío, error), formularios, banner de
  cookies:** los sitios son estáticos y sin `<form>`.
- **«Cada vez un diseño distinto al azar»:** el kit es determinista (misma entrada, mismos bytes) y la
  diversidad la garantiza la compuerta de unicidad.
- **Contradicciones entre skills, resueltas:** serif (permitida por giro y tono, rotada; no prohibida
  ni por defecto), antetítulos (con medida, no en cada título), paletas crema (permitidas, pero no como
  defecto), píldora en el CTA principal (la decide `shape`), FAQ en acordeón (se queda `<details
open>`, decisión `faq-details-open-editor`), Inter (permitida como texto, no como display).
- **No se retroalimentan las plantillas existentes:** Fraunces e Instrument Serif siguen en sus pares
  legacy, los antetítulos y rayas del copy existente se quedan; las reglas aplican a lo nuevo (extender,
  nunca mutar). La auditoría de dos plantillas existentes (WP9) las lista como backlog.

## 10. Disciplina de entrega (full-output-enforcement)

De la skill de «salida completa» y su investigación sobre pereza de modelos solo tomamos disciplina:
ninguna variante o paquete de copy se entrega con lorem ipsum, `TODO` o `href="#"`; cada entrega dice
sus conteos (secciones, variantes, imágenes) y los verifica; lo largo se hace por partes. Sus cifras
de investigación tienen evidencia débil y no se usan como guía de diseño.
