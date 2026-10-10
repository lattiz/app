---
name: faq-details-open-editor
description: FAQ con <details open>: el canvas de GrapesJS no despliega <details> cerrados
type: gotcha
date: 2026-10-09
commit: 30067f9
---

En el canvas de GrapesJS 0.22.16 (el core del Studio SDK del editor) un clic en `<summary>` solo selecciona el componente y nunca despliega el `<details>`. Una respuesta cerrada queda oculta y no se puede editar. Las secciones `faq` usan `<details open>` y `kit:validate` (regla `faq-details`) rechaza cualquier `<details>` sin `open`. El visitante aún puede plegarlas.

**Why:** se descartó un acordeón con JS (las plantillas no llevan JS) y bloques Q&A planos (se pierde el marcado del que el publicador extraería `FAQPage`).
**How to apply:** cualquier contenido colapsable en una plantilla debe venir abierto. Ojo: el saneador de sitios sin pago descarta `<details>`, `<summary>` e `<iframe>` (en la vista previa gratuita el FAQ queda como texto y sin mapas). Ver [[template-tiers-model]].
