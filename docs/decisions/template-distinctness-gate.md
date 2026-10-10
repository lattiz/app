---
name: template-distinctness-gate
description: Plantillas distintas por rubro: tema único, reglas de unicidad y compare-visual a 0.33
type: project
date: 2026-10-10
commit: 48f7677
---

Dentro de un rubro cada plantilla tiene su propio tema (identidad: paleta, `fontPair`, forma, densidad, tratamiento de foto, placeholders), su voz de copy y su titular. `kit:validate` exige tema, `fontPair` y titular únicos, acento a ≥ 30° de tono y portada única entre Pro; `kit:compare-visual` falla si la mitad superior de dos plantillas está a menos de 0.33 (SSIM de luminancia + ΔE CIELAB a 160×100).

**Why:** en la fase 2 Trazo y Norte compartían tema, tipografía y portada y se veían como el mismo sitio; la similitud estructural (0.528 < 0.6) no lo detectaba. Se calibró con renders reales: los clones de la fase 2 dieron 0.168 y 0.250, el par más cercano de la fase 3 0.408. La distancia de página completa se descartó como compuerta: a tamaño tira mide casi solo claro vs oscuro.
**How to apply:** una plantilla nueva no está terminada hasta que pasa `kit:compare-visual` y se revisó `dist/_contact-sheet.png`. Si el umbral rechaza algo que a ojo se distingue, recalibra con los números en la misma decisión. Ver [[template-tiers-model]].
