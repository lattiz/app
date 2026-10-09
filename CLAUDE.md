# CLAUDE.md

## Project Map

`lattiz` — pnpm workspace + Turborepo monorepo, deploy target undecided (deferred; `turbo run build` is the only precondition).
- `apps/api` — NestJS 11 resource server, hexagonal architecture, Supabase JWT verification, Drizzle ORM over Supabase Postgres.
- `apps/web` — React 19 + Vite 8 SPA, TanStack Query, Tailwind CSS v4 + shadcn/ui (`base-luma` style), Supabase Auth client.
- `packages/api-client` — typed API client generated from `apps/api/openapi.json` via `@hey-api/openapi-ts`, with TanStack Query bindings.

## Architecture Invariants

1. **NestJS never implements auth endpoints.** Supabase Auth is the only identity source; `apps/web/src/supabase.ts` calls `supabase-js` directly for signup/login/OAuth/reset. `apps/api` has no signup/login/logout routes.
2. **The web app never talks to Postgres.** All application data goes through NestJS; Supabase is used from the front only for auth (`apps/web/src/api.ts` attaches the Supabase access token as a bearer header to every API call).
3. **JWTs are verified locally via JWKS, ES256 only.** `apps/api/src/common/auth/supabase-jwt.guard.ts` hardcodes `ALGORITHMS = ['ES256']` and audience `'authenticated'`; the HS256 legacy Supabase secret is never used.
4. **`service_role` key never reaches the client.** `apps/web` only reads `VITE_SUPABASE_ANON_KEY`; there is no server-role key in any `VITE_`-prefixed variable.
5. **Hexagonal layering applies only at real external-dependency boundaries.** `modules/me` (Postgres via Drizzle) has full `domain/application/infrastructure/interface` layering; trivial logic is not wrapped in ports/adapters by dogma.
6. **Domain code throws `DomainException` subclasses, never `HttpException`.** `apps/api/src/common/filters/domain-exception.filter.ts` is the single place that normalizes any error to `{ error: { code, message, details? } }`.
7. **Generated API types are never hand-edited.** `packages/api-client/src/generated/**` is produced by `pnpm generate:api` from `apps/api/openapi.json`; editing it is overwritten on next generation.
8. **`profiles.id` is the Supabase JWT `sub`.** `apps/api/src/database/schema/profiles.ts` treats `auth.users` as owned by Supabase — the app schema only stores its own `profiles` table keyed by that id.

## Tech Stack

| Layer | Package | Version |
|---|---|---|
| Monorepo | pnpm (`packageManager`) | `11.5.2` |
| Monorepo | turbo | `^2.5.8` |
| Node | engines | `>=24 <25` (`.nvmrc` = `24`) |
| Backend | `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express` | `^11.0.13` |
| Backend | `@nestjs/swagger` | `^11.0.6` |
| Backend | `@nestjs/config` | `^4.0.4` |
| Backend | `class-validator` / `class-transformer` | `^0.14.1` / `^0.5.1` |
| Backend | `drizzle-orm` / `drizzle-kit` | `^0.45.2` / `^0.31.10` |
| Backend | `postgres` (postgres.js) | `^3.4.9` |
| Backend | `jose` (JWKS/JWT verification) | `^5.10.0` |
| Frontend | `react` / `react-dom` | `^19.2.0` |
| Frontend | `vite` / `@vitejs/plugin-react` | `^8.0.16` / `^6.0.2` |
| Frontend | `@tanstack/react-query` | `^5.101.0` |
| Frontend | `@supabase/supabase-js` | `^2.108.0` |
| Frontend | `tailwindcss` / `@tailwindcss/vite` | `^4.3.2` |
| Frontend | `shadcn` (CLI) | `^4.12.0` (style: `base-luma`, base: `@base-ui/react`, icons: `lucide-react`) |
| api-client | `@hey-api/openapi-ts` | `^0.98.2` |
| api-client | `@hey-api/client-fetch` | `^0.13.1` |
| Tooling | `eslint` (flat config) | `^9.18.0` |
| Tooling | `prettier` | `^3.4.2` |
| Tooling | `typescript` | `^5.8.3` |

## Commands

**Root** (`pnpm <script>`):
- `dev` — `turbo run dev` (API on `:3000`, web on `:5173`, Swagger at `/docs`)
- `build` — `turbo run build`, respects dependency order (`api` → `api-client` → `web`)
- `typecheck` — `turbo run typecheck`
- `lint` / `lint:fix` — `eslint .` (flat config at repo root, not per-package)
- `format` / `format:check` — `prettier`
- `test` — `turbo run test`
- `generate:api` — `turbo run generate:openapi generate:client` (API writes `openapi.json`, then `api-client` regenerates)

