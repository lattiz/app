# CLAUDE.md — `@lattiz/template-kit`

Templates are source code here. A manifest + content pack + theme compile into the
`.grapesjs` project and the preview `index.html` that `scripts/parse-and-seed-template.ts`
seeds. GrapesJS Studio is not used. Human-facing guide: `docs/lattiz-template-guidelines.md`;
tiers, SEO contract and gating proposal: `docs/template-tiers.md`.

## Layout

```
sections/<slot>/<variant>/  section.html (fragment + bindings) · section.css · meta.ts (label, region, contentKeys)
core.css                    lz-* classes shared by more than one slot
themes/<name>.json          the only token source → :root. tier, fontPair, colors (incl. accent-text), fonts (case, leading,
                            weight, scale, accent style), shape (radii, border, shadow), density, photoTreatment, placeholder
content/<vertical>.<voice>.es-MX.ts  one pack per copy voice (barbería: oxido, norte, concreto, trazo); plumbing in <vertical>.shared.ts
src/tiers.ts                Basic/Pro: counted range, required/optional roles, similarity limit, seoProfile, exclusive, editableTokens
blueprints/<family>.<tier>.ts  roles allowed in that tier (+ allowed variants), archetypes, guidance
blueprints/<family>.shared.ts  role regions/positions/purpose, per-vertical role → slot map + schemaType
templates/<id>.ts           manifest: { id, name, category, description, family, tier, vertical, archetype, theme, content, business?, head?, sections[] }
assets/<vertical>/<theme>/  images per template identity; missing files become art-directed placeholders (see its README)
dist/<id>/                  build output (gitignored): <id>.grapesjs, index.html, manifest.json, template.meta.json, assets/, thumbnail.jpg, review/*.png
dist/_contact-sheet.png     every built template at thumbnail size (kit:compare-visual)
fixtures/                   oxido/ (Studio export), broken/ (must fail every rule), clone/ (an ÓXIDO copy that must fail uniqueness), spike/
```

## Tiers in one minute

- **Counted sections** = every slot except `floating-whatsapp` and `marquee`. Basic 6–7, Pro 8–10.
- **Basic** (any tenant): header, hero, catalog, contact (`locations/single`), faq, footer + whatsapp; optional about (`about/brief`). Basic templates of a vertical share the roles; theme, hero/services variants and copy make them distinct (similarity ≤ 0.85).
- **Pro** (Pro and higher plans; not exclusive, tenants can share one): header, hero, about (`text-image-offset` | `statement` | `stats-strip`), catalog, proof, testimonials, faq, contact (`locations/with-contact`), footer + whatsapp; optional team, marquee. Each Pro must feel distinct (similarity ≤ 0.5 vs other Pro of the vertical).
- Roles resolve to slots per vertical (`blueprints/service-landing.shared.ts › verticals`). Barbería: catalog → `services`, proof → `gallery`, contact → `locations`.
- No `<form>` anywhere; contact = WhatsApp / `{{phoneUrl}}` / `{{emailUrl}}` / map buttons. `floating-whatsapp` is mandatory and links to `{{whatsappUrl…}}`.

## Don't clone: pick theme, variants and voice

Every template of a vertical must be recognizable at thumbnail size. Before writing a manifest, list
what the other templates of the vertical use (`grep -h "theme:\|variant:" templates/<vertical>-*.ts`) and pick:

1. **A theme nobody uses** (`kit:validate` enforces unique theme, unique `fontPair`, accent hue ≥ 30°
   from every other template). New look → new `themes/<name>.json` with `tier` = the template's tier
   (a Pro theme is a Pro template's identity; Basic can't use it). Vary more than color: font pair,
   display case, `shape` (radius, border, shadow), `density`, `photoTreatment`, `placeholder`.
2. **Variants that change the silhouette**: the hero first (`image-bg`, `split`, `centered-arch`,
   `offset-card`; unique among Pro templates), then services (`price-list`, `cards`,
   `editorial-table`), about, team, testimonials, footer, navbar, gallery. Pro similarity ≤ 0.5.
3. **A voice**: an existing pack whose tone fits, or a new `content/<vertical>.<voice>.es-MX.ts`. The
   hero headline must be unique in the vertical; Basic templates sharing a pack override brand, hero
   and branch in the manifest.
4. **The squint test is part of done**: `kit:compare-visual` passes (above-the-fold distance ≥ 0.33
   against every template of the vertical) and you looked at `dist/_contact-sheet.png` and could tell
   every template apart.

## Create a template end to end

1. Pick the tier. Read `blueprints/<family>.<tier>.ts` (allowed roles/variants, archetypes) and the `meta.ts` of the variants you'll use (`contentKeys` lists what each needs).
2. Choose theme, variants and voice as above. Write `templates/<vertical>-<name>-v1.ts` (`satisfies Manifest`, with `tier`).
   - **Basic:** start from a `barberia-base-*` manifest: keep the roles, change theme, hero/services variants, brand, hero copy and branch (`singleBranch(trazoBranches.x)`).
   - **Pro:** start from the Pro manifest farthest from your idea and change hero, services and at least two more variants.
