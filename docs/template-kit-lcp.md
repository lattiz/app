# LCP de las plantillas: diagnóstico, política para lo nuevo y retrofit propuesto

Fase A2 · WP5 (2026-10-14). Números de **laboratorio**: Lighthouse 12 con su emulación móvil
(throttling simulado tipo 4G lento) sobre la vista previa local estática de `lattiz check` (sin CDN,
`noindex`). Sirven para comparar plantillas y cambios entre sí; no son datos de campo. Reportes
completos en `.lattiz/shots/<id>/lighthouse.json` (`lattiz check <id> --lighthouse` ahora los guarda).

## Diagnóstico (las 6 de la línea base de A1)

| Plantilla                    | LCP    | FCP    | Elemento LCP                        | Foto de portada                   | Fases (Lighthouse)                     | Hoja de fuentes bloqueante |
| ---------------------------- | ------ | ------ | ----------------------------------- | --------------------------------- | -------------------------------------- | -------------------------- |
| `barberia-base-abeto-v1`     | 1.95 s | 1.72 s | `img.lz-hero__image` (`hero/split`) | 90 KiB, 1600×1000, placeholder    | TTFB 451 ms · carga 0 · render 1502 ms | 819 ms                     |
| `barberia-abeto-v1`          | 1.98 s | 1.86 s | `img.lz-hero-arch__image`           | 70 KiB, 1200×900, placeholder     | TTFB 451 · carga 0 · render 1532       | 812 ms                     |
| `restaurante-base-ceniza-v1` | 3.00 s | 2.49 s | `img.lz-hero-arch__image`           | 159 KiB, 1200×900, **foto real**  | TTFB 451 · carga 0 · render 2551       | 816 ms                     |
| `restaurante-ceniza-v1`      | 3.98 s | 3.08 s | `img.lz-hero__image` (`hero/split`) | 202 KiB, 1600×1000, **foto real** | TTFB 451 · retraso 112 · render 3398   | 814 ms                     |
| `clinica-base-cauce-v1`      | 2.94 s | 2.94 s | `img.lz-hero-arch__image`           | 53 KiB, 1200×900, placeholder     | TTFB 453 · carga 0 · render 2490       | 823 ms                     |
| `clinica-cauce-v1`           | 1.86 s | 1.86 s | `img.lz-hero__image`                | 61 KiB, 1600×1000, placeholder    | TTFB 451 · carga 0 · render 1413       | 813 ms                     |

Lo que **no** es: en las seis la foto de portada ya lleva `fetchpriority="high"`, nunca
`loading="lazy"` y `width`/`height` (CLS ≤ 0.006). Lattiz Motion tampoco: el runtime nunca oculta la
foto de portada («settle», sin desvanecer) y tiene una guarda para el titular; Básico y Pro de la
misma barbería dan 1.95 / 1.98 s. No hay `srcset` ni `sizes` en el kit (una sola foto por clave), así
que no hay un `sizes` equivocado.

Lo que **sí** es, por orden de peso:

1. **La hoja de Google Fonts bloquea el primer pintado** (~815 ms en las seis). El FCP sale de
   1.7 a 3.1 s con fuentes; en el experimento sin la hoja baja a ~1 s. Es **defecto real** (la misma
   `<link>` viaja en el `.grapesjs` y la exporta el editor), no un artefacto de la vista previa,
   aunque en producción el CDN de Google suele estar caliente.
2. **El peso de la foto de portada** cuando es una foto real pesada (`restaurante-ceniza`: 159 y
   202 KiB). **Defecto real**: en producción la foto de la plantilla se sirve tal cual hasta que el
   cliente sube la suya (las que sube el cliente sí pasan por el optimizador WebP de la API).
3. Los **placeholders** (53–90 KiB) son artefacto de la vista previa: pesan poco y no explican las
   diferencias. El TTFB de 451 ms es simulado.

## Experimento: retrofit medido en copias temporales

