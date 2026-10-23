---
name: stitch-generation-lands-late
description: generate_screen_from_text da timeout pero la pantalla aparece minutos después; sondear con otra conexión
type: gotcha
date: 2026-10-23
commit: 7b8d790
---

`generate_screen_from_text` siempre da timeout, pero la pantalla **sí se genera**: en el caso de `restaurante-barra-pedidos-01` apareció unos 10–15 minutos después (dos intentos = dos pantallas en el mismo proyecto). La conexión MCP `stitch-direct` de la sesión siguió mostrando solo el `DESIGN.md` subido; el endpoint HTTP de Stitch (`tools/call` de `list_screens` y `get_screen`, con la clave de API del usuario en la cabecera) ya listaba las dos.

**Why:** reintentar o crear un proyecto nuevo duplica pantallas y no acelera nada; con una conexión que no refresca, esperar no basta.
**How to apply:** tras el timeout, no reintentes más de una vez; sondea con `list_screens` y, si tras ~10 minutos no sale, pide al usuario otra conexión o la URL del proyecto y consulta por HTTP. Baja HTML y captura con `get_screen` (las URLs firmadas bajan con curl; la captura sale en miniatura, renderiza el HTML con Playwright). `design fidelity` solo mide `#id`: agrega ids a la copia local ([[design-fidelity-needs-section-id]]). Una sección que lea listas anidadas (`groups[].items[]`) cuenta sus fotos en `validate` solo si `groups` está en la lista de claves de imagen; el slot de copy `cta` también debe estar permitido. Ver [[stitch-native-reconstruction]].
