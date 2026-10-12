---
name: template-spec-compiler
description: Plantillas desde template.spec.json; unicidad por construcción, marcas GENERATED/FROZEN
type: project
date: 2026-10-11
commit: 7df02d7
---

Las plantillas nuevas salen de `packages/template-kit/specs/<stem>.spec.json` (zod, `specVersion: 1`) con `pnpm lattiz build`: el compilador (`src/spec/`) elige paleta, par tipográfico, portada, titular y variantes libres en el giro **antes** de compilar, valida todo en una carpeta temporal y solo entonces escribe manifiesto, tema propio (`themes/<id>.json`), pack de copy compartido por la gemela y perfil demo. Cada archivo lleva `GENERATED from specs/… (spec <hash>, file <hash>)`; el hash es del valor (JSON canónico), así prettier no es deriva. Editar a mano o `FROZEN` detiene el build. Giros en `giros/<giro>.ts` (restaurante, clínica, florería, estética, dental, despacho, tienda, gimnasio, veterinaria; barbería derivada de sus temas y packs). Misma entrada → mismos bytes (también el `.grapesjs`, desde `e10c73e`).

**Why:** clonar una barbería bloqueaba el seed de todo el rubro y el copy no era del giro. Se descartó `overrides.css`. Los datos de contacto viajan como `{{lz:*}}` en el `.grapesjs` y el HTML del kit los resuelve con el demo (ver [[kit-contact-site-tokens]]). Por defecto, placeholders y no Pexels: la salida no depende de si hay clave. La reproducción de `barberia-norte-v1` desde un spec da HTML, `.grapesjs`, meta y assets idénticos.
**How to apply:** nunca edites archivos generados: cambia el spec y recompila, o `lattiz freeze <id>`. El spec de reproducción vive en `fixtures/spec/` (fuera de `specs/`) para no sobrescribir la Norte. Ver [[template-distinctness-gate]], [[template-rhythm-tokens]], [[lattiz-template-cli]].
