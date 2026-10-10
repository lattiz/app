---
name: template-access-by-plan
description: Acceso a plantillas por plan derivado al leer; bloqueo tras bajar de plan; archivar antes de reemplazar
type: project
date: 2026-10-10
commit: 600cf89
---

Básico usa plantillas `basic`; Pro (y `empresarial`) también `pro`, comparando rangos. El acceso se deriva en cada petición de `tenants.plan` + `computeIsEntitled` de la última suscripción + `templates.tier` (`TemplateAccessService`); no hay columna de bloqueo. Con suscripción vigente y plan menor que la plantilla actual, la API responde `TEMPLATE_LOCKED_BY_PLAN` al cargar, guardar, subir y publicar; el sitio publicado sigue en línea. Cambiar de plantilla archiva antes `grapesjs_json` + `exported_html` en `template_archives` en la misma transacción. Bajar de plan exige `acknowledgeLosses` si `plan-change-impact` lista un `template_loss`.

**Why:** un flag guardado se desincroniza con un webhook perdido. La baja involuntaria (pago vencido) ya la cubre el bloqueo por suscripción y no debe costarle la plantilla al tenant. Nada se borra porque el dueño aún no decide retención ni restauración. Se descartaron las plantillas exclusivas/reclamadas (decisión del dueño).
**How to apply:** supuestos A1–A5 y su único punto de cambio en `docs/template-tiers.md › Supuestos`. El plan para plantillas es el actual (Pro dura hasta el fin del periodo); el de dominios es el menor con el cambio programado. Antes de re-sembrar una plantilla como `pro`, correr `supabase/tests/template_access/precheck_pro_templates.sql`. Ver [[template-tiers-model]], [[plan-change-flow]].
