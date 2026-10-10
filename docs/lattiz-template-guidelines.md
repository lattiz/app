# Guía para construir plantillas en Lattiz

Cómo diseñar una plantilla nueva para que funcione sin fricción en el editor de
Lattiz (GrapesJS Studio SDK) y en los sitios publicados de los tenants.

> Reemplaza la guía anterior que pedía construir todo en `app.grapesjs.com`,
> publicar en `templates.lattiz.com`, subir a Supabase Storage y tomar el
> thumbnail a mano. Nada de eso aplica ya.

---

## Regla central

**Las plantillas son código fuente en `packages/template-kit`.** Ya no se
diseñan en GrapesJS Studio ni se depende de su exportación de pago o de su IA.
Un compilador convierte las piezas en lo mismo que producía Studio:

```
sections/<slot>/<variant>/{section.html, section.css, meta.ts}   piezas reutilizables
core.css                                                         clases compartidas
themes/<tema>.json                                               única fuente de tokens (identidad de la plantilla)
content/<rubro>.<voz>.es-MX.ts                                   textos y datos del negocio, una voz por arquetipo
blueprints/<familia>.ts                                          qué slots existen y en qué orden
templates/<id>.ts  ── kit:build ──▶  dist/<id>/{<id>.grapesjs, index.html, thumbnail.jpg, review/}
```

El último paso humano sigue siendo `scripts/parse-and-seed-template.ts`.

---

## Lo que SÍ

- **Una sola página** con secciones; cada sección es un `slot` con
  `data-lz-slot` y `data-lz-variant` en su elemento raíz.
- **CSS plano con clases `lz-*` BEM** (`lz-bloque__elemento--modificador`),
  en `section.css` o, si lo usa más de un slot, en `core.css`.
- **Todo color es un token** `var(--lz-color-*)`; tintes y transparencias con
  `color-mix(in srgb, var(--lz-color-x) N%, transparent)`. El único literal
  permitido fuera de `:root` es el verde de WhatsApp `#25D366`.
- **Dos radios:** `--lz-radius-pill` (botones, chips, íconos) y
  `--lz-radius-card` (tarjetas, paneles, mapas, marcos de foto; máx. 32px).
- **Breakpoints solo 992px y 480px.**
- **Toda animación o transición** tiene su override en
  `@media (prefers-reduced-motion: reduce)`.
- **Un único `<h1>`** (la portada) y `alt` descriptivo en cada imagen.
- **Imágenes locales** en `assets/<rubro>/<tema>/`; si falta un archivo, el
  compilador genera un placeholder con la paleta del tema. El seed las sube a R2.
- **Cada plantilla se distingue a tamaño miniatura:** tema, par tipográfico,
  acento, titular y portada propios; `kit:compare-visual` y
  `dist/_contact-sheet.png` lo comprueban.
- **Fuentes de Google Fonts** declaradas en el tema (`fonts.googleFonts`).
- **Contenido realista** para el rubro, nunca Lorem Ipsum, en el content pack.

## Lo que NO

- Tailwind, utilidades sueltas, CSS-in-JS o frameworks: el sitio publicado es
  HTML/CSS plano sin build.
- `style=""` en línea (GrapesJS lo convierte en reglas `#id` difíciles de editar).
- JavaScript en las secciones (`<script>`, `on*=`, `javascript:`).
- Formularios (`<form>`): el contacto son botones de WhatsApp, `tel:`, `mailto:` y mapa.
- Imágenes hotlinkeadas (Unsplash, CDNs de terceros).
- Clases `.gjs-t-*` ni el data source `globalStyles` de Studio: el editor de
  Lattiz no activa ese panel; los tokens `--lz-*` son el único sistema.
- Multi-página.

---

## Flujo

1. **Elige el tier y lee su blueprint** (`blueprints/service-landing.basic.ts`
   o `.pro.ts`): roles obligatorios, variantes permitidas, posiciones fijas y
   arquetipos. Tiers, conteo de secciones y contrato SEO: `docs/template-tiers.md`.
2. **Escribe el manifiesto** `templates/<rubro>-<nombre>-v1.ts`: `tier`, tema, content
   pack, orden de secciones, overrides de negocio (`business`) y por sección
   (`props`).
3. Si el rubro es nuevo, **escribe su content pack** `content/<rubro>.es-MX.ts`
   (usa `{{name}}`, `{{phone}}`, `{{address}}`, `{{whatsappUrl}}` o
   `{{whatsappUrl:mensaje}}`, `{{index}}` en secciones numeradas).
4. **Construye:** `pnpm --filter @lattiz/template-kit kit:build templates/<id>.ts`
   (compila, valida y toma capturas).
5. **Revisa** `dist/<id>/thumbnail.jpg` y `dist/<id>/review/*.png` (escritorio
   completo, móvil 390px). Corrige hasta que `kit:validate` pase: color,
   contraste WCAG AA por tema, rango de secciones y roles del tier, similitud
   contra plantillas del mismo rubro y tier (Basic ≤ 0.85, Pro ≤ 0.5) y
   unicidad de tema, tipografía, acento y titular. Corre `kit:compare-visual`
   y revisa `dist/_contact-sheet.png`.
6. **Siembra** con el comando que imprime `kit:build` (desde la raíz del repo):

```bash
pnpm tsx scripts/parse-and-seed-template.ts \
  --dir packages/template-kit/dist/<id> \
  --id <id> --name "<Nombre>" --category <categoría> --description "<…>"
```

El seed valida el proyecto, sube las imágenes locales a R2
(`https://assets.lattiz.app/templates/<id>/…`), escribe
`apps/template-previews/public/<id>/index.html`, hace upsert en
`public.templates`, despliega las vistas previas en
`https://templates.lattiz.app/<id>`, toma el thumbnail 1280×800 de esa URL y
activa la plantilla. Detalle de etapas y flags: `docs/adding-templates.md`.

Para portar un diseño existente (export de Studio o HTML+CSS):
`kit:extract <archivo> --vertical <rubro> --variant <nombre>` lo corta por
`data-lz-slot` en `extracted/…` para curarlo a mano antes de llevarlo a la
biblioteca.

---

## Verificación final

- [ ] `kit:build` termina sin hallazgos.
- [ ] Las capturas muestran texto legible en todas las secciones, sin imágenes rotas.
- [ ] Cada ancla del menú y del pie lleva a una sección presente.
- [ ] Tras el seed: `https://templates.lattiz.app/<id>` carga con imágenes de
      `assets.lattiz.app`, y `/dashboard/templates` muestra thumbnail y vista previa.
- [ ] Se commitea `apps/template-previews/public/<id>/index.html`.
