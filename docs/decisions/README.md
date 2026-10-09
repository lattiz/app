# Decisiones del proyecto

Memoria compartida del equipo (en git). Una decisión = un archivo `docs/decisions/<slug>.md`. Se registra solo cuando la decisión está **aplicada, probada y commiteada** (un hook lo recuerda tras cada `git commit`). Un archivo por decisión evita conflictos de merge; este índice es lo único que se edita siempre (una línea por decisión, descripción corta).

Formato de cada archivo:

```markdown
---
name: <slug>
description: <una línea, <100 caracteres>
type: project | gotcha | external
date: YYYY-MM-DD
commit: <sha donde se aplicó, si se conoce>
---

<el hecho>

**Why:** motivo y alternativas descartadas.
**How to apply:** cuándo y cómo usarlo. Enlaza otras con [[slug]].
```

Si una decisión queda obsoleta, se edita o se borra el archivo en el mismo commit que la cambia; no se acumulan versiones viejas.

## Índice

- [grapesjs-mobile-layout-plugin](grapesjs-mobile-layout-plugin.md) — layoutSidebarButtons + cast de tipos; cambia también el escritorio
- [grapesjs-sdk-pin-1-1-1](grapesjs-sdk-pin-1-1-1.md) — no subir studio-sdk a 1.2.1; cómo reparar node_modules roto
- [vercel-web-deploy-requirements](vercel-web-deploy-requirements.md) — rewrite SPA, VITE_API_BASE_URL, outputs/env de turbo
- [grapesjs-license-domain](grapesjs-license-domain.md) — autorizar dashboard.lattiz.app + clave real en Vercel
- [editor-mobile-header-collapse](editor-mobile-header-collapse.md) — header colapsable en móvil + resize del canvas
- [editor-text-edit-touch-emulation](editor-text-edit-touch-emulation.md) — la emulación táctil de Chrome bloquea editar texto; estilos del RTE
- [openprovider-registrar-migration](openprovider-registrar-migration.md) — GoDaddy→Openprovider: endpoints, sandbox vs prod, quirks
- [supabase-migrations-source-of-truth](supabase-migrations-source-of-truth.md) — esquema solo en supabase/migrations; cómo aplicar cambios
- [launch-plan-decisions](launch-plan-decisions.md) — decisiones de negocio del lanzamiento (dominios, renovación, R2, correo)
- [free-preview-trial](free-preview-trial.md) — prueba gratuita con preview temporal; reglas, bloqueos y anti-abuso
- [app-settings-config](app-settings-config.md) — config de negocio en BD (BD > env > default); qué va y qué no
- [domain-renewal-cap-enforced](domain-renewal-cap-enforced.md) — dominio incluido solo si compra y renovación caben en el plan; "Disponible con Pro"
