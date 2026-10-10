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

## Plantillas — `packages/template-kit`

- **Las plantillas se escriben como código fuente en `packages/template-kit`; GrapesJS Studio ya no es dependencia.** Secciones + tema + content pack se compilan en el mismo `.grapesjs` + `index.html` que exportaba Studio, sin pagar export/IA y con diffs revisables.
- **Dos radios: `--lz-radius-pill` (botones, chips) y `--lz-radius-card` (tarjetas, paneles, mapas, marcos; ≤ 32px).** Un solo `--lz-radius` volvía ovaladas las tarjetas al poner botones en píldora.
- **El compilador genera toda estructura derivada (`:root`, `<head>` con fuentes, `custom`, nombres de capas) desde el tema; nunca copia colores.** Copiarlos dejaba texto invisible al cambiar de tema claro/oscuro.
- **No se emiten `.gjs-t-*`, el data source `globalStyles` ni valores `data-variable`.** `SiteEditor.tsx` no pasa la opción `globalStyles` del SDK, así que el SDK no muestra esos registros (`_internal`); mantenerlos sería un segundo sistema de tokens que nadie edita.
- **`kit:validate` es la compuerta:** ninguna plantilla se siembra con hallazgos (colores literales, contraste AA, breakpoints 992/480, reduced-motion, similitud por tier, rango de secciones, roles obligatorios, sin `<form>`, etc.).
- **Dos tiers, Basic y Pro, definidos solo en `src/tiers.ts`** (rangos, roles, similitud, perfil SEO, exclusividad, `editableTokens`). Los blueprints (`blueprints/<familia>.<tier>.ts`) hablan de roles y cada rubro los resuelve a slots; detalle en `docs/template-tiers.md`.
- **El tier vive en el manifiesto y en `dist/<id>/template.meta.json`, nunca en `custom` del `.grapesjs`:** el editor espera exactamente `{ projectType, id }`.
- **Contacto sin `<form>` en el MVP:** WhatsApp, `tel:` (`{{phoneUrl}}`), `mailto:` (`{{emailUrl}}`) y mapa.
- **FAQ con `<details open>`:** verificado en un canvas real de GrapesJS 0.22.16: el clic en `<summary>` solo selecciona el componente y nunca lo despliega, así que una respuesta cerrada no se puede editar. Abiertas se editan normal y el visitante aún puede plegarlas.

### Plantillas distintas entre sí (fase 3)

- **El tema es la identidad de una plantilla y es único por rubro.** Lleva `tier`, `fontPair`, `shape` (radios, borde, sombra none | soft | hard-offset), `density`, `photoTreatment` y la tipografía display (caja, interlineado, peso, escala). Un tema `pro` no se usa en Basic ni al revés.
- **`accent` es relleno, `accent-text` es el acento como texto.** Un acento lima no pasa AA como texto sobre blanco; con `accentWords: highlight` las palabras de acento van en tinta sobre una banda de acento y el contraste se valida contra esa banda.
- **Una voz por arquetipo** (`content/barberia.<voz>.es-MX.ts`); las Basic comparten la voz `trazo` y sobrescriben marca, portada y sucursal. Ninguna plantilla repite el titular de otra.
- **Fotos por tema en `assets/<rubro>/<tema>/`.** Las tres Basic comparten el arquetipo `essential`, así que la carpeta no puede ser por arquetipo; el tema sí es único. Los placeholders se generan con la paleta y el patrón (`placeholder`) del tema.
- **`kit:compare-visual` es parte de "terminado".** Se gatilla sobre la mitad superior (1280×800 → 160×100): la página completa reducida a tira casi solo mide claro vs oscuro y ordenaba un par de la fase 3 (0.384) por debajo de un clon de la fase 2 (0.431). Umbral 0.33, entre los clones de la fase 2 (0.168, 0.250) y el par más cercano de la fase 3 (0.408).
- Desviaciones del brief:
  - ÓXIDO conserva tres familias (Anton, Instrument Serif para el acento, Space Grotesk): es su identidad. Las demás usan dos familias más una mono opcional;
  - fases 3 y 6 del brief se hicieron juntas: un content pack solo trae las claves de las variantes que usan sus plantillas, así que las voces y los manifiestos finales cambiaron en el mismo commit;
  - las variantes `urban-luxe` se renombraron por lo que hacen (`inline`, `price-list`, `grid`, `text-image-offset`, `cards`, `big-wordmark`, `ticker`, `bubble`); `about/brief` se conserva como el about de Basic;
  - `bone-blue` se retiró y `urban-dark` pasó a llamarse `oxido`.

### Global Styles del SDK (hallazgo, sin cambios en esta fase)