**`apps/api`** (`pnpm --filter @lattiz/api <script>`):
- `dev` — `nest start --watch`
- `build` — `nest build`
- `generate:openapi` — builds then runs `dist/generate-openapi.js` to write `apps/api/openapi.json` without starting the server
- `db:studio` — `drizzle-kit studio` (Drizzle is only the query builder; it owns no migrations)

**Database schema** (Supabase CLI, from the repo root):
- `supabase migration new <name>` — creates `supabase/migrations/<timestamp>_<name>.sql`; never invent the filename
- `supabase db reset --local` — rebuilds the local database from every migration (requires `supabase start` + Docker)
- `supabase db push` — applies pending migrations to the linked project; `supabase db diff --linked` detects drift

**`apps/web`** (`pnpm --filter @lattiz/web <script>`):
- `dev` — `vite`
- `build` — `tsc --noEmit && vite build`

**`packages/api-client`** (`pnpm --filter @lattiz/api-client <script>`):
- `build` — `tsc -p tsconfig.json`
- `generate:client` — `openapi-ts` (config in `openapi-ts.config.ts`, reads `../../apps/api/openapi.json`)

## Code Conventions

**TypeScript:**
- `apps/api/tsconfig.json`: `commonjs`, `experimentalDecorators` + `emitDecoratorMetadata` (Nest requirement), `strictNullChecks` + `noImplicitAny` (not full `strict`), target `ES2023`.
- `apps/web/tsconfig.json`: full `strict: true`, `verbatimModuleSyntax: true`, `noUnusedLocals`/`noUnusedParameters`, target `ES2022`. Path alias `@/*` → `./src/*` (added for shadcn/ui; mirrored in `vite.config.ts` via `resolve.alias`).
- `packages/api-client/tsconfig.json`: `strict: true`, emits declarations to `dist/`.

**React (`apps/web`):**
- Function components only, named exports (`export function App()`), no default exports for components.
- Server state via TanStack Query hooks generated into `@lattiz/api-client` (e.g. `healthControllerHealthOptions()`, `meControllerMeOptions()`) — never hand-written fetch calls or manual types for API data.
- Local/UI state via `useState`; no state management library.
- No custom hooks exist yet — none to imitate.

**NestJS (`apps/api`), per module:**
```
modules/<name>/
├─ domain/          interfaces (ports) + Symbol DI tokens, entities
├─ application/      use-cases — depend on ports only, never on adapters directly
├─ infrastructure/   adapters implementing the ports (e.g. DrizzleUserRepository, MockHealthCheckAdapter)
└─ interface/        controllers + class-validator/swagger DTOs
```
- Ports are interfaces + a `Symbol('...')` DI token exported next to them (e.g. `USER_REPOSITORY_PORT`, `HEALTH_CHECK_PORT`), wired via `@Inject(TOKEN)` and `provide`/`useClass`.
- Controllers stay thin: inject one use-case, call `.execute()`, return a DTO. See `health.controller.ts` (public) and `me.controller.ts` (`@UseGuards(SupabaseJwtGuard)` + `@CurrentUser()`).
- Swagger: `@nestjs/swagger` CLI plugin (`nest-cli.json` → `introspectComments: true`) auto-documents DTOs from TSDoc comments — decorate DTOs with `@ApiProperty()` but don't hand-write descriptions already covered by comments.
- Global: `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` and `DomainExceptionFilter` are wired once in `main.ts`.

**Naming:**
- Backend filenames are kebab-case with a type suffix: `*.controller.ts`, `*.dto.ts`, `*.use-case.ts`, `*.port.ts`, `*.entity.ts`, `*.repository.ts`, `*.guard.ts`, `*.decorator.ts`, `*.filter.ts`, `*.exception.ts`.
- DI Symbol tokens are `UPPER_SNAKE_CASE`, exported from the same file as the port they identify.
- Frontend components are PascalCase files under feature folders (`components/auth/LoginForm.tsx`).
- DB columns are `snake_case` (Drizzle schema maps camelCase fields, e.g. `displayName` → `display_name`).

**Comments:** one line max, only when the *why* isn't obvious from the code (e.g. `// Dev: allow all origins. Prod: CORS_ORIGIN env (comma-separated) or deny.` in `main.ts`). No comments describing *what* the code does.

