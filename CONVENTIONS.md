# Lattiz — Convenciones

Decisiones de arquitectura y reglas de trabajo del monorepo.
Cuando tomes una decisión nueva, añádela aquí con una línea de justificación.

---

## Comentarios en el código

Solo cuando el **por qué** no es obvio. Una línea máximo. No describas lo que hace el código.

```ts
// Dev: allow all origins. Prod: CORS_ORIGIN env (comma-separated) or deny.
```

## Stack

| Capa | Tecnología |
|---|---|
| Monorepo | pnpm workspaces + Turborepo (`@lattiz/*`) |
| Node | 24 — fijado en `.nvmrc` y `engines` |
| Backend | NestJS, hexagonal solo en fronteras externas reales |
| Frontend | React + Vite + TypeScript + TanStack Query |
| Auth | Supabase Auth (NestJS = resource server puro) |
| ORM | Drizzle + postgres.js contra Postgres de Supabase |

## Hexagonal — cuándo crear un puerto

Crea un puerto (interfaz en `domain/`) **solo** cuando el módulo cruza una frontera con una dependencia externa real: persistencia, servicios de terceros, colas. La pregunta guía: *¿esto cambia si cambio el proveedor?*

No envuelvas CRUD trivial en capas por dogma.

```
modules/<module>/
├─ domain/          # entidades, puertos (interfaces + tokens Symbol)
├─ application/     # casos de uso — dependen de puertos, nunca de adaptadores
├─ infrastructure/  # adaptadores (Drizzle, HTTP clients, mocks para tests)
└─ interface/       # controllers + DTOs
```

Referencia: `modules/me` — `UserRepositoryPort` + `DrizzleUserRepository`.

## Manejo de errores

El dominio lanza subclases de `DomainException`. El filtro global `DomainExceptionFilter` normaliza todo error a:

```json
{ "error": { "code": "string", "message": "string", "details"?: unknown } }
```

Nunca lances `HttpException` desde dominio o aplicación.

## DTOs y validación

- **Backend:** `class-validator` + `class-transformer` en `interface/*.dto.ts`. El CLI plugin de Swagger (`nest-cli.json`) los documenta automáticamente.
- **Frontend:** `zod` para formularios y entradas del usuario.

No se unifican — desacopla el ciclo de vida de front y back.

## Pipeline de tipos

```
apps/api → openapi.json → packages/api-client (hey-api) → apps/web
```

- Genera con `pnpm generate:api` desde la raíz.
- Los archivos en `packages/api-client/src/generated/` están commiteados — no los edites a mano.
- Cuando cambies un DTO o una ruta: regenera y el front tendrá los tipos actualizados sin escribir nada.

## Auth — Supabase + JWKS

- Supabase es la única fuente de identidad. **NestJS no implementa login/signup/logout.**
- El front usa `supabase-js` directamente para todos los flujos de auth (signup+OTP, verify, set-password, login, logout) — con la `anon key`. Helpers en `apps/web/src/lib/auth.ts`; estado de sesión reflejado en el store Zustand `apps/web/src/stores/auth.store.ts` (respaldado por `sessionStorage`).
- NestJS verifica JWTs localmente vía JWKS (ES256, `aud=authenticated`). HS256 legacy: **no soportado**.
- El front adjunta el token como `Authorization: Bearer <token>` via interceptor (`apps/web/src/lib/api.ts`); un interceptor de respuesta cierra la sesión ante cualquier `401`.
- Todos los datos de aplicación van por NestJS — el front nunca habla directo con la DB.

### Excepción service_role — borrado de cuenta y subida de imágenes

Tres operaciones requieren credenciales privilegiadas y no pueden correr en el navegador. Son **las únicas** privilegiadas del API (la subida de imágenes solo usa la `service_role key` mientras `STORAGE_PROVIDER=supabase`):

- `SUPABASE_SERVICE_ROLE_KEY` y las `R2_*` viven **solo** en `apps/api/.env` — nunca en el front ni en ningún `VITE_*` / `NEXT_PUBLIC_*`.
- El cliente admin de Supabase se crea de forma perezosa: el API arranca sin la key; solo falla la ruta que la necesita.

**1. Borrado de cuenta** — `supabase.auth.admin.deleteUser`:

- Se usa exclusivamente en `SupabaseAuthAdminAdapter` (`modules/me/infrastructure/`), detrás del puerto `AuthAdminPort`, alcanzable solo vía `DELETE /me` (protegido por `SupabaseJwtGuard`).
- `DELETE /me` borra el `profile` (Drizzle) y luego el auth user, en ese orden.

**2. Subida de assets del editor** y **3. Branding del tenant** — `ObjectStoragePort` (`modules/storage/`):

