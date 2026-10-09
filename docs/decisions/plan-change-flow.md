---
name: plan-change-flow
description: Upgrade por flujo del portal de Stripe, downgrade con schedule propio; plan derivado del precio
type: project
date: 2026-10-09
commit: 349cd20
---

Cambio de plan (`/billing/plan-change`): el **upgrade** Básico→Pro abre un flujo `subscription_update_confirm` del portal con una configuración dedicada (`STRIPE_PORTAL_CONFIGURATION_PLAN_CHANGE`, prorrateo cobrado al momento); el **downgrade** Pro→Básico lo programa la API con un Subscription Schedule (`from_subscription` + update que reenvía la fase actual completa y añade la fase Básico, `end_behavior: release`, metadata `{app:'lattiz', purpose:'plan_change'}`). Solo mismo intervalo. Cuando la fase Básico arranca, el sync libera el schedule para que el portal vuelva a permitir cancelar.

- `tenants.plan` sale del **precio del item** (lookup key → producto del catálogo → metadata como último recurso), siempre re-leyendo la suscripción de Stripe; la metadata se queda con el plan de alta y no se reescribe. Webhooks idempotentes vía `stripe_webhook_events` (se marca solo tras procesar con éxito).
- Plan efectivo para dominios = el menor entre `tenants.plan` y el cambio programado (`EffectivePlanService`, falla cerrado a `basico`). Llega a `DomainsModule` por `EFFECTIVE_PLAN_PORT` desde `BillingCoreModule`, que no depende de dominios (evita el ciclo Billing↔Domains).
- El downgrade se bloquea si un dominio gestionado por Lattiz renueva por encima del tope Básico (precio guardado; si falta, cotización fresca; si falla, bloquea).

**Why:** el portal solo difiere cambios al fin de periodo entre precios del mismo producto, y Básico y Pro son productos distintos. Antes, "Mejorar a Pro" abría un Checkout nuevo (segunda suscripción) y un cambio de plan nunca actualizaba `tenants.plan` porque se leía de la metadata.
**How to apply:** la configuración Default del portal debe seguir con `subscription_update` desactivado. Nunca escribir `tenants.plan` fuera del sync. Mientras haya un schedule, el portal no deja cancelar ni cambiar la suscripción. Ver [[domain-renewal-cap-enforced]].
