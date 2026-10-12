---
name: font-pair-library-fallbacks
description: Pares extended (≤ 2 familias, ≤ 4 archivos) y size-adjust medido al peso del display
type: project
date: 2026-10-12
commit: 72ab016
---

`font-pairs/library.ts`: 16 pares de Google Fonts (mismo origen y `display=swap`), dos familias por página, 2–4 archivos del subconjunto latin (33–96 KB), latin-ext y licencia OFL verificados por `kit:fonts` contra `google/fonts`; `opsz` fijo, no en rango (la mitad de peso). Los display de peso alto o en mayúsculas llevan `size-adjust` medido (`DISPLAY_SIZE_ADJUST` y `CAPS_SIZE_ADJUST` en `src/lib/theme.ts`, solo familias nuevas): con eso los 16 pares cambian de fuente con CLS ≤ 0.004 (`kit:fonts --cls`).

**Why:** Capsize ajusta el fallback con el ancho promedio del peso regular; un display a 600–800 es mucho más ancho (Anybody 800 necesita 129.6 % contra 110.3 %) y el título de la portada cambiaba de líneas al llegar la fuente (CLS 0.10–0.15). Hallazgo del entorno: el fallback es `local('Arial')`/`local('Times New Roman')`, que Linux y Android no tienen; ahí no hay ajuste, así que la medición usa Liberation Sans/Serif (clones métricos) solo en la página de prueba.
**How to apply:** par nuevo → datos en `library.ts`, `kit:fonts` sin ✗, `kit:fonts --cls <par>`; si el CLS pasa de 0.01, medir el ancho al peso del display y agregar la familia al mapa. No calibrar familias que ya usan plantillas publicadas (cambia su salida): `anton+space-grotesk` sigue en 0.122 a 390 como backlog. Ver [[font-metric-fallbacks]], [[template-catalog-versioning]].
