# Lattiz — Brief de scaffolding del monorepo

Documento de handoff para una sesión de Claude Code. El objetivo de esta sesión es
**montar el esqueleto del monorepo y probar el flujo de tipos punta a punta**, no
construir features de producto. Sigue las decisiones de abajo al pie de la letra y
respeta los guardrails. Si algo no está especificado, prefiere la opción más simple
y déjalo anotado en `CONVENTIONS.md` en vez de inventar arquitectura.

---

## 1. Contexto

- Producto: **Lattiz**, un SaaS en etapa inicial. Equipo de 2 personas.
- Hoy solo existe un repo `lattiz-backend` con un `nest new` recién creado, sin código propio.
- Ese proyecto de Nest pasa a ser `apps/api` dentro del monorepo nuevo.
- La landing está en **Astro, en un repo separado** — **no** entra en este monorepo.
- El front de la app (React) y el backend (NestJS) viven juntos en este monorepo.

## 2. Stack y decisiones ya tomadas (no re-evaluar)

- **Monorepo:** pnpm workspaces + Turborepo.
- **Node:** versión 24 (Active LTS). Fijar con `.nvmrc` y campo `engines`/`packageManager`.
- **Backend:** NestJS con **arquitectura hexagonal** (puertos y adaptadores), aplicada
  en las fronteras con dependencias externas reales — **no** ceremonia sobre CRUD trivial.
- **Auth:** **Supabase Auth**. El front usa `supabase-js` directamente para los flujos de
  auth (signup, login email/password, OAuth Google/Apple, reset). **NestJS NO implementa
  endpoints de auth.** NestJS actúa como *resource server*: valida el JWT de Supabase.
- **Validación de JWT en NestJS:** verificación local vía **JWKS** (ES256 asimétrico),
  endpoint `https://<project-ref>.supabase.co/auth/v1/.well-known/jwks.json`, audiencia
  `authenticated`. Cachear el JWKS, hacer match por `kid`. Usar `jose` o `passport-jwt` + `jwks-rsa`.
  No usar el secreto HS256 legacy.
- **Validación de DTOs ("doble mundo"):** `class-validator` + `class-transformer` en el
  backend; `zod` en el front. No unificar esquemas por ahora.
- **Documentación de API:** `@nestjs/swagger` **con el CLI plugin activado** (para no decorar
  todo a mano y que la spec OpenAPI salga rica).
- **Pipeline de tipos:** API emite `openapi.json` → `@hey-api/openapi-ts` genera un cliente
  tipado + bindings de **TanStack Query** dentro de `packages/api-client` → el front lo consume
  como paquete interno (`workspace:*`).
- **Acceso a datos:** la app **no** habla directo con la base de datos de Supabase. Todo el
  acceso a datos pasa por NestJS. El front usa Supabase solo para auth.
- **Deploys:** independientes, pero **diferidos**. En esta sesión no configures ningún target
  de deploy. Solo asegúrate de que `turbo run build` funcione para todos los paquetes.

## 3. Decisiones diferidas / abiertas (no resolver ahora, dejar listo el hueco)

- **ORM / persistencia real:** sin decidir (Drizzle o Prisma contra Postgres de Supabase).
  Para esta sesión: definir el **puerto de repositorio** en el dominio e implementar un
  **adapter in-memory / mock**. Sin conexión real a base de datos.
- **Target de deploy** (Vercel, Railway, Render, etc.): diferido.
- **MFA, leaked-password protection, SMTP propio:** son config de Supabase, no de este código.
  Solo dejar documentado en `CONVENTIONS.md` que deben configurarse antes de producción.

## 4. Estructura del monorepo

```
lattiz/
├─ apps/
│  ├─ api/                 # NestJS (el proyecto actual lattiz-backend)
│  └─ web/                 # React + Vite (app del producto)
├─ packages/
│  └─ api-client/          # cliente + tipos generados (hey-api) — paquete interno
├─ .nvmrc                  # 24
├─ package.json            # raíz, privada, packageManager pineado
├─ pnpm-workspace.yaml
└─ turbo.json
```

Scope de paquetes: `@lattiz/*` (ej. `@lattiz/api-client`). El root `package.json` es privado.

## 5. Archivos de configuración base

`.nvmrc`:
```
24
```

`pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

`package.json` (raíz):
```json
{
  "name": "lattiz",
  "private": true,
  "packageManager": "pnpm@<última estable>",
  "engines": { "node": ">=24 <25" },
  "devDependencies": { "turbo": "^2" },
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "generate:api": "turbo run generate:openapi generate:client"
  }
}
```

`turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build":            { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "dev":              { "cache": false, "persistent": true },
    "lint":             {},
    "test":             { "dependsOn": ["^build"] },
    "generate:openapi": { "cache": false, "outputs": ["openapi.json"] },
    "generate:client":  { "dependsOn": ["api#generate:openapi"], "outputs": ["src/generated/**"] }
  }
}
```

Habilitar corepack y pinear pnpm con el campo `packageManager` para que ambos devs y CI corran lo mismo.

## 6. apps/api — convención hexagonal

Estructura por módulo:

```
apps/api/src/
├─ main.ts                  # bootstrap + SwaggerModule
├─ app.module.ts
├─ common/                  # filtros, guards, decoradores compartidos
│  ├─ auth/
│  │  └─ supabase-jwt.guard.ts   # valida JWT de Supabase vía JWKS (ES256, aud=authenticated)
│  └─ filters/
│     └─ domain-exception.filter.ts
└─ modules/
   └─ <module>/
      ├─ domain/            # entidades, value objects, PUERTOS (interfaces)
      ├─ application/       # casos de uso / servicios
      ├─ infrastructure/    # ADAPTADORES (repositorios, servicios externos)
      └─ interface/         # http: controllers + DTOs (class-validator + swagger)
