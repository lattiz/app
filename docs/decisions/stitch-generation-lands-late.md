---
name: stitch-generation-lands-late
description: Stitch da timeout por MCP pero genera; por HTTP responde en minutos; claves de imagen fijas
type: gotcha
date: 2026-10-23
commit: 7b8d790
---

`generate_screen_from_text` siempre da timeout, pero la pantalla **sí se genera**: en el caso de `restaurante-barra-pedidos-01` apareció unos 10–15 minutos después (dos intentos = dos pantallas en el mismo proyecto). La conexión MCP `stitch-direct` de la sesión siguió mostrando solo el `DESIGN.md` subido; el endpoint HTTP de Stitch (`tools/call` de `list_screens` y `get_screen`, con la clave de API del usuario en la cabecera) ya listaba las dos.

**Why:** reintentar o crear un proyecto nuevo duplica pantallas y no acelera nada; con una conexión que no refresca, esperar no basta.
**How to apply:** tras el timeout, no reintentes más de una vez; sondea con `list_screens` y, si tras ~10 minutos no sale, pide al usuario otra conexión o la URL del proyecto y consulta por HTTP. Baja HTML y captura con `get_screen` (las URLs firmadas bajan con curl; la captura sale en miniatura, renderiza el HTML con Playwright). `design fidelity` solo mide `#id`: agrega ids a la copia local ([[design-fidelity-needs-section-id]]). Una sección que lea listas anidadas (`groups[].items[]`) cuenta sus fotos en `validate` solo si `groups` está en la lista de claves de imagen; el slot de copy `cta` también debe estar permitido. Ver [[stitch-native-reconstruction]].

**Variante HTTP:** por el endpoint HTTP de Stitch, `generate_screen_from_text` no da timeout: devuelve la pantalla en 1–2 minutos (curl con `-m 1500` en segundo plano). Si pide una sección sola, la respuesta trae además una pantalla `IMAGE` generada: toma la de `screenType: DESIGN` con `htmlCode`. Las claves de `images[]` del spec son fijas (`hero`, `about`, `team-1…4`, `gallery-01…08`, `product-01…08`): una foto extra va en `product-0N` y el copy la nombra (`image: "product-07.jpg"`).
