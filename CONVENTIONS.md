# Lattiz — Convenciones

Este documento recoge las decisiones de arquitectura y convenciones del monorepo.
Si tomas una decisión nueva no cubierta aquí, añádela con una línea de justificación.

## Stack

- **Monorepo:** pnpm workspaces + Turborepo. Paquetes con scope `@lattiz/*`.
- **Node:** 24 (`.nvmrc`, `engines.node` en el root `package.json`).
- **Gestor de paquetes:** pnpm, pineado vía `packageManager` (corepack).
- **Backend:** NestJS, arquitectura hexagonal en las fronteras con dependencias
  externas reales.
- **Front:** React + Vite + TypeScript, TanStack Query, supabase-js.
- **Auth:** Supabase Auth. NestJS es *resource server* puro.

## Layering hexagonal — cuándo crear un puerto

Crea un **puerto** (interfaz en `domain/`) solo cuando el módulo cruza una
frontera con una **dependencia externa real**: persistencia, servicios de
terceros, colas, etc. Defínelo en `domain/`, impleméntalo como **adaptador**
en `infrastructure/` y cablealo por DI con un token (`Symbol`) + `useClass`/
`useFactory`.

**No** envuelvas lógica trivial (CRUD simple, mapeos, validaciones) en capas
por dogma — eso es ceremonia sin beneficio. La pregunta guía es: *"¿esto
cambiará si cambio el proveedor externo?"* Si la respuesta es sí, es un puerto.

Estructura por módulo:

```
modules/<module>/
├─ domain/            # entidades, value objects, PUERTOS (interfaces + tokens)
├─ application/       # casos de uso (orquestan puertos, sin conocer adaptadores)
├─ infrastructure/    # ADAPTADORES (repos, clientes externos)
└─ interface/         # http: controllers + DTOs
```

Ejemplo de referencia: `modules/health` (puerto `HealthCheckPort` +
`MockHealthCheckAdapter`) y `modules/me` (puerto `UserRepositoryPort` +
`InMemoryUserRepository`) — ambos con su caso de uso y controller.

## Manejo de errores

Las capas de dominio/aplicación lanzan subclases de `DomainException`
(`common/exceptions/domain.exception.ts`), nunca `HttpException`. El filtro
global `common/filters/domain-exception.filter.ts` normaliza **cualquier**
error (de dominio, `HttpException` de Nest, o no controlado) a:

```json
{ "error": { "code": "string", "message": "string", "details"?: unknown } }
```

Esto incluye los 401 del guard, los 400 de `ValidationPipe`, etc. — la forma
de respuesta es consistente y tipable en todo el API.

## DTOs y validación — "doble mundo"

- **Backend:** `class-validator` + `class-transformer` en `interface/*.dto.ts`,
  decorados también con `@nestjs/swagger` (`@ApiProperty`) para que el CLI
  plugin de swagger enriquezca la spec OpenAPI automáticamente
  (`introspectComments: true` en `nest-cli.json`).
- **Front:** `zod` para validar formularios/inputs en el cliente.

No se unifican esquemas entre ambos mundos por ahora — es una decisión
deliberada para no acoplar el ciclo de vida de front y back.

## Pipeline de tipos (punta a punta)

```
apps/api  --(nest build + script)-->  openapi.json
                                            |
                                            v
packages/api-client  --(@hey-api/openapi-ts)-->  cliente tipado + hooks TanStack Query
                                            |
                                            v
                                       apps/web (workspace:*)
```

- `apps/api` expone `pnpm generate:openapi`: levanta el contexto de Nest
  (sin servidor HTTP), genera el documento con `SwaggerModule.createDocument`
  usando la misma config que `main.ts` (`src/swagger.ts`, fuente única), y lo
  escribe en `apps/api/openapi.json` (`src/generate-openapi.ts`).
- `packages/api-client` expone `pnpm generate:client`: lee `../../apps/api/openapi.json`
  con `@hey-api/openapi-ts` (`openapi-ts.config.ts`) y genera SDK + tipos +
  bindings de TanStack Query en `src/generated/` (commiteado, no editar a mano).
- `turbo.json` encadena ambos pasos vía `generate:client.dependsOn = ["@lattiz/api#generate:openapi"]`,
  y el script raíz `generate:api` corre `turbo run generate:openapi generate:client`.
