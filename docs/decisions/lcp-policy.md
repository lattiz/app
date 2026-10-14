---
name: lcp-policy
description: LCP lo mueven la hoja de Google Fonts y la foto de portada; plantillas nuevas con hero ≤ 1200 px q72 y ≤ 120 KiB
type: gotcha
date: 2026-10-14
commit: 5460fb5
---

En las plantillas el elemento LCP es siempre la foto de portada, que ya va con `fetchpriority="high"`, sin `lazy` y con medidas; Motion no la oculta. Lo que pesa es la hoja de Google Fonts, que bloquea el primer pintado (~815 ms en laboratorio, −1 a −1.4 s de LCP si se quita), y una foto real pesada (159–202 KiB). Política para lo nuevo: `lattiz build` de una plantilla que no existe codifica `hero.jpg` a ≤ 1200 px y calidad 72, y `budgets.json › images.hero` = 120 KiB (WARN en las existentes, FAIL en las nuevas).

**Why:** medido en copias temporales con `lattiz check --root --lighthouse`: `restaurante-ceniza-v1` 3.98 → 2.18 s con ambas correcciones. Sacar la hoja de fuentes del camino crítico sin JS no es posible desde el kit (el editor la vuelve a poner en `<head>`); la opción recomendada es en tenant-sites (fuera de A2). Recodificar las fotos existentes cambia el golden: decisión de Santi.
**How to apply:** números de laboratorio (vista previa local, sin CDN), no de campo. Diagnóstico y retrofit propuesto en `docs/template-kit-lcp.md`; el reporte completo queda en `.lattiz/shots/<id>/lighthouse.json`. Ver [[template-byte-budgets]], [[font-metric-fallbacks]], [[lattiz-motion-runtime]].
