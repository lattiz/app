---
name: vercel-web-deploy-requirements
description: Requisitos de Vercel: rewrite SPA, VITE_API_BASE_URL, outputs y env de turbo
type: gotcha
date: 2026-10-07
---

- `apps/web/vercel.json` con rewrite `/(.*)` → `/index.html`. Sin él, el retorno de Stripe (`/dashboard/subscription?success=true`) y cualquier recarga en rutas profundas dan 404 de Vercel.
- `VITE_API_BASE_URL=https://api.lattiz.app` en Production del proyecto web. Sin ella `/tenants/me` va al propio dominio, falla y el dashboard muestra "Tu cuenta se está configurando" (`NoTenantState`) aunque el tenant exista en BD.
- `turbo.json` → `build.outputs` debe incluir `.next/**` (excluyendo `.next/cache/**`) y `build.env` declarar `PREVIEW_BASE_DOMAIN` y `REVALIDATION_SECRET`. Sin `.next/**`, un cache hit de turbo no restaura `routes-manifest.json` y tenant-sites falla.
- Las variables `VITE_` se incrustan en el build: tras cambiarlas hay que redeploy.

**Why:** diagnosticado en producción el 2026-10-07 con el primer registro y pago reales.
**How to apply:** ante un 404 de Vercel o un dashboard "configurándose", revisar esto antes de tocar código. Ver [[grapesjs-license-domain]].
