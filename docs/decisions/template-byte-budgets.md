---
name: template-byte-budgets
description: budgets.json por tier en kit:validate (WARN; FAIL con --strict-budget o plantilla nueva); CWV de laboratorio en lattiz check
type: project
date: 2026-10-14
commit: 8039184
---

`packages/template-kit/budgets.json` fija, por tier, CSS y `index.html` (crudo y gzip), imágenes locales de la página (total y la mayor) y el gzip del runtime de Motion (Pro). Arrancó en el máximo de las 42 plantillas del 2026-10-14 + ~10 %. `kit:validate` lo mide en manifiestos y pasarse es WARN; `--strict-budget` lo vuelve FAIL, y `lattiz build` de un spec cuya plantilla aún no existe lo trata como hallazgo (se niega a escribir). `lattiz check --lighthouse` suma LCP ≤ 2.5 s, CLS ≤ 0.1 y TBT ≤ 200 ms como WARN.

**Why:** no había tope de bytes y Lighthouse solo marcaba categorías < 0.8. WARN por defecto para que ninguna plantilla existente falle por el presupuesto; estricto solo para lo nuevo. Los Web Vitals son de laboratorio sobre la vista previa local (sin CDN, fuentes locales, `noindex` → SEO 66 siempre): sirven para comparar plantillas entre sí, no como datos de campo.
**How to apply:** subir un número de `budgets.json` solo con razón escrita en el commit. Las imágenes Pro (hasta 20 fotos, 2.5 MiB) son lo primero a apretar. Línea base de CWV en `docs/template-kit-catalog.md` («Presupuesto de bytes y Web Vitals»). Ver [[font-metric-fallbacks]], [[image-optimizer-memory-model]].
