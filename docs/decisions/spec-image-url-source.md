---
name: spec-image-url-source
description: fotos por URL pegada en images[] (sin API key); se descargan en el build, nunca hotlink
type: project
date: 2026-10-12
commit: 724dff2
---

`images[].source: { "url": "https://…" }` acepta fotos públicas de `images.pexels.com`, `images.unsplash.com` y `cdn.pixabay.com` (https; otro host o una redirección fuera de la lista se rechaza). El build las descarga una vez a `.lattiz/cache/images/`, las recorta como `{ "file" }` en `assets/<giro>/<id>/` y anota `CREDITS.json` (`source: "url"`, URL, página de Pexels). `copy.*.image` lleva siempre el nombre local; una URL ahí es error de `spec validate`.

**Why:** la `PEXELS_API_KEY` caducó y no se pueden emitir nuevas. Pegar la URL directo en el copy (lo primero que se probó) falla `kit:validate` (`external-image`) y, de pasar, viajaría como hotlink en el `.grapesjs` del cliente (el seed solo sube a R2 imágenes locales), con originales de ~1.5 MB y sin créditos. Descargar en el build no necesita key (solo la búsqueda la necesita), mantiene el flujo de recorte → R2 → WebP y es determinista (mismos bytes con la caché vacía).
**How to apply:** sin key, el humano elige las fotos y pega URLs; revisa en `review` que cada `alt`/pie describa la foto y que `team-*` sean retratos. Si cambias una foto de una clave que ya tenía archivo, la anterior se reemplaza (el build sabe que la escribió él); un archivo puesto a mano en `assets/` se conserva. Ver [[template-spec-compiler]], [[image-optimizer-memory-model]].