```

Reglas:
- Los puertos (interfaces) se definen en `domain/`. Los adaptadores en `infrastructure/`.
  Se cablean por DI de Nest con tokens (`useClass`/`useFactory` + `provide`).
- En esta sesión, el adapter de repositorio es **in-memory/mock**. El puerto queda definido
  para que cambiar a Drizzle/Prisma luego sea solo un nuevo adaptador.
- Hexagonal solo donde hay dependencia externa real (persistencia, servicios). No envolver
  lógica trivial en capas por dogma.
- **Manejo de errores:** excepciones de dominio → `domain-exception.filter.ts` global →
  forma de respuesta consistente y tipable, ej:
  `{ "error": { "code": string, "message": string, "details"?: unknown } }`.
- **DTOs:** en `interface/`, con `class-validator` + `class-transformer`. El CLI plugin de
  swagger debe estar activo para auto-documentarlos.

Crear **un módulo de ejemplo** (ej. `health` o `me`) que demuestre el patrón completo:
- un puerto + adapter mock,
- un caso de uso en `application/`,
- un controller con DTO documentado,
- **una ruta pública** (`GET /health`) y **una ruta protegida** por `SupabaseJwtGuard`
  (ej. `GET /me` que devuelve el `sub` y claims del token).

`main.ts` debe configurar SwaggerModule y exponer un script `generate:openapi` que arranque
la app y escriba `apps/api/openapi.json` (sin levantar el servidor de forma persistente).

Nota sobre el guard: implementarlo correctamente (JWKS, ES256, `aud=authenticated`), leyendo
la URL del JWKS de variables de entorno (`SUPABASE_URL`). Sin un proyecto Supabase configurado
no se puede probar el flujo end-to-end: la ruta protegida debe responder 401. Dejar esto
documentado, no mockear el guard para que "pase".

## 7. packages/api-client — generación de tipos

- Config de `@hey-api/openapi-ts` que lee `../../apps/api/openapi.json`.
- Generar cliente tipado + plugin de **TanStack Query** (`@tanstack/react-query`).
- Exportar todo desde el `index` del paquete. `package.json` con `name: "@lattiz/api-client"`.
- Tarea `generate:client` que produce la salida en `src/generated/`.

## 8. apps/web — app del front (mínima, solo para probar el flujo)

- React + Vite + TypeScript.
- `@tanstack/react-query` configurado (QueryClientProvider).
- `@lattiz/api-client` como dependencia interna (`"@lattiz/api-client": "workspace:*"`).
- `supabase-js` configurado desde env (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
  **Solo la anon/publishable key en el front — NUNCA la service_role.**
- Una pantalla mínima que: (a) tenga un stub de login con supabase-js, y (b) consuma
  `GET /health` y `GET /me` vía los hooks generados de TanStack Query, para demostrar
  que el tipo viaja de la API al front sin escribir tipos a mano.

## 9. Guardrails (cosas que NO debe hacer la sesión)

- **No** implementar endpoints de auth en NestJS (signup/login/logout/forgot-password
  viven en Supabase, consumidos por el front).
- **No** exponer la base de datos directamente al front. Datos siempre vía NestJS.
- **No** poner la `service_role key` en `apps/web` ni en ningún bundle de cliente.
- **No** configurar deploys ni CI/CD en esta sesión.
- **No** conectar una base de datos real — usar adapters mock detrás de los puertos.
- **No** sobre-aplicar hexagonal: capas solo en fronteras con dependencias externas.
- **No** usar el secreto HS256 legacy de Supabase para validar tokens — solo JWKS/ES256.
- **No** unificar validación en zod en el backend — mantener class-validator atrás.

## 10. Variables de entorno (crear `.env.example` por app, sin valores reales)

`apps/api/.env.example`:
```
SUPABASE_URL=
SUPABASE_JWKS_URL=            # opcional si se deriva de SUPABASE_URL
DATABASE_URL=                 # placeholder, sin uso real en esta sesión
PORT=3000
```

`apps/web/.env.example`:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=http://localhost:3000
```

## 11. Entregables y criterios de aceptación

La sesión termina cuando:

1. `pnpm install` desde la raíz instala todo el workspace sin errores.
2. `turbo run build` construye `api`, `api-client` y `web` en orden correcto.
3. `turbo run generate:api` produce `apps/api/openapi.json` y regenera el cliente en `api-client`.
4. `apps/api` levanta con `pnpm dev`, expone Swagger, responde `GET /health` (público) y
   responde 401 en `GET /me` sin token válido.
5. `apps/web` levanta, está cableado a `@lattiz/api-client` y a `supabase-js`, y los hooks
   de TanStack Query están tipados desde la spec (sin tipos manuales).
6. Existe `CONVENTIONS.md` en la raíz documentando: layering hexagonal y la regla de cuándo
   crear un puerto, manejo de errores, convención de DTOs/validación, el pipeline de tipos,
   el enfoque de auth (Supabase + JWKS), y las decisiones diferidas (ORM, deploy, SMTP, MFA).
7. `.nvmrc` con `24`, pnpm pineado vía `packageManager`, y `.env.example` por app.

Mantén los commits chicos y temáticos. Si tomas una decisión no cubierta aquí, anótala en
`CONVENTIONS.md` con una línea de justificación.
