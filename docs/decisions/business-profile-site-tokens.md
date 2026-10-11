---
name: business-profile-site-tokens
description: Datos del negocio en tenants.business_profile; tokens {{lz:*}} y JSON-LD al servir
type: project
date: 2026-10-11
commit: 7fe5228
---

"Datos del negocio" vive en `tenants.business_profile` (jsonb, objeto, `'{}'` por defecto) y solo lo escribe `PATCH /tenants/:tenantId/business-profile`: merge superficial, `null`/`""` borra la clave, teléfonos en E.164 con `libphonenumber-js` (MX por defecto; acepta el viejo `+52 1`). tenant-sites lo recibe por `get_public_tenant_site()` (que ahora también devuelve `is_pro`) y al servir, en este orden y cada paso con try/catch: tokens → SEO → JSON-LD → analítica → motion. Los tokens `{{lz:name|phone|phone_tel|whatsapp_url|email|address|city|hours_summary}}` se reemplazan escapados, también en `href` y en la forma `%7B%7B…%7D%7D`; uno desconocido o vacío queda en "" y si el paso falla se borran todos. JSON-LD `#lz-ld` (tipo schema.org por giro, horario con cierre tras medianoche) solo con nombre + (dirección o teléfono); lleva `data-lz-tz` para el badge "Abierto ahora".

**Why:** los datos cambian sin re-publicar ni tocar el `.grapesjs`, y el editor sigue siendo GrapesJS puro (los tokens se ven literales en el canvas). `is_pro` en SQL con la misma regla que GA4 evita una segunda fuente de plan en tenant-sites. tenant-sites no usa libphonenumber (falla con tsx y solo formatea números ya normalizados).
**How to apply:** un token nuevo se añade en `apps/tenant-sites/lib/site-tokens.ts` y en la lista del formulario (`features/dashboard/business-profile/business-profile.ts`). Cambiar las columnas de `get_public_tenant_site` exige DROP + CREATE y volver a dar GRANT a anon. Ver [[supabase-migrations-source-of-truth]].
