---
name: template-tiers-model
description: Plantillas Basic/Pro: src/tiers.ts manda; roles por rubro; meta fuera del .grapesjs
type: project
date: 2026-10-09
commit: 31d00dd
---

Las plantillas tienen dos tiers definidos solo en `packages/template-kit/src/tiers.ts`: Basic (6–7 secciones contadas, similitud ≤ 0.85, cualquier tenant) y Pro (8–10, similitud ≤ 0.5, exclusiva de suscriptores Pro). `floating-whatsapp` y `marquee` no cuentan. Los blueprints `service-landing.{basic,pro}.ts` hablan de roles y cada rubro los resuelve a slots. El tier y los roles se emiten en `dist/<id>/template.meta.json`, nunca en `custom` del `.grapesjs`.

**Why:** el editor espera `custom` exactamente `{ projectType, id }`; los roles permiten reutilizar el mismo blueprint en rubros nuevos (catalog → services o menu). Las Basic son pieles de una estructura a propósito, por eso su límite de similitud es alto.
**How to apply:** el gating (claim, filtro por plan) aún no existe; la propuesta y las preguntas abiertas están en `docs/template-tiers.md`. ÓXIDO y Norte se actualizaron a Pro sin cambiar de id (el seed hace upsert). Ver [[faq-details-open-editor]].
