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
- [plan-change-flow](plan-change-flow.md) — upgrade por portal, downgrade con schedule propio; plan derivado del precio
- [postgres-js-date-params](postgres-js-date-params.md) — no enlazar Date en sql`` crudo con postgres.js; usar ISO
- [template-tiers-model](template-tiers-model.md) — Basic/Pro en src/tiers.ts; roles por rubro; template.meta.json
- [faq-details-open-editor](faq-details-open-editor.md) — FAQ con <details open>: el canvas no despliega <details>
- [template-distinctness-gate](template-distinctness-gate.md) — tema único por rubro, reglas de unicidad y compare-visual a 0.33
- [accent-text-token](accent-text-token.md) — accent es relleno, accent-text es texto; highlight para acentos claros
- [template-access-by-plan](template-access-by-plan.md) — acceso por plan derivado al leer; bloqueo tras bajar; archivar antes de reemplazar
- [domain-renewal-fee](domain-renewal-fee.md) — cuota anual desde el año 2, pago por enlace, mora de 15 días, un dominio incluido por cuenta
- [image-optimizer-memory-model](image-optimizer-memory-model.md) — WebP ≤ 2000 px con sharp; cola acotada + disco temporal; 290 MiB pico
- [business-profile-site-tokens](business-profile-site-tokens.md) — business_profile jsonb; tokens {{lz:*}} + JSON-LD al servir; is_pro en SQL
- [lattiz-motion-runtime](lattiz-motion-runtime.md) — runtime propio solo Pro; v3 grupos de revelado, un observer, barrido + centinela final
- [editor-theme-presets-and-blocks](editor-theme-presets-and-blocks.md) — Tema reescribe --lz-* en :root; bloques/temas Pro según proIncluded
- [template-rhythm-tokens](template-rhythm-tokens.md) — ritmo global por tema (rhythm) con defaults = px originales; sin overrides.css
- [viewport-fit-system](viewport-fit-system.md) — secciones data-lz-fit caben en 90 % de 100svh − header; reporte en template:shots
- [font-metric-fallbacks](font-metric-fallbacks.md) — fallback local con métricas Capsize; mayúsculas con size-adjust medido; CLS ~0
- [lattiz-template-cli](lattiz-template-cli.md) — pnpm lattiz; preview vía composeSiteHtml; seed sin deploy + deploy que finaliza
- [template-spec-compiler](template-spec-compiler.md) — specs → plantillas únicas por construcción; GENERATED/FROZEN; sin overrides.css ni {{lz:*}}
- [check-axe-marquee-offscreen](check-axe-marquee-offscreen.md) — axe + runtime de Motion: falso 1.08:1 en ítems recortados del marquee
- [kit-contact-site-tokens](kit-contact-site-tokens.md) — el .grapesjs lleva {{lz:*}} de contacto; el HTML del kit los resuelve con el demo
- [lattiz-template-skill](lattiz-template-skill.md) — skill /lattiz-template sobre un contrato headless del CLI; nunca escribe en remoto
- [cli-exit-after-stdout-flush](cli-exit-after-stdout-flush.md) — process.exit() corta stdout por tubería a 64 KiB; salir tras vaciar stdout
- [navbar-mobile-menu-target](navbar-mobile-menu-target.md) — menú móvil sin JS con #menu + :target; Básico tarjeta, Pro pantalla completa
- [spec-image-url-source](spec-image-url-source.md) — fotos por URL pegada en images[] (sin API key); se descargan en el build, nunca hotlink
- [template-catalog-versioning](template-catalog-versioning.md) — extender sin mutar: catálogo legacy/extended, lock por spec, snapshot dorado
- [placeholder-bytes-host-dependent](placeholder-bytes-host-dependent.md) — un build en otra máquina reescribe JPEG de placeholder; restaurarlos
- [template-style-tokens](template-style-tokens.md) — presets de estilo opt-in en extended (brand.style); var() con el look de hoy de respaldo
- [vitest-hook-timeout-dist](vitest-hook-timeout-dist.md) — «2 skipped» en el kit con más carpetas en dist/; borrar dist y repetir
- [template-palette-library](template-palette-library.md) — paletas extended desde semillas (kit:palettes); AA por construcción, ΔE00 ≥ 15 por giro
- [font-pair-library-fallbacks](font-pair-library-fallbacks.md) — pares extended de 2 familias; size-adjust medido al peso del display; Arial ausente en Linux
- [extended-section-variants](extended-section-variants.md) — contrato de variantes extended; compuerta `kit probe`; lo legacy queda WARN
- [page-archetypes-data](page-archetypes-data.md) — 8 arquetipos y módulos por giro como datos; WP8 los conecta y registra `cta`
- [snapshot-recorded-inputs](snapshot-recorded-inputs.md) — el golden replanea specs con peers y lock grabados; entradas nuevas con kit:snapshot:add
