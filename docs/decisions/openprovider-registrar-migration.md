---
name: openprovider-registrar-migration
description: Registrador GoDaddy→Openprovider: endpoints sandbox/prod, whitelist de IP y quirks de la API
type: project
date: 2026-10-03
commit: 58e7448
---

Lattiz reemplazó GoDaddy por Openprovider (commit `58e7448`, rama `feat/openprovider-registrar`, 2026-10-03).

- Sandbox: `https://api.sandbox.openprovider.nl/v1/`; prod: `https://api.openprovider.eu/v1/`. Mismo usuario y contraseña. `/v1beta` está deprecado (se apaga el 2027-06-30). Los handles de contacto están en el panel de Openprovider.
- Prod devolvió `API access is disabled for this contact` (código 10008) hasta activar el acceso a la API y la whitelist de IP en el panel; hay que whitelistear la IP de la VM de prod.
- El MCP de Openprovider apunta a PRODUCCIÓN: solo lectura; registrar cuesta dinero real.
- Quirks verificados en sandbox: un PUT de zona no puede quitar y añadir un CNAME con el mismo nombre (dos llamadas); las eliminaciones usan nombres relativos y las lecturas devuelven FQDN; hay 429 con llamadas rápidas; los checks de `.mx`/`.com.mx` dan timeout y el registro es inalcanzable en sandbox (sin probar).
- Auto-renovación: `GET/PUT /v1/domains/{id}` exponen `autorenew` = `on|off|default`; `default` hereda el ajuste de la cuenta de revendedor y no se puede leer por dominio. Registramos con `autorenew: 'off'` y una auditoría diaria de solo lectura (`auditRegistrarAutoRenew`, 06:00 UTC) alerta `[ADMIN_ALERT]` si un dominio gestionado no está en `off`. Revisar a mano en el panel que el valor por defecto de la cuenta sea "off".
- DNS-only de Cloudflare llegó a main (`3df0d1a`, 2026-10-03) con ciclo de vida de zonas y un sweeper de reconciliación. `.mcp.json` contiene el token de Cloudflare: nunca commitearlo.

**Why:** margen del registrador y sandbox para pruebas; las renovaciones de GoDaddy eran caras.
**How to apply:** para trabajo de dominios, probar escrituras solo contra el sandbox. Ver [[supabase-migrations-source-of-truth]].