Copias de `dist/<id>` en una carpeta temporal, revisadas con `lattiz check <id> --root <copia>
--lighthouse` (nada del kit cambió). V1 = foto de portada recodificada a ≤ 1200 px y calidad 72
(mozjpeg). V2 = sin la hoja de fuentes (cota de lo que da sacarla del camino crítico). V3 = ambas.

| Plantilla               | Base          | V1 (foto)      | V2 (fuentes)   | V3 (ambas)         |
| ----------------------- | ------------- | -------------- | -------------- | ------------------ |
| `restaurante-ceniza-v1` | LCP 3.98 s    | 3.32 s (−0.66) | 2.93 s (−1.05) | **2.18 s (−1.80)** |
| foto / bytes totales    | 202 / 623 KiB | 105 / 525 KiB  | 202 / 558 KiB  | 105 / 461 KiB      |
| `clinica-base-cauce-v1` | LCP 2.94 s    | 2.94 s (0)     | 1.50 s (−1.44) | **1.35 s (−1.59)** |
| foto / bytes totales    | 53 / 171 KiB  | 44 / 162 KiB   | 53 / 98 KiB    | 44 / 89 KiB        |

La foto solo importa cuando pesa; las fuentes importan siempre.

## Política para lo nuevo (aplicada en A2)

- **Portadas nuevas** (`bento`, `rail`, `overlap`, `stack`): foto principal con `fetchpriority="high"`,
  sin `lazy`, con `width`/`height`; la foto de detalle de `overlap` no compite (sin `fetchpriority`).
  Ninguna variante nueva oculta su contenido sin JS.
- **`lattiz build` de una plantilla que todavía no existe** codifica `hero.jpg` a ≤ 1200 px de ancho
  y calidad 72 (mismo recorte); las existentes conservan sus bytes.
- **Presupuesto** `images.hero` = 120 KiB en `budgets.json`: WARN para las existentes (hoy 5 lo pasan:
  127–202 KiB), FAIL al construir una plantilla nueva.
- **Fuentes:** sin JS en el kit no hay forma de cargar la hoja de Google sin bloquear; queda como
  propuesta (abajo). Lo que sí aplica a lo nuevo: los pares de la biblioteca piden un peso o un rango
  variable acotado (p. ej. `Onest:wght@400..600`), y el fallback métrico mantiene el CLS en ~0 si la
  fuente llega tarde.

## Retrofit propuesto (no aplicado: requiere re-baseline deliberado)

1. **Fotos de portada pesadas** (`restaurante-ceniza`, `restaurante-base-ceniza` y las otras tres
   que avisan): recodificar `assets/<giro>/<id>/hero.jpg` a ≤ 1200 px, q72. Cambia el hash de
   `assets` de esas plantillas en el golden (justificación: LCP −0.66 s medido) y requiere sembrarlas
   de nuevo. Riesgo bajo: mismo recorte.
2. **Hoja de fuentes fuera del camino crítico** (el cambio que más mueve: −1 a −1.4 s). Opciones, de
   menos a más invasiva:
   - a. En tenant-sites (`compose-site.ts`, fuera de A2): reescribir la `<link>` de Google Fonts a
     `rel="preload" as="style"` + hoja aplicada al cargar; el JS ya existe en sitios Pro (Motion) y es
     una línea en Básico. Toca todos los sitios publicados a la vez, sin re-sembrar.
   - b. En el kit: incrustar en el `<head>` las reglas `@font-face` que devuelve Google al compilar
     (los archivos siguen en `fonts.gstatic.com`, sin origen nuevo). Quita una ida y vuelta, pero el
     CSS de Google cambia con el tiempo y la salida dejaría de ser determinista: habría que congelarlo
     por plantilla.
   - c. Mover la `<link>` al final del `<body>`: sin JS, pero el editor vuelve a ponerla en el
     `<head>` al cambiar de tipografía (`applyFontLink`), así que no sobrevive a una edición.
     Recomendación: **a**, con su propio PR y medición en un sitio de prueba.
3. **Imágenes debajo del pliegue:** ya van con `loading="lazy"` en todas las variantes que las tienen
   (about, gallery, team, locations, `product-grid`); no hace falta retrofit.