3. New vertical → add it to `verticals` in `blueprints/<family>.shared.ts` (role → slot map + `schemaType`) and write its voice packs (`satisfies ContentPack`). Per-template tweaks go in the manifest: `business` and `sections[].props` (shallow override of that slot's content).
4. `pnpm --filter @lattiz/template-kit kit:build templates/<id>.ts`, then `kit:compare-visual`.
5. Open `dist/<id>/thumbnail.jpg`, every `dist/<id>/review/*.png` (1280, 992, 390) and `dist/_contact-sheet.png`; look for unreadable text, broken layout, wrong order, two templates that read alike.
6. Fix and rebuild until there are no findings and the screenshots look right. A new variant must look right in two themes (one dark, one light) at 1280/992/390.
7. **Stop.** Print/hand over the seed command `kit:build` prints. Never run the seed, deploy, or touch Supabase/Vercel/R2 yourself. Upgrading an existing id in place is fine: the seed upserts by `--id`.

## Bindings in `section.html`

- `data-lz-key="path"` → innerHTML from content (HTML allowed; `.` = current item).
- `data-lz-attr-<name>="path"` → attribute value. `data-lz-if="path"` → drop element if empty.
- `data-lz-each="path"` → repeat the element (or a `<template>`'s children) per list item; lookups fall back to the section scope.
- `{{name}} {{shortName}} {{tagline}} {{phone}} {{email}} {{address}} {{city}} {{year}} {{instagramUrl}} {{googleReviewsUrl}} {{googleReviewUrl}} …` business fields, `{{whatsappUrl}}` / `{{whatsappUrl:mensaje}}`, `{{phoneUrl}}` (tel:), `{{emailUrl}}` (mailto:), `{{index}}` (sections with `numbered: true`). Unknown keys/variables fail the compile.
- `data-lz-name="…"` names an inner component in the editor's layer manager (section roots get `meta.label`).

## Rules the validator enforces (`kit:validate`)

Color literals outside `:root` (only `#25D366` allowed; SVG uses `currentColor`) · no `style=""` / `#id` rules · local `assets/` images only, with `alt` · `data-lz-slot` + `data-lz-variant` on every page block · `lz-*` BEM classes only (no Tailwind) · no JS · exactly one `<h1>` · every animation/transition has a `prefers-reduced-motion` override · breakpoints 992/480 only · `radius.card` ≤ 32px · WCAG AA contrast for the theme's token pairs · in-page anchors resolve · project is `web`, one page, no `.gjs-t-*`/`globalStyles` · counted sections inside the tier range · required roles present · `floating-whatsapp` present with a wa.me link · no `<form>` · headings never skip a level · `<img>` with numeric `width`/`height` · links with a real href and an accessible name · `<html lang>`, `<title>` and meta description in `<head>` · `faq` uses `<details open><summary>` · similarity ≤ the tier's limit vs manifests of the same vertical **and** tier (slot+variant pairs, order, hero and services variant, theme, font pair, shape) · a theme only serves its own tier · within the vertical: unique theme, font pair and hero headline, accent hue ≥ 30° apart, unique hero variant among Pro.

Findings carry `file:line`; markup findings point at the `section.html` line the element came from.

## Don'ts

- Don't edit `dist/` or the seeded `apps/template-previews/public/<id>/index.html` by hand; rebuild.
- Don't add `.gjs-t-*` classes or Studio `globalStyles`; the editor doesn't set `globalStyles.default`, so the panel is empty for every template by design. `--lz-*` tokens are the only token system.
- Don't add keys to the `.grapesjs` `custom` object (the editor expects `{ projectType, id }`); tier data goes in `template.meta.json`.
- Don't ship a closed `<details>`: the editor canvas can't open it, so its answer becomes uneditable.
- Don't run prettier on `sections/**/*.html` (whitespace-sensitive; the root `.prettierignore` only applies when run from the repo root).
- Don't hardcode colors in sections or themes' consumers; add/derive a token (`color-mix()` against a token). Accent as text is `--lz-color-accent-text`; `--lz-color-accent` is for fills.
- Don't hardcode type case, leading, borders or shadows in new variants; use `--lz-display-*`, `--lz-border-width`, `--lz-shadow(-sm)`, `--lz-photo-filter`, `--lz-stack`.
- Don't reuse another slot's block class in a variant (`lz-card` is team's); give every variant its own `lz-<slot>-<variant>` block.
- Don't change a shared section to fix one template; add a variant folder instead.
- After changing a shared section, compare the previous build with the new one: copy `dist/<id>` aside before the change, rebuild, then `kit:compare <old>/index.html dist/<id>/index.html`. Sections are matched by `data-lz-slot`, so added sections don't hide other diffs. (`fixtures/oxido` is the phase-1 Studio original; the Pro ÓXIDO now adds gallery, FAQ and the contact block on top of it.)

## Commands

`kit:extract <file.grapesjs|index.html [style.css]> --vertical v --variant n [--out dir] [--force]` · `kit:compile [manifest…]` · `kit:validate [dist/<id>|manifest…]` · `kit:shoot [dist/<id>…]` · `kit:build [manifest…]` · `kit:compare [reference.html] [dist/<id>/index.html]` · `kit:compare-visual [dist/<id>…] [--sheet file]` · `test` (vitest) · `typecheck`.
