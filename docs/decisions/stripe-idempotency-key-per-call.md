---
name: stripe-idempotency-key-per-call
description: una idempotencyKey por llamada a Stripe; reusarla entre update y cancel falla siempre
type: gotcha
date: 2026-10-17
commit: f13b654
---

Stripe solo acepta reusar una `idempotencyKey` con **el mismo endpoint y los mismos parámetros**. Si una acción hace dos llamadas (p. ej. `subscriptions.update` para la metadata y luego `subscriptions.cancel`), cada una lleva su propia key derivada de una base: `${base}:meta`, `${base}:cancel`, `${base}:period_end`. Si no, la segunda responde `idempotency_error` en producción.

**Why:** pasó en `admin-subscriptions.service.ts` (cancelar ya). Los tests con Stripe mockeado no lo detectan.
**How to apply:** en toda acción con varias llamadas a Stripe, sufija la key por llamada. Los specs del admin exigen que las keys de una misma acción sean únicas. Ver [[plan-change-flow]].
