# Lattiz — Convenciones

Este documento recoge las decisiones de arquitectura y convenciones del monorepo.
Si tomas una decisión nueva no cubierta aquí, añádela con una línea de justificación.

## Comentarios en el código

Escribe comentarios solo cuando el **por qué** no es obvio leyendo el código.
Una línea máximo. No describas lo que hace el código — describe por qué existe
o qué restricción no obvia impone.

```ts
// Dev: allow all origins. Prod: CORS_ORIGIN env (comma-separated) or deny.
```

No:
```ts
// Este método busca el usuario por id en la base de datos y lo retorna
async findById(id: string) { ... }
```

## Stack

- **Monorepo:** pnpm workspaces + Turborepo. Paquetes con scope `@lattiz/*`.
- **Node:** 24 (`.nvmrc`, `engines.node` en el root `package.json`).
- **Gestor de paquetes:** pnpm, pineado vía `packageManager` (corepack).
- **Backend:** NestJS, arquitectura hexagonal en las fronteras con dependencias
  externas reales.
- **Front:** React + Vite + TypeScript, TanStack Query, supabase-js.
- **Auth:** Supabase Auth. NestJS es _resource server_ puro.

## Layering hexagonal — cuándo crear un puerto

Crea un **puerto** (interfaz en `domain/`) solo cuando el módulo cruza una
frontera con una **dependencia externa real**: persistencia, servicios de
terceros, colas, etc. Defínelo en `domain/`, impleméntalo como **adaptador**
en `infrastructure/` y cablealo por DI con un token (`Symbol`) + `useClass`/
`useFactory`.

**No** envuelvas lógica trivial (CRUD simple, mapeos, validaciones) en capas
por dogma — eso es ceremonia sin beneficio. La pregunta guía es: _"¿esto
cambiará si cambio el proveedor externo?"_ Si la respuesta es sí, es un puerto.

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
`DrizzleUserRepository`) — ambos con su caso de uso y controller.

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
- NestJS valida el JWT como _resource server_, 100% local, sin llamar a
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
`UserRepositoryPort` + adaptador `DrizzleUserRepository`, que lee/escribe la
tabla `profiles` de Postgres (Supabase). Como el acceso vive detrás del
puerto, cambiar de adaptador (o volver a un mock para tests) no toca la capa
de aplicación.

## Persistencia / ORM (decidido: Drizzle)

- **ORM:** **Drizzle** contra el Postgres de Supabase. Decisión tomada tras el
  scaffold inicial — reemplaza el adaptador in-memory que se usó como mock.
- El cliente vive en `database/database.module.ts` (`postgres-js` + `drizzle`),
  expuesto por DI con el token `DATABASE`. El esquema está en
  `database/schema/` (tabla `profiles`); las migraciones en `drizzle/migrations/`
  vía `drizzle-kit` (`pnpm db:generate` / `db:migrate` / `db:push` / `db:studio`).
- **`DATABASE_URL` es ahora obligatorio para arrancar el API**: el `useFactory`
  de `DatabaseModule` lanza si falta. Usar el connection string del _Session
  Pooler_ de Supabase (ver `SETUP.md`). La conexión es lazy (`postgres-js` no
  conecta hasta la primera query), así que `/me` sin token sigue devolviendo 401.
- `profiles` es distinta de `auth.users`: Supabase es dueño de la identidad,
  esta tabla guarda datos de aplicación. `profiles.id` = `sub` del JWT.

## Decisiones diferidas (no resueltas en este scaffold)

- **Target de deploy:** Vercel / Railway / Render / etc. — sin configurar.
  `turbo run build` debe seguir siendo la única precondición.
- **MFA, leaked-password protection, SMTP propio:** son configuración del
  proyecto de Supabase (dashboard), no de este código. **Deben configurarse
  antes de ir a producción.**

## CORS

En desarrollo (`NODE_ENV` != `production`) el API refleja cualquier origen para
no estorbar el trabajo local. En producción solo se permiten los orígenes
listados en `CORS_ORIGIN` (separados por coma); si la variable está vacía en
producción, se rechazan las peticiones cross-origin. Configurado en `main.ts`.
**Antes de ir a producción hay que setear `CORS_ORIGIN`** con el/los dominios
reales del front.

## Tooling — lint, formato y typecheck

- **ESLint** (flat config en `eslint.config.mjs`, raíz): `pnpm lint` corre una
  sola pasada sobre todo el repo; `pnpm lint:fix` autocorrige. Reglas
  `recommended` de JS + `typescript-eslint` (sin type-aware linting, por
  velocidad) + `react-hooks` en `apps/web`. `eslint-config-prettier` desactiva
  reglas estilísticas para no chocar con Prettier. Ignora `dist/`, `.turbo/`,
  `src/generated/`, `drizzle/` y `openapi.json`.
- **Prettier** (`.prettierrc`: comillas simples, `trailingComma: all`,
  `printWidth: 80`): `pnpm format` escribe, `pnpm format:check` valida en CI.
  `.prettierignore` excluye lo generado/buildeado.
- **Typecheck**: `pnpm typecheck` corre `tsc --noEmit` por paquete vía Turborepo
  (tarea `typecheck` en `turbo.json`; cada paquete tiene su propio `tsconfig`).
  Antes este chequeo se llamaba `lint`; se renombró al añadir ESLint para no
  confundir typecheck con linting.

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
- `@hey-api/openapi-ts` intentaba formatear su salida con Prettier; se quitó
  `format: 'prettier'` de `openapi-ts.config.ts`. Aunque Prettier ya está en el
  repo, `src/generated/` se excluye a propósito de lint y formato (es código
  generado, no se edita a mano), así que no se reactivó.
- El código generado de `@hey-api/openapi-ts` requiere la lib `DOM.Iterable`
  de TypeScript (itera `URLSearchParams`); se añadió a
  `packages/api-client/tsconfig.json`.
