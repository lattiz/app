---
name: domain-renewal-cap-enforced
description: Un dominio solo se incluye si compra Y renovación caben en el tope del plan; Pro como upsell
type: project
date: 2026-10-09
---

Búsqueda, cotización y compra de dominios exigen precio de compra <= `domain.max_cost_usd_cents` (todos los planes) Y renovación <= tope del plan del tenant (`domain.basic_renewal_max_cost_usd_cents` para cualquier plan que no sea `pro`, `domain.pro_renewal_max_cost_usd_cents` para `pro`; ver [[app-settings-config]]). La API devuelve `coveredByPlan`, `notCoveredReason` (`purchase_over_cap`, `renewal_over_cap` = ningún plan lo cubre, `requires_pro`, `price_unknown`) y `availableWithPro` (Básico no lo cubre, Pro sí), que la web muestra como "Disponible con Pro" con CTA a planes. La compra fuera de tope responde `DOMAIN_NOT_COVERED_BY_PLAN` con `details.reason`; reanudar una compra ya registrada no se bloquea.

- El precio de renovación se consulta solo para candidatos disponibles cuya compra ya cabe: caché en memoria 6 h, máx. 2 consultas a Openprovider en paralelo (devuelve 429 con ráfagas) y fail-closed (si falla, no se muestra como incluido).
- La regla única es `evaluateDomainPurchase` en `domain-pricing.policy.ts`, evaluada con el **plan efectivo** (el menor entre `tenants.plan` y un cambio programado, ver [[plan-change-flow]]): un Pro con downgrade pendiente ya compra como Básico. La compra re-cotiza en el registrar y deja `[DOMAIN_PURCHASE_BLOCKED]` en logs. Búsqueda y cotización devuelven `renewalPriceUsdCents`.

**Why:** dominios como `.mx` tienen compra barata (~USD 17) y renovación cara (~USD 60); Lattiz absorbe la renovación, así que mostrarlos como incluidos era una pérdida segura. Antes la renovación solo se registraba como warning sin bloquear (decisión previa, revertida por el dueño el 2026-10-09).
**How to apply:** para cambiar topes, edita las filas de `app_settings` (aplica sin reiniciar). Si se añade un plan nuevo, extender `resolveRenewalCapUsdCents` y el cálculo de `availableWithPro`.
