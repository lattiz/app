---
name: admin-kpi-definitions
description: KPI del admin: MRR en vivo de Stripe, churn, en riesgo, embudo y kpi_daily; sin internos
type: project
date: 2026-10-17
commit: 7b9daae
---

Definiciones de los KPI del dashboard de negocio (`apps/api/src/modules/admin/metrics/`):

- **MRR**: en vivo desde las suscripciones de Stripe (`active`, `trialing`, `past_due`), caché de 10 min. Anual ÷ 12, semanal × 52 ÷ 12. El cupón fijo se descuenta del periodo antes de normalizar. Moneda principal MXN. Lo calcula `summarizeStripeMrr`.
- **Ingresos cobrados**: `balance_transactions` de Stripe agrupadas por mes calendario de CDMX. Incluyen las cuotas de dominio; reembolsos negativos; neto = bruto − comisiones.
- **Clientes que pagan**: `computeIsEntitled` sobre la fila actual, la misma regla que la API.
- **Churn del mes**: cancelaciones del mes ÷ entitled al inicio del mes; `null` si el divisor es 0.
- **En riesgo**: `past_due` o cancelación programada, cada tenant una vez.
- **Embudo**: registro → eligió plantilla → publicó → pagó. Conteos independientes; cada tasa es el paso ÷ el anterior.
- **Pruebas**: `classifyTrial` sobre la regla viva de la prueba (`PreviewConfig`); «por vencer» = < 48 h.
- **Plantillas**: adopción = `tenants_using`; la conversión solo cuenta con ≥ 3 tenants.
- **Renovaciones a 30 días**: el `amount_cents` del ciclo abierto o, si no hay ciclo, la cuota del plan + IVA.
- **Historial**: `admin.kpi_daily`, escrita por `kpi-snapshot.cron.ts` a las 00:15 CDMX. El almacenamiento se mide a las 03:30 en `admin.storage_usage`.
- **Excluidos siempre**: los tenants con `admin.tenant_flags.is_internal`, tanto en la BD como por id de customer en Stripe.

**Why:** Stripe es la fuente de verdad de los montos (la BD no guarda importes), y reusar `computeIsEntitled` y `classifyTrial` evita que el admin y la app difieran. `kpi_daily` existe porque el historial no se puede reconstruir después.
**How to apply:** un KPI nuevo reusa estas funciones puras y respeta la exclusión de internos. Cambiar una definición obliga a editar este archivo y sus tests. Ver [[admin-architecture]] y [[free-preview-trial]].
