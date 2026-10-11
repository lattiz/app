---
name: image-optimizer-memory-model
description: Imágenes a WebP ≤ 2000 px con sharp; cola acotada, disco temporal y límites de memoria
type: project
date: 2026-10-11
commit: 29a0a0d
---

Toda imagen subida al editor (y las del seed) pasa por `ImageOptimizer` (`apps/api/src/common/images/`, sin Nest, sharp 0.35 igual que template-kit): WebP calidad 80, effort 4, auto-orientación, sin metadatos, `fit: inside` a `IMAGE_MAX_DIMENSION`. Si re-codificar infla una JPG/PNG/WebP sin EXIF/XMP/IPTC que ya cabe, se guarda el original; SVG y animadas ≤ 5 MB pasan tal cual; HEIC se rechaza con mensaje en español. Memoria: `sharp.cache(false)`, `sharp.concurrency(1)`, `sequentialRead`, tope de 50 MP fuera de JPEG (JPEG usa shrink-on-load), multer a disco (`dest: tmpdir()`), un lote entero ocupa un solo hueco de la cola (`IMAGE_OPTIMIZER_CONCURRENCY`=1, `IMAGE_OPTIMIZER_QUEUE_MAX`=4) y la cola llena responde 503 `IMAGE_PROCESSING_BUSY` + `Retry-After`. En producción `MALLOC_ARENA_MAX=2` y `/tmp` (tmpfs, cuenta contra `mem_limit`) limitado a 256m.

Medido en el contenedor con `--memory=900m --cpus=1`: pico de cgroup 290 MiB con JPEG de 12 y 48 MP, PNG de 20 MP, 6 subidas simultáneas de 3 imágenes y 10 simultáneas (una 503), sin OOM.

**Why:** la VM de producción es e2-small (2 GB) y el contenedor tiene 900 MB; con memoria en heap y decodificaciones en paralelo una ráfaga de fotos de móvil lo tumbaba. Por lote y no por archivo para no dejar subidas a medias. El original sin metadatos se conserva solo si no tiene EXIF, para no publicar GPS.
**How to apply:** cualquier ruta nueva que procese imágenes usa `ImagesModule` (una instancia por proceso = una sola cola) y envuelve el trabajo en `run()`; no tocar los flujos de favicon/OG. La cuota de prueba cuenta bytes guardados, no subidos.
