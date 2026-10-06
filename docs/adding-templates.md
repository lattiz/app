# Adding a template

From a designer's GrapesJS Studio project to a template that tenants can pick in
`/dashboard/templates`, in one command.

## 1. Designer hands over two exports

From GrapesJS Studio, for a **single-page** `web` project:

1. **Project file** — _Export → Project_ (`.grapesjs`, JSON).
2. **Code export** — _Export → Code_ (a folder or zip with `index.html` and
   `style.css`; unzip it). Relative stylesheets/scripts next to `index.html` are
   inlined into the preview.

Use a stable id: lowercase, digits and dashes, 3–60 chars, versioned
(`restaurante-moderno-v1`). It becomes a URL segment and an R2 key prefix.

## 2. One-time setup

- `vercel login` (or set `VERCEL_TOKEN`) and run
  `pnpm tsx scripts/setup-template-previews.ts` once — see
  `apps/template-previews/README.md`.
- Put `TEMPLATE_PREVIEWS_BASE_URL` in the root `.env` (see `.env.example`); the
  Supabase and R2 keys are read from `apps/api/.env` if not set there.
- `pnpm exec playwright install chromium` for thumbnails (the script falls back
  to an installed Google Chrome).

## 3. Run it

```bash
pnpm tsx scripts/parse-and-seed-template.ts \
  --file ./restaurante.grapesjs --html ./restaurante-export/index.html \
  --id restaurante-moderno-v1 --name "Restaurante Moderno" --category restaurantes \
  --description "Menú, reservas y ubicación" --sort-order 10
```

Stages, each idempotent (re-running the same command resumes):

| #   | Stage                                                                                                                                                                       | Side effect |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 1   | Validate JSON, `projectType: web`, exactly one page, id format                                                                                                              | —           |
| 2   | Collect `cdn.grapesjs.com/workspaces/…` and legacy Supabase Storage URLs from the JSON and HTML                                                                             | —           |
| 3   | Download (30 s timeout, 3 retries, ≤15 MB, image/video/font) and upload to R2 as `templates/<id>/<sha256[:16]>.<ext>` — all-or-nothing, existing objects skipped            | R2          |
| 4   | Rewrite URLs; abort if any old URL remains                                                                                                                                  | —           |
| 5   | Write `apps/template-previews/public/<id>/index.html` (adds `<title>` if missing, noindex meta)                                                                             | file        |
| 6   | Upsert `public.templates`; new rows start `is_active=false`, existing rows keep `is_active`/`sort_order` unless flags are passed. Tenants' `site_schemas` are never touched | DB          |
| 7   | `vercel deploy --prod` and wait for `<base>/<id>` to return 200                                                                                                             | Vercel      |
| 8   | 1280×800 JPEG screenshot → R2 → `thumbnail_url`                                                                                                                             | R2, DB      |
| 9   | `is_active=true` only if 7 and 8 succeeded                                                                                                                                  | DB          |

Flags: `--dry-run` (stages 1–2 plus asset sizes, no writes), `--no-deploy` (batch
several templates, then deploy once and re-run each without the flag),
`--no-thumbnail`, `--no-preview`.

## 4. Verify, then commit

- Open `<TEMPLATE_PREVIEWS_BASE_URL>/<id>` — the page renders, images come from
  `assets.lattiz.app`.
- `/dashboard/templates` shows the thumbnail and the live iframe preview.
- `curl <api>/public/templates` lists it (never with `grapesjs_json`).
- Commit `apps/template-previews/public/<id>/index.html`.

To retire a template set `is_active=false`; tenants who already picked it keep
their own copy of the project.
