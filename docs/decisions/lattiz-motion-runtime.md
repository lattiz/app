---
name: lattiz-motion-runtime
description: Runtime propio solo en Pro; v2 = coreografía por sección, un solo IntersectionObserver
type: project
date: 2026-10-11
commit: 05cb580
---

Las animaciones e interacciones de los sitios Pro son un runtime propio (`apps/tenant-sites/lib/lz-motion/`, ~8.1 KB gzip, tope 10 KB que verifica `build:motion`) inyectado por `route.ts` como último paso, solo si `is_pro` y el HTML trae un atributo de motion v1 (`reveal|stagger|counter|words|parallax|lightbox|compare|countdown|open-now`) o un `data-lz-section` distinto de `none` sin `data-lz-motion="none"`. Contrato en `docs/lattiz-motion.md`. v2: cada sección declara su tipo (`data-lz-section`) y el runtime anima sus hijos con tokens compartidos; un solo `IntersectionObserver` observa secciones; al dispararse anima lo que ya está en pantalla desde el índice 0 y deja lo de abajo a un ancla diferida por sección. El hero se anima desde el primer paint y su imagen (LCP) solo hace `scale`, nunca opacidad ni recorte.

**Why:** ScrollReveal es GPLv3/comercial y la licencia de GSAP prohíbe herramientas no-code de animación. Se detecta por atributos de motion y no por `data-lz-` porque template-kit pone `data-lz-slot`/`data-lz-variant`/`data-lz-key` en todos los bloques. v1 decoraba nodo por nodo con un observador por nodo (16 en Norte) y disparadores anidados independientes: la causa medida de la inconsistencia (`docs/lattiz-motion-audit.md`). El primer diseño v2 disparaba toda la cascada de la sección a la vez: al aterrizar a media sección (ancla, scroll rápido) dejaba filas visibles en blanco ~1.6 s; por eso la cascada se rebasa a lo visible. Se usan `translate`/`scale` individuales para no pisar el `transform` de la plantilla.
El seed (`--motion`) solo etiqueta secciones (`data-lz-section`, clasificador en `scripts/lib/motion-sections.ts`, overrides en `motion.sections` del manifiesto); los previews (`templates.lattiz.app`) reciben la misma etiqueta que el `.grapesjs` y solo los de plantillas Pro llevan el runtime inline.

**How to apply:** atributos nuevos se añaden, nunca se renombran (hay sitios publicados y el runtime se sirve a todos en cada request). Tras editar `src/` correr `pnpm --filter @lattiz/tenant-sites build:motion` y commitear `runtime.generated.ts`. Medir con Lighthouse sobre el mismo HTML de assets R2 (no sobre `dist/`, cuyas imágenes son locales). Ver [[business-profile-site-tokens]] (open-now lee `#lz-ld`).