- `SiteEditor.tsx` no pasa `globalStyles.default` al Studio SDK, así que el panel "Estilos globales" muestra "No hay estilos globales" en **todas** las plantillas. Es lo esperado, no un bug de plantilla.
- Los tokens `--lz-*` en `:root` siguen siendo el único sistema de tokens y hoy **no** son editables por el tenant desde ninguna UI.
- Idea de fase 3: el editor arma `globalStyles.default` a partir de `template.meta.json › editableTokens`, una entrada por token con `selector: ':root'` y `property: '--lz-<token>'` (p. ej. `--lz-color-accent`), re-validando el contraste AA al cambiar un color. No se vuelven a emitir `.gjs-t-*` ni el data source `globalStyles` en el proyecto.
- Desviaciones frente al brief, verificadas en el código:
  - headless usa `grapesjs@0.22.16`, la versión del Studio SDK 1.1.1 del editor, no 0.23;
  - el CSS se parsea con postcss (`parserCss`), porque el CSSOM de jsdom reescribe shorthands (`margin:0` → 4 longhands) y pierde `border` + `border-top` con `var()`;
  - tokens extra: `on-overlay` (texto sobre el velo de la portada, también en temas claros), `ink` (sombras), `--lz-map-filter` y `--lz-hero-image-filter`;
  - ÓXIDO tiene 7 enlaces `wa.me`, no 8;
  - la "G" de Google se volvió monocroma (`currentColor`): el único literal permitido es el verde de WhatsApp;
  - se corrigió `.lz-hero__inner { width: 100% }`, que anulaba `.lz-container` y pegaba el texto de la portada al borde en escritorio;
  - `html2project.js` no venía en los fixtures: se reimplementó a partir de `compose.js`/`lib.js` y del export de Studio;
  - la guía vieja vivía fuera del repo; la nueva es `docs/lattiz-template-guidelines.md`.
- Desviaciones de la fase 2 (Basic/Pro) frente al brief, verificadas en el código:
  - FAQ: `<details open>` en lugar de cerradas (ver arriba); el validador exige `open`;
  - roles con variante fija por tier: contacto Basic = `locations/single`, contacto Pro = `locations/with-contact`, about Basic = `brief`, about Pro = `text-image-offset` | `statement` | `stats-strip`;
  - `kit:compare` identifica cada sección por `data-lz-slot` (no por posición), para comparar una plantilla con secciones añadidas;
  - `googleReviewUrl` por defecto es la búsqueda del negocio en Google Maps; cada tenant pone su enlace `g.page/r/<id>/review`;
  - el saneador de sitios sin pago descarta `<details>`, `<summary>` e `<iframe>`: en vista previa gratuita el FAQ queda como texto y sin mapas (no se tocó).

## ORM — Drizzle

- Drizzle es solo el query builder (`apps/api/src/database/schema/`). Las migraciones viven en `supabase/migrations/` (Supabase CLI) — ver `SETUP.md`.
- `DATABASE_URL` es obligatorio para arrancar la API. Usar **Session Pooler** de Supabase (puerto 5432) — ver `SETUP.md`.
- Cambios de schema: `supabase migration new <nombre>` → `supabase db reset --local` → `supabase db push`. Nunca desde el dashboard ni con `drizzle-kit`.
- `profiles.id` = `sub` del JWT de Supabase. La tabla `auth.users` es de Supabase, no se toca.

## CORS

Dev: cualquier origen. Prod: `CORS_ORIGIN` env (separado por comas), si está vacío se rechazan peticiones cross-origin. **Setear antes de producción.**

## Dominios — topes de precio

- **Compra (primer año): tope global**, igual para todos los planes — `DOMAIN_MAX_COST_USD_CENTS`. Se valida contra una cotización fresca del registrar en búsqueda, cotización y compra; nunca contra un precio enviado por el cliente.
- **Renovación: tope por plan** — `BASIC_DOMAIN_MAX_COST_USD_CENTS` / `PRO_DOMAIN_MAX_COST_USD_CENTS` (los nombres no dicen "renewal", pero solo aplican a renovación). El registrar cobra barato el primer año y caro la renovación, así que el margen de Lattiz se protege del lado de la renovación.
- El plan se lee de `tenants.plan` en el servidor; cualquier plan distinto de `pro` (incluido uno desconocido) usa el tope Básico — falla cerrado.
- Comparación inclusiva (`precio <= tope`), todo en centavos USD. La lógica vive en `modules/domains/domain/domain-pricing.policy.ts` (funciones puras, sin puerto); los tres valores son obligatorios y el API no arranca si faltan o son inválidos.

## Tooling

- **ESLint** (`pnpm lint` / `pnpm lint:fix`) — flat config en raíz. Ignora `dist/`, `src/generated/`, `drizzle/`.
- **Prettier** (`pnpm format` / `pnpm format:check`) — excluye código generado y buildeado.
- **Typecheck** (`pnpm typecheck`) — `tsc --noEmit` por paquete vía Turborepo.
- **Tests** (`pnpm test`) — Jest en `apps/api` (`*.spec.ts` junto al código en `src/`); `apps/web` aún no tiene runner.

## Producción (pendiente)

- Deploy target: sin definir — `turbo run build` es la única precondición.
- MFA, leaked-password protection, SMTP propio: configuración del dashboard de Supabase, no de este código.
- `CORS_ORIGIN` debe estar seteada.
