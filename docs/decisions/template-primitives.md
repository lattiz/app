---
name: template-primitives
description: Primitivos lz-btn/lz-tile/…; el tema elige estilo por familia; solo se emite el CSS que el markup usa
type: project
date: 2026-10-14
commit: 6335862
---

Siete familias en `packages/template-kit/primitives/` (botón `lz-btn`, tarjeta `lz-tile`, etiqueta `lz-tag`, marco `lz-frame`, cifra `lz-bignum`, cita `lz-pullquote`, separador `lz-rule`), cada una con `base.css` y un CSS por estilo. Las variantes nuevas escriben el bloque; `theme.primitives` (lo pone una dirección de arte) elige el estilo y el compilador agrega el modificador a los elementos sin estilo ni rol. `primitiveCss` emite solo base + estilos presentes en el HTML de la plantilla, entre `core.css` y el CSS de las variantes.

**Why:** cada sección dibujaba sus propios botones y tarjetas, así que una elección de gusto no reestilizaba la página. Emitir por uso (y no por tema) deja el CSS de las 42 plantillas existentes byte a byte igual y no carga estilos sin usar. Se descartaron `lz-card` (es de team) y `lz-panel` (aparece en fixtures viejos). Los modificadores explícitos de marco usan valores propios: con los tokens `--lz-img-*`, un tema con `imageTreatment` los anulaba.
**How to apply:** estilo nuevo = `primitives/<familia>/<estilo>.css` + entrada en `primitives/index.ts`, `pnpm lattiz kit gallery --primitives` y `kit:manifest`. Adoptarlos en una variante existente cambia su salida: variante por variante, con re-baseline explicado. Ver [[template-style-tokens]], [[catalog-manifest]], [[template-art-directions]].
