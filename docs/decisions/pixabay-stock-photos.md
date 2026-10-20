---
name: pixabay-stock-photos
description: Pixabay es el único proveedor de fotos (editor y build del kit); Pexels sale del código
type: external
date: 2026-10-20
commit: 9f0e13e
---

Pixabay reemplaza a Pexels en el buscador del editor (`apps/api/src/modules/stock`, adaptador detrás de `StockPhotoProviderPort`) y en `lattiz build`, que con `PIXABAY_API_KEY` (shell, `.env` o `apps/api/.env`) baja solo las fotos de cada `images[]` (`{ "search": "…" }`; `{ "pexels": "…" }` queda como alias). `tenant_stock_assets.provider` acepta `'pixabay'` (filas viejas `'pexels'` intactas); `CREDITS.json` viejos con `pexels` se siguen leyendo.

**Why:** la `PEXELS_API_KEY` caducó y no se emiten nuevas, así que cada plantilla exigía pegar URLs a mano. Reglas de Pixabay que condicionan el código: sin acceso completo, `largeImageURL` ≤ 1280 px (basta: el hero nuevo es ≤ 1200 px); `webformatURL` caduca a las 24 h; hay que cachear búsquedas 24 h; 100 llamadas por minuto con `X-RateLimit-Reset` en **segundos**; prohibido el hotlink (se descarga a R2 o `assets/`); un id inexistente responde **400**, no 404; los hits traen `isAiGenerated`/`isLowQuality` (se descartan). La licencia no exige crédito en el sitio; el buscador sí debe decir de dónde vienen las fotos.
**How to apply:** la clave también tiene que estar en el entorno de la API de producción o el botón «Fotos gratuitas» no aparece (`/stock/status` → `enabled: false`). En el kit, escribe búsquedas en inglés concretas al negocio y, tras el build, ajusta `alt`/pies con los `tags` de `CREDITS.json`; una foto se queda mientras su búsqueda no cambie. Pegar URLs sigue valiendo como plan B: [[spec-image-url-source]].
