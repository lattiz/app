# @lattiz/template-previews

Static Vercel project that serves one public, embeddable, non-indexed preview
page per template at `<TEMPLATE_PREVIEWS_BASE_URL>/<template-id>`. The dashboard
gallery iframes these pages and the seed script screenshots them for thumbnails.

- No build step, no runtime dependency on the API or the database — previews keep
  working if either is down.
- `public/<template-id>/index.html` is **generated and committed** by
  `scripts/parse-and-seed-template.ts`; don't edit it by hand, re-run the seed.
- `vercel.json` sends `X-Robots-Tag: noindex, nofollow`, allows framing from any
  origin (`frame-ancestors *`) and `robots.txt` disallows everything. No analytics,
  no cookie banner.

## Setup (once)

```bash
vercel login
TEMPLATE_PREVIEWS_DOMAIN=templates.lattiz.app pnpm tsx scripts/setup-template-previews.ts
```

The script is idempotent: it creates/links the `template-previews` project,
deploys, optionally attaches the custom domain and prints the DNS record to add in
Cloudflare plus the `TEMPLATE_PREVIEWS_BASE_URL` value.

## Deploy

The seed script deploys after each template (skip with `--no-deploy`). Manually:

```bash
pnpm --filter @lattiz/template-previews deploy
```

See `docs/adding-templates.md` for the full designer → live workflow.
