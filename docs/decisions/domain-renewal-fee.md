---
name: domain-renewal-fee
description: Cuota anual de dominio desde el año 2, pago por enlace, mora de 15 días y un dominio incluido por cuenta
type: project
date: 2026-10-10
commit: 7997cb4
---

Decidido el 2026-10-10 (sustituye "la renovación la absorbe Lattiz" de [[launch-plan-decisions]]): el primer año de un dominio gestionado va incluido y desde el segundo se cobra una cuota anual (599 MXN + IVA, mismo monto en Básico y Pro, un valor por plan). Todo es configurable en `app_settings` (`domain.renewal.*`, `alerts.admin_email`; ver [[app-settings-config]]).

- **Calendario:** el ciclo (`domain_maintenance_cycles`) se abre 28 días antes del vencimiento con el monto congelado; antes no existe nada. Avisos a 28/14/7/3/1/0 días. Al vencer sin pago el ciclo pasa a `overdue` y el sitio deja de servirse **también en el subdominio** (`tenant_site_is_entitled` devuelve false). Hay 15 días tardíos; después `releaseDomain`, ciclo `lapsed` y el sitio vuelve al subdominio.
- **Pago:** solo por enlace (Stripe Checkout `mode: payment`, generado en cada clic, 30 min), solo con suscripción activa. Sin cargo automático. La cuota no se reembolsa. Al confirmarse, Lattiz renueva 1 año; el autorenew del registrador sigue en `off`.
- **Un dominio incluido por cuenta:** `tenants.included_domain_used_at`. Cotizar o comprar otro responde `INCLUDED_DOMAIN_ALREADY_USED`; la compra con pago queda pendiente. La marca vive en `tenants` porque `preparePurchase` borra la fila de un dominio liberado.
- **Casos manuales:** `AdminAlertService` registra `[ADMIN_ALERT]` y manda un correo por caso a `alerts.admin_email` (pago sin ciclo pagable, renovación fallida tras el pago, redelegación DNS fallida, costo sobre el tope, liberación fallida, saldo del registrador insuficiente). Lattiz absorbe subidas del precio de renovación y nunca paga recargos de cuarentena dura.

Openprovider, verificado en sandbox: `POST domains/{id}/renew` suma un año a la fecha de vencimiento actual y no devuelve la fecha nueva; sobre un dominio no activo falla con código 327 y hay que usar `POST domains/{id}/restore`; `GET tlds/{tld}` da cuarentena suave de 40 días (`.com`) y 44 (`.mx`, `.com.mx`) con `soft_restore_price` 0; la fecha de vencimiento no se puede editar (el PUT no responde y no cambia nada); la política oficial solo garantiza renovar dentro de las 4 semanas previas, por eso el ciclo abre a 28 días. Sin verificar: si restaurar tras un vencimiento real ya suma el año (el código relee la fecha y renueva solo si no avanzó).

**Why:** absorber la renovación era una pérdida segura por dominio; el autorenew del registrador cobra cuando él decide y habría que apagarlo cada año. Se descartó el cargo automático a la tarjeta (de momento) y la lógica de plazos por extensión (15 días genéricos caben en las tres).
**How to apply:** `renewalWindow` y `currentRenewalNotice` en `domain-renewal.policy.ts` son la regla única de fases y avisos. `fulfil` reclama el ciclo con un UPDATE condicional y trata como ya renovado un dominio cuya fecha supera en 300 días la del ciclo: no quitar esas dos protecciones (evitan renovar dos veces). Los tests unitarios simulan la BD; validar SQL nuevo con `pnpm --filter @lattiz/api smoke:renewal` contra la base local (encontró un UPDATE inválido que los unitarios no veían). Ver [[domain-renewal-cap-enforced]] y [[openprovider-registrar-migration]].
