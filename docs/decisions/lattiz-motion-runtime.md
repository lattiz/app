---
name: lattiz-motion-runtime
description: Runtime propio data-lz-* solo en sitios Pro; detección por atributos de motion, no data-lz-
type: project
date: 2026-10-11
commit: 05cb580
---

Las animaciones e interacciones de los sitios Pro son un runtime propio (`apps/tenant-sites/lib/lz-motion/`, ~4.4 KB gzip, tope 8 KB que verifica `build:motion`) inyectado por `route.ts` como último paso, solo si `is_pro` y el HTML trae un atributo de motion (`reveal|stagger|counter|words|parallax|lightbox|compare|countdown|open-now`). Contrato v1 en `docs/lattiz-motion.md`. Los estados ocultos solo existen en elementos que el runtime marca (`.lz-hide`), nunca en el primer viewport, con failsafe de 2.5 s y respeto a reduced-motion.

**Why:** ScrollReveal es GPLv3/comercial y la licencia de GSAP prohíbe herramientas no-code de animación. Se detecta por atributos de motion y no por `data-lz-` porque template-kit pone `data-lz-slot`/`data-lz-variant`/`data-lz-key` en todos los bloques: con `data-lz-` se inyectaría en todos los sitios Pro. Sin pre-ocultar por CSS: ocultar tarde lo que está fuera de pantalla no se ve, y lo de arriba nunca se oculta (LCP).
**How to apply:** atributos nuevos se añaden, nunca se renombran (hay sitios publicados). Tras editar `src/` correr `pnpm --filter @lattiz/tenant-sites build:motion` y commitear `runtime.generated.ts`. Ver [[business-profile-site-tokens]] (open-now lee `#lz-ld`).
