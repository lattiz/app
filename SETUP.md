# Setup — Lattiz

## Requisitos previos

- **nvm** — [instalación](https://github.com/nvm-sh/nvm#install--update-script)
- Cuenta en el proyecto de **Supabase** de Lattiz (pide las credenciales al equipo)

---

## 1. Instalar la versión correcta de Node

```bash
nvm install    # lee .nvmrc → instala Node 24 si no lo tienes
nvm use        # activa Node 24 en la sesión actual
```

> Añade `nvm use` a tu `.zshrc` / `.bashrc` si quieres que se active solo al entrar a la carpeta.

## 2. Activar corepack y provisionar pnpm

```bash
corepack enable
corepack prepare    # instala la versión pineada en packageManager
pnpm -v             # debe mostrar 11.5.2
```

## 3. Configurar variables de entorno

Copia los `.env.example` de cada app y rellena con las credenciales del proyecto:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

`apps/api/.env`:

| Variable | Dónde encontrarla |
|---|---|
| `SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `DATABASE_URL` | Ver nota abajo — usa el **Session Pooler** |
| `PORT` | Déjalo en `3000` |

> **`DATABASE_URL` — Session Pooler (importante):**
> Los proyectos free de Supabase solo tienen IPv6 en la conexión directa, lo que falla en la mayoría de redes locales. Usa siempre el **Session Pooler**:
>
> **Dashboard → Settings → Database → Connection pooling → Session mode** (puerto **5432**)
>
> El string tiene esta forma:
> ```
> postgresql://postgres.xxxxxxxxxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
> ```
> No uses el string de "Direct connection" (`db.xxxx.supabase.co`) — no resuelve en IPv4.

`apps/web/.env`:

| Variable | Dónde encontrarla |
|---|---|
| `VITE_SUPABASE_URL` | Mismo valor que `SUPABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → `anon` / `public` key |
| `VITE_API_BASE_URL` | `http://localhost:3000` (desarrollo local) |

> **Nunca** pongas la `service_role key` en `apps/web/.env` ni en ningún bundle del cliente.

## 4. Levantar en desarrollo

Desde la raíz del monorepo:

```bash
pnpm dev
```

Esto arranca en paralelo vía Turborepo:
- API → `http://localhost:3000` (Swagger UI en `http://localhost:3000/docs`)
- Web → `http://localhost:5173`

O si prefieres arrancar cada app por separado:

```bash
pnpm --filter @lattiz/api dev
pnpm --filter @lattiz/web dev
```

## 5. Verificar que todo funciona

```bash
# La API responde
curl http://localhost:3000/health
# → {"status":"ok","dependencies":[{"name":"mock","status":"up"}]}

# Ruta protegida sin token → 401
curl -o /dev/null -w "%{http_code}\n" http://localhost:3000/me
# → 401
```

Abre `http://localhost:5173` — deberías ver el JSON de `/health` en pantalla.

---

## Comandos útiles

| Comando | Qué hace |
|---|---|
| `pnpm build` | Build de producción de los 3 paquetes en orden |
| `pnpm generate:api` | Regenera `openapi.json` + cliente tipado de `@lattiz/api-client` |
| `pnpm lint` | Type-check en todos los paquetes |
| `pnpm test` | Tests (pendientes de implementar) |

### Base de datos (correr desde `apps/api/`)

| Comando | Qué hace |
|---|---|
| `pnpm db:generate` | Genera un nuevo archivo de migración SQL a partir de cambios en el schema |
| `pnpm db:migrate` | Aplica las migraciones pendientes en la base de datos |
| `pnpm db:studio` | Abre Drizzle Studio (UI para explorar la DB en el navegador) |

## Regenerar el cliente tipado

Si alguien cambia el API (nuevas rutas, DTOs, etc.), actualiza los tipos del front con:

```bash
pnpm generate:api
```

Los archivos en `packages/api-client/src/generated/` están commiteados — no los edites a mano.

---

## Solución de problemas frecuentes

**`pnpm: command not found`**
→ Asegúrate de haber ejecutado `corepack enable` con la versión de Node activa (`nvm use`).

**`Unauthorized` al llamar a `/me` incluso con token**
→ Revisa que `SUPABASE_URL` en `apps/api/.env` no tenga barra final. El guard
construye el JWKS endpoint como `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`.

**El front no llega a la API (`network error`)**
→ Confirma que `VITE_API_BASE_URL=http://localhost:3000` en `apps/web/.env` y que la API está corriendo.

**Cambié un DTO y el front no refleja el cambio**
→ Ejecuta `pnpm generate:api` y reinicia el servidor de Vite.

**`DATABASE_URL is not set` al arrancar la API**
→ Asegúrate de que existe `apps/api/.env` (no solo `.env.example`) con `DATABASE_URL` relleno.

**`getaddrinfo ENOTFOUND db.xxxx.supabase.co`**
→ Estás usando la conexión directa (IPv6). Cambia a la Session Pooler URL — ver nota en la sección de variables de entorno.