## File Structure

```
apps/api/src/
├─ main.ts, app.module.ts, swagger.ts, generate-openapi.ts
├─ common/
│  ├─ auth/            supabase-jwt.guard.ts, current-user.decorator.ts, authenticated-user.ts
│  ├─ exceptions/       domain.exception.ts
│  └─ filters/          domain-exception.filter.ts
├─ database/
│  ├─ database.module.ts   (Drizzle + postgres.js factory, DI token DATABASE)
│  └─ schema/               profiles.ts, index.ts
└─ modules/
   ├─ health/     domain/ application/ infrastructure/ interface/   (public GET /health)
   └─ me/         domain/ application/ infrastructure/ interface/   (protected GET /me)

apps/web/src/
├─ main.tsx, App.tsx, api.ts, supabase.ts, index.css
├─ components/auth/LoginForm.tsx
└─ lib/utils.ts        (shadcn `cn()` helper)

packages/api-client/src/
├─ index.ts             (public surface — re-exports generated + client)
└─ generated/           (committed, hey-api output — do not hand-edit)

supabase/
├─ config.toml          (Supabase CLI project config)
└─ migrations/          (the only schema history — applied with `supabase db push`)
```

## What to Never Do

- **Database:** Never change the schema from the Supabase dashboard, `execute_sql`/`apply_migration`, or `drizzle-kit` — every change is a file in `supabase/migrations/` (the only schema history), tested with `supabase db reset --local` before `supabase db push`.
- **Auth:** Never add signup/login/logout/forgot-password endpoints to `apps/api` — that logic lives only in Supabase, called from `apps/web/src/supabase.ts` / `LoginForm.tsx` via `supabase-js`.
- **Auth:** Never verify JWTs against the HS256 legacy secret — `apps/api/src/common/auth/supabase-jwt.guard.ts` must keep `ALGORITHMS = ['ES256']` and derive JWKS from `SUPABASE_URL`/`SUPABASE_JWKS_URL`.
- **Database:** Never query Postgres from `apps/web` — there is no Drizzle/`DATABASE_URL` dependency in the web app; all data reads/writes go through NestJS.
- **Database:** Never put the `service_role` key in `apps/web/.env` or any `VITE_`-prefixed variable — only `VITE_SUPABASE_ANON_KEY`.
- **NestJS:** Never throw `HttpException` (or subclasses) from `domain/` or `application/` code — throw a `DomainException` subclass so `domain-exception.filter.ts` can normalize the response shape.
- **NestJS:** Never introduce full hexagonal layering (`domain/application/infrastructure/interface`) for logic with no real external dependency — compare `modules/me` (has a real Postgres adapter) against what would be over-engineering for trivial CRUD.
- **React:** Never hand-write types or fetch calls for API data — consume the generated hooks/types from `@lattiz/api-client` (`packages/api-client/src/generated/**`), and never edit that generated directory directly; run `pnpm generate:api` instead.

## Registro de decisiones

Memoria compartida del equipo, en git: `docs/decisions/` (un archivo por decisión + índice). Índice y formato:

@docs/decisions/README.md

- Antes de decidir algo en un área, mira el índice: abre solo los archivos que apliquen (no los leas todos).
- CodeGraph (`codegraph_explore`) es solo de lectura; no guarda decisiones ni sirve de memoria.
- Se registra una decisión solo cuando está **aplicada, probada y commiteada**. Un hook (`.claude/hooks/decision-reminder.sh`, configurado en `.claude/settings.json`) lo recuerda tras cada `git commit`. Si cumple las cuatro condiciones: crear `docs/decisions/<slug>.md`, añadir una línea al índice y commitear como `docs(decisions): <slug>`.
- Es decisión importante: elegir o descartar una librería, versión o enfoque; un cambio de arquitectura o de despliegue; una causa raíz tras depurar; un hallazgo no obvio. No registrar lo que ya recoge git ni cambios triviales.
- Si una decisión cambia o queda obsoleta, editar o borrar su archivo en el mismo commit; no acumular versiones viejas.
- Solo el agente principal escribe en `docs/decisions/`. Los subagentes (Agent tool) no lo hacen: devuelven hallazgos y el principal decide. Al delegar, el prompt del subagente debe incluir esta prohibición.
- Nada de secretos en las decisiones (tokens, claves, handles de cuentas): el repo se comparte.
