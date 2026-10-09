---
name: launch-plan-decisions
description: Decisiones de negocio del lanzamiento: dominios, renovación, riesgo, R2, previews y correo
type: project
date: 2026-10-03
---

Decidido el 2026-10-03: Lattiz es el registrante legal de los dominios de los clientes (se indica en los T&C; reventa o transferencia al usuario solo como caso especial). La renovación va incluida en el precio del plan y la absorbe Lattiz (se evalúa un cargo de renovación en el año 2). Riesgo aceptado: el usuario cancela tras el mes 1 y no conserva derechos sobre el dominio. Una sola VM para la API. Almacenamiento objetivo: Cloudflare R2 en `assets.lattiz.app` (ganó a Cloudinary por egress). Sitios de preview en `{slug}.lattiz.app` con wildcard de Vercel y `_acme-challenge` delegado (el DNS de lattiz.app queda en la cuenta de Cloudflare). Correo: Resend (ya verificado en lattiz.app).

**Why:** estar listos para lanzar con prioridad de costo $0 hasta tener ingresos.
**How to apply:** los planes completos (preview, correos, R2, renovaciones) y la lista priorizada de pendientes están en `.claude/handoff/launch-plan.md`, que hoy está ignorado por git y solo existe en una máquina. Ver [[openprovider-registrar-migration]].
