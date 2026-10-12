# Catálogo del template kit

Inventario del kit, capacidad por giro y la extensión del catálogo (más portadas, secciones, paletas,
tipografías y estilos por giro) **sin cambiar nada de lo que ya existe**: extender, nunca mutar.
Guía de principios de diseño: `docs/template-kit-design-principles.md`.

## Estado de la extensión

Se trabaja en tres partes (Parte 1: cimientos; Parte 2: secciones y arquetipos; Parte 3: integración,
prueba de diversidad, docs y skill). Una sesión nueva retoma desde aquí. Estados: `pendiente` ·
`en curso` · `hecho` · `bloqueado`.

| WP    | Qué                                              | Estado    | Commits | Desviaciones |
| ----- | ------------------------------------------------ | --------- | ------- | ------------ |
| WP-1  | Línea base y snapshot dorado                     | en curso  |         | ver abajo    |
| WP0   | Inventario y modelo de capacidad                 | pendiente |         |              |
| WP0.5 | Skills de diseño: instalar, leer, destilar       | pendiente |         |              |
| WP1   | Versionado del catálogo (legacy/extended) y lock | pendiente |         |              |
| WP2   | Galería del kit y especímenes                    | pendiente |         |              |
| WP3   | Tokens de estilo                                 | pendiente |         |              |
| WP4   | Biblioteca de paletas                            | pendiente |         |              |
| WP5   | Biblioteca de pares tipográficos                 | pendiente |         |              |
| WP6   | Variantes de sección                             | pendiente |         |              |
| WP7   | Arquetipos de página y módulos verticales        | pendiente |         |              |
| WP8   | Registro, spec, compilador, CLI y skill          | pendiente |         |              |
| WP9   | Prueba de diversidad (local)                     | pendiente |         |              |
| WP10  | Documentación                                    | pendiente |         |              |

**Regla de cada WP:** `pnpm --filter @lattiz/template-kit kit:verify-snapshot` limpio, `pnpm lint`,
`pnpm typecheck` y build antes del commit.

### Línea base (WP-1, 2026-10-12)

- **Repo:** rama `claude/awesome-keller-ss1s44` reiniciada desde `main` (`cdafdc5`); el PR #3 (CLI
  Fase 1) ya está fusionado. Desde entonces `main` sumó la Fase 2–4: spec + compilador (`kit:spec`),
  registro de giros (10), skill `lattiz-template`, `services/product-grid`, imágenes por URL.
- **CodeGraph:** el índice `.codegraph/` está vacío y el ejecutable `codegraph` no existe en este
  contenedor (el MCP no conecta); el descubrimiento se hizo leyendo el código.
- **Comprobaciones:** `pnpm install` ok · `pnpm typecheck` ok (7/7) · `pnpm lint` ok · tests del kit
  87/87 · `kit:validate` 26/26 sin hallazgos · `pnpm build` **falla solo en `@lattiz/tenant-sites`**
  por falta de variables de Supabase en el contenedor (preexistente, no es de este trabajo); el resto
  compila (`turbo run build --filter='!@lattiz/tenant-sites'`).
- **Snapshot dorado:** `packages/template-kit/golden/snapshot.json` (`kit:snapshot`), verificado con
  `kit:verify-snapshot` (~16 s). Compila las 26 plantillas en memoria contra una copia de `assets/` y
  guarda un hash por salida (proyecto `.grapesjs`, `index.html`, CSS, `:root`, tema, pack de copy,
  `template.meta.json`, imágenes) y el tamaño (CSS, HTML del editor, `index.html`; crudo y gzip).
  También planea en memoria los 15 specs (`specs/`, `fixtures/spec/`, `fixtures/spec/skill-eval/`) y
  guarda el hash de cada archivo que generarían y las elecciones del compilador: así detecta que un
  pool que crece cambie la elección de un spec existente. Dos corridas seguidas dan lo mismo.
- **Kit:** 12 slots, 31 variantes, 26 temas, 15 pares tipográficos, 7 formas. Plantillas y pools por
  giro:

| Giro        | Plantillas (Pro/Básico) | Paletas | Pares | Formas | Portadas Pro usadas                         | Tonos de acento usados              |
| ----------- | ----------------------- | ------- | ----- | ------ | ------------------------------------------- | ----------------------------------- |
| barberia    | 8 (4/4)                 | 9       | 9     | 6      | centered-arch, offset-card, split, image-bg | gris ×2, 13, 74, 150, 226, 262, 338 |
| clinica     | 2 (1/1)                 | 5       | 5     | 5      | split                                       | 12, 167                             |
| dental      | 2 (1/1)                 | 5       | 5     | 4      | split                                       | 41, 212                             |
| despacho    | 2 (1/1)                 | 5       | 5     | 4      | image-bg                                    | 219, 350                            |
| estetica    | 2 (1/1)                 | 5       | 5     | 4      | split                                       | 266, 336                            |
| floreria    | 2 (1/1)                 | 5       | 5     | 5      | offset-card                                 | 292, 340                            |
| gimnasio    | 2 (1/1)                 | 5       | 5     | 4      | image-bg                                    | 18, 76                              |
| restaurante | 2 (1/1)                 | 6       | 5     | 6      | split                                       | 10, 338                             |
| tienda      | 2 (1/1)                 | 5       | 5     | 5      | image-bg                                    | 102, 223                            |
| veterinaria | 2 (1/1)                 | 5       | 5     | 4      | split                                       | 17, 169                             |
