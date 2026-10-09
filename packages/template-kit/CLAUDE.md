# CLAUDE.md — `@lattiz/template-kit`

Templates are source code here. A manifest + content pack + theme compile into the
`.grapesjs` project and the preview `index.html` that `scripts/parse-and-seed-template.ts`
seeds. GrapesJS Studio is not used. Human-facing guide: `docs/lattiz-template-guidelines.md`.

## Layout

```
sections/<slot>/<variant>/  section.html (fragment + bindings) · section.css · meta.ts (label, region, contentKeys)
core.css                    lz-* classes shared by more than one slot
themes/<name>.json          the only token source → generated :root (colors, fonts, radius-pill/card, filters)
content/<vertical>.es-MX.ts business data + texts per slot (TS: share consts, use mapsLinkUrl/mapsEmbedUrl)
blueprints/<family>.ts      slots, regions, required/first/last, archetypes, guidance
templates/<id>.ts           manifest: { id, name, category, description, family, vertical, archetype, theme, content, business?, head?, sections[] }
assets/<vertical>/          local images (missing ones become sharp placeholders on compile)
dist/<id>/                  build output (gitignored): <id>.grapesjs, index.html, manifest.json, assets/, thumbnail.jpg, review/*.png
fixtures/                   oxido/ (Studio export, equivalence reference), broken/ (must fail every rule), spike/ (reference only)
```

## Create a template end to end

1. Read `blueprints/<family>.ts` and the `meta.ts` of the variants you'll use (`contentKeys` lists what each needs).
2. Write `templates/<vertical>-<name>-v1.ts` (`satisfies Manifest`). Pick a theme in `themes/` or add one (all tokens of `src/types.ts › COLOR_TOKENS` are required).
3. New vertical → write `content/<vertical>.es-MX.ts` (`satisfies ContentPack`). Per-template tweaks go in the manifest: `business` (name, phone…) and `sections[].props` (shallow override of that slot's content).
4. `pnpm --filter @lattiz/template-kit kit:build templates/<id>.ts`
5. Open `dist/<id>/thumbnail.jpg` and every `dist/<id>/review/*.png`; look for unreadable text, broken layout, wrong order.
6. Fix and rebuild until there are no findings and the screenshots look right.
7. **Stop.** Print/hand over the seed command `kit:build` prints. Never run the seed, deploy, or touch Supabase/Vercel/R2 yourself.

## Bindings in `section.html`

- `data-lz-key="path"` → innerHTML from content (HTML allowed; `.` = current item).
- `data-lz-attr-<name>="path"` → attribute value. `data-lz-if="path"` → drop element if empty.
- `data-lz-each="path"` → repeat the element (or a `<template>`'s children) per list item; lookups fall back to the section scope.
- `{{name}} {{shortName}} {{tagline}} {{phone}} {{address}} {{city}} {{year}} {{instagramUrl}} …` business fields, `{{whatsappUrl}}` / `{{whatsappUrl:mensaje}}`, `{{index}}` (sections with `numbered: true`). Unknown keys/variables fail the compile.
- `data-lz-name="…"` names an inner component in the editor's layer manager (section roots get `meta.label`).

## Rules the validator enforces (`kit:validate`)

Color literals outside `:root` (only `#25D366` allowed; SVG uses `currentColor`) · no `style=""` / `#id` rules · local `assets/` images only, with `alt` · `data-lz-slot` + `data-lz-variant` on every page block · `lz-*` BEM classes only (no Tailwind) · no JS · exactly one `<h1>` · every animation/transition has a `prefers-reduced-motion` override · breakpoints 992/480 only · `radius.card` ≤ 32px · WCAG AA contrast for the theme's token pairs · in-page anchors resolve · project is `web`, one page, no `.gjs-t-*`/`globalStyles` · similarity ≤ 0.6 vs other manifests of the same vertical.

## Don'ts

- Don't edit `dist/` or the seeded `apps/template-previews/public/<id>/index.html` by hand; rebuild.
- Don't add `.gjs-t-*` classes or Studio `globalStyles`; the editor doesn't enable them.
- Don't hardcode colors in sections or themes' consumers; add/derive a token (`color-mix()` against a token).
- Don't change a shared section to fix one template; add a variant folder instead.
- After changing a section used by ÓXIDO, run `kit:compare`: only image paths and the footer title casing may differ from `fixtures/oxido`.

## Commands

`kit:extract <file.grapesjs|index.html [style.css]> --vertical v --variant n [--out dir] [--force]` · `kit:compile [manifest…]` · `kit:validate [dist/<id>|manifest…]` · `kit:shoot [dist/<id>…]` · `kit:build [manifest…]` · `kit:compare [reference.html] [dist/<id>/index.html]` · `test` (vitest) · `typecheck`.