- `StorageModule` expone el puerto `OBJECT_STORAGE_PORT`; `SitesModule` y `TenantsModule` lo importan. `STORAGE_PROVIDER=r2|supabase` elige el adaptador al arrancar (`r2` falla al bootear si falta cualquier `R2_*`). Con `supabase` se usa la `service_role key` (este es el caso privilegiado); con `r2`, un token S3 de Cloudflare R2 que vive **solo** en `apps/api/.env`.
- Bucket público (`lattiz-assets` en R2, servido desde `https://assets.lattiz.app`; `template-assets` en Supabase hasta retirarlo). Las rutas se construyen en el servidor, nunca desde el cliente; el adaptador rechaza rutas con `..`, `/` inicial o caracteres de control.
- Errores del proveedor → `ObjectStorageException` (con el detalle solo en logs); los servicios lo traducen a `ASSET_UPLOAD_FAILED` / `BRANDING_UPLOAD_FAILED`, y el front muestra el mensaje en español de `apps/web/src/lib/upload-errors.ts`.
- **Editor:** solo vía `POST /sites/:tenantId/assets`, tras verificar que el tenant pertenece al usuario. Ruta `tenant-assets/{tenantId}/{uuid}.{ext}`, solo `image/*`.
- **Branding:** solo vía `POST /tenants/:tenantId/branding` y `DELETE /tenants/:tenantId/branding/:type`, tras verificar el tenant. Ruta única por subida `tenant-branding/{tenantId}/{type}-{uuid}.{ext}` (la extensión sale del mime type validado). Whitelist por slot: PNG/ICO ≤ 1MB para favicons, PNG/JPEG ≤ 4MB para la vista previa. Al reemplazar o borrar se elimina el objeto anterior, y solo si está bajo el prefijo de ese tenant.
- Cache: claves únicas → `public, max-age=31536000, immutable`; claves reescribibles (`upsert`, p. ej. assets de plantillas re-sembrados) → `max-age=300`. No se versiona con `?v=`.

### Google Analytics 4 — credenciales solo en NestJS

Analíticas del plan Pro: Lattiz es dueño de una cuenta de GA y crea una propiedad + un web stream por tenant (`modules/analytics/`).

- `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64` y `GA4_ACCOUNT_ID` viven **solo** en `apps/api/.env`, con la misma regla que la `service_role key`: nunca en `apps/web`, `apps/tenant-sites` ni en ningún `VITE_*` / `NEXT_PUBLIC_*`.
- Los datos de GA se leen **solo a través de NestJS** (`GET /analytics/overview`, caché de 1 h en `analytics_report_cache`). El front nunca llama a la Data API.
- `tenant-sites` (anon key) solo puede leer tres columnas de `tenant_analytics` — `tenant_id`, `ga4_measurement_id`, `provisioning_status` — y solo filas `ready` (grant por columna + RLS). Nunca le des más columnas a `anon`.
- La elegibilidad (plan `pro` + suscripción vigente) se deriva al leer; no hay un flag que pueda quedar desincronizado. Las propiedades de GA nunca se borran automáticamente.
- `GA4_MOCK=true` funciona sin credenciales; `tenant-sites` nunca inyecta un ID `G-MOCK…` en producción.

## ORM — Drizzle

- Drizzle es solo el query builder (`apps/api/src/database/schema/`). Las migraciones viven en `supabase/migrations/` (Supabase CLI) — ver `SETUP.md`.
- `DATABASE_URL` es obligatorio para arrancar la API. Usar **Session Pooler** de Supabase (puerto 5432) — ver `SETUP.md`.
- Cambios de schema: `supabase migration new <nombre>` → `supabase db reset --local` → `supabase db push`. Nunca desde el dashboard ni con `drizzle-kit`.
- `profiles.id` = `sub` del JWT de Supabase. La tabla `auth.users` es de Supabase, no se toca.

## CORS

Dev: cualquier origen. Prod: `CORS_ORIGIN` env (separado por comas), si está vacío se rechazan peticiones cross-origin. **Setear antes de producción.**

## Tooling

- **ESLint** (`pnpm lint` / `pnpm lint:fix`) — flat config en raíz. Ignora `dist/`, `src/generated/`, `drizzle/`.
- **Prettier** (`pnpm format` / `pnpm format:check`) — excluye código generado y buildeado.
- **Typecheck** (`pnpm typecheck`) — `tsc --noEmit` por paquete vía Turborepo.

## Producción (pendiente)

- Deploy target: sin definir — `turbo run build` es la única precondición.
- MFA, leaked-password protection, SMTP propio: configuración del dashboard de Supabase, no de este código.
- `CORS_ORIGIN` debe estar seteada.
