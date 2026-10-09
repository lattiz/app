---
name: grapesjs-license-domain
description: La licencia de GrapesJS necesita dashboard.lattiz.app autorizado y clave real en Vercel
type: external
date: 2026-10-07
---

En dominios distintos de localhost, `VITE_GRAPESJS_LICENSE_KEY` debe ser una clave real y el dominio (`dashboard.lattiz.app`, sin `https://`) debe estar en los dominios permitidos del panel de GrapesJS Studio. Si no, el editor muestra `Domain mismatch`.

**Why:** error visto en producción el 2026-10-07. Es configuración externa, no código (`SiteEditor.tsx` cae a `DEV_LICENSE_KEY`).
**How to apply:** si el editor vive en otro dominio (previews, dominio propio), autorizarlo también; revisar el límite de dominios del plan. Ver [[vercel-web-deploy-requirements]].