- `apps/web` consume `@lattiz/api-client` como dependencia interna
  (`workspace:*`) y usa los hooks generados (`xxxOptions()`) con `useQuery` —
  **cero tipos escritos a mano** para las respuestas del API.

Nota: el sample de `turbo.json` del brief usaba `api#generate:openapi`, pero
el nombre real del paquete es `@lattiz/api` (scope `@lattiz/*` por convención
de este repo) — Turborepo necesita el nombre real del paquete en
`packageTask#taskName`, así que se ajustó a `@lattiz/api#generate:openapi`.

## Auth — Supabase + JWKS

- Supabase es la única fuente de identidad. **NestJS no implementa
  signup/login/logout/forgot-password** — esos flujos viven en el front vía
  `supabase-js` (`apps/web/src/supabase.ts`, solo con la **anon/publishable
  key**, nunca `service_role`).
- NestJS valida el JWT como *resource server*, 100% local, sin llamar a
  Supabase en cada request:
  - JWKS remoto (`${SUPABASE_URL}/auth/v1/.well-known/jwks.json` o
    `SUPABASE_JWKS_URL` si se quiere sobreescribir), cacheado y resuelto por
    `kid` vía `jose.createRemoteJWKSet`.
  - Solo se acepta el algoritmo asimétrico **ES256**. El secreto compartido
    HS256 legacy está deliberadamente **no soportado**.
  - `audience: "authenticated"`, `issuer: ${SUPABASE_URL}/auth/v1`.
  - Implementado en `common/auth/supabase-jwt.guard.ts`, expone el usuario
    autenticado (`sub` + claims) vía `request.user` y el decorador
    `@CurrentUser()`.
- Sin un proyecto Supabase real configurado (`SUPABASE_URL` vacío), el guard
  no puede resolver el JWKS y responde **401** — comportamiento esperado y
  **no mockeado**, documentado para cuando se conecte un proyecto real.
- El front adjunta el `access_token` de la sesión de Supabase como header
  `Authorization: Bearer <token>` en cada request al API
  (`apps/web/src/api.ts`, vía `client.interceptors.request`).

## Acceso a datos

Todo el acceso a datos de aplicación pasa por NestJS — el front **nunca**
habla directo con la base de datos de Supabase (Supabase solo se usa para
auth en el front). El módulo `me` ilustra el patrón: puerto
`UserRepositoryPort` + adaptador `InMemoryUserRepository` (estado en un
`Map`, se pierde al reiniciar). Cambiar a Drizzle/Prisma será solo un nuevo
adaptador detrás del mismo puerto.

## Decisiones diferidas (no resueltas en este scaffold)

- **ORM / persistencia real:** Drizzle vs Prisma contra Postgres de Supabase.
  El puerto (`UserRepositoryPort`) y el placeholder `DATABASE_URL` ya están
  listos para que sea solo cuestión de escribir el adaptador real.
- **Target de deploy:** Vercel / Railway / Render / etc. — sin configurar.
  `turbo run build` debe seguir siendo la única precondición.
- **MFA, leaked-password protection, SMTP propio:** son configuración del
  proyecto de Supabase (dashboard), no de este código. **Deben configurarse
  antes de ir a producción.**

## Notas de entorno de esta sesión

- La máquina tenía Node 22 instalado globalmente; se instaló y fijó Node 24
  vía `nvm` (`nvm install 24 && nvm alias default 24`) para cumplir
  `.nvmrc`/`engines`.
- `packageManager` se pineó a `pnpm@11.5.2` (última estable al momento de
  esta sesión) y se activó vía corepack en el binario de Node 24.
- pnpm pidió aprobar build scripts de dependencias (`@nestjs/core`,
  `@scarf/scarf`); se marcaron como `false` en `pnpm-workspace.yaml`
  (`allowBuilds`) — ninguno es necesario para este proyecto (avisos de
  OpenCollective / telemetría de Scarf).
- `@hey-api/openapi-ts` intenta formatear la salida con Prettier por defecto;
  Prettier no está instalado en el repo, así que se quitó `format: 'prettier'`
  de `openapi-ts.config.ts` — el TS generado es válido sin formatear. Si se
  quiere formateo, añadir `prettier` como devDependency del paquete.
- El código generado de `@hey-api/openapi-ts` requiere la lib `DOM.Iterable`
  de TypeScript (itera `URLSearchParams`); se añadió a
  `packages/api-client/tsconfig.json`.
