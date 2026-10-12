---
name: vitest-hook-timeout-dist
description: tests del kit dan «2 skipped» si hay más carpetas en dist/; hookTimeout de 10 s al límite
type: gotcha
date: 2026-10-12
commit: 7b66734
---

`test/validate.test.ts` compila seis plantillas en un `beforeAll` con el `hookTimeout` por defecto (10 s). Con cinco carpetas en `packages/template-kit/dist/` el hook se pasa del tiempo y vitest reporta «85 passed | 2 skipped» (`Hook timed out in 10000ms`); con tres o ninguna pasan las 87. Pasa igual en `main` sin cambios.

**Why:** se vio al correr las pruebas después de un `lattiz build`; la causa probable es el escaneo de dependencias de Vite, que toma cada `**/*.html` bajo la raíz del paquete como entrada y compite por CPU con la compilación del hook.
**How to apply:** si ves «2 skipped» en el kit, borra `dist/` (es salida regenerable) y vuelve a correr antes de buscar una regresión. Subir `hookTimeout` en `vitest.config.ts` lo arreglaría; se dejó para un cambio aparte. Ver [[placeholder-bytes-host-dependent]].
