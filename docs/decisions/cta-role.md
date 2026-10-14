---
name: cta-role
description: Rol cta opcional en Básico y Pro, cuenta como sección; roles obligatorios y rangos sin cambio
type: project
date: 2026-10-14
commit: 69f6846
---

`cta` (franja de cierre, `cta/band`) es rol opcional en ambos tiers (`src/tiers.ts`, blueprints, `verticals` → slot `cta`) y **cuenta** dentro del rango de secciones; `marquee` y `floating-whatsapp` siguen sin contar. Los roles obligatorios y los rangos (Básico 6–7, Pro 8–10) no cambiaron.

**Why:** era la decisión de producto de la Parte 2 (la franja cuenta) que faltaba registrar en los blueprints. Agregar un rol opcional no cambia ninguna plantilla existente: `template.meta.json` no lista los roles permitidos (snapshot idéntico).
**How to apply:** en Básico, sumar `cta` exige quitar `about` para seguir en 7. Su copy (`cta.title|text|primaryCta|secondaryCta`) viene del `meta.sample` en specs con `layout`; en los demás, escríbelo en `copy.cta`. Ver [[spec-direction-archetype-wiring]], [[extended-section-variants]].
