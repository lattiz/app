# Plan en el servidor: secciones Pro en sitios sin Pro

Fase A1 · WP4 (2026-10-14). Qué se audita, qué se hace cumplir, cómo se despliega y qué queda fuera.
Decisión: `docs/decisions/schema-plan-guard.md`.

## Auditoría (antes del cambio)

**Cómo se deriva el plan.** `TemplateAccessService.stateForTenant`
(`apps/api/src/modules/templates/template-access.service.ts:53`) lee en una consulta `tenants.plan`,
la última suscripción (`computeIsEntitled`: `active`/`trialing` y `current_period_end` futuro) y el
tier de la plantilla de `site_schemas`. `templatePlanFor` (`template-access.policy.ts:83`): con
suscripción vigente usa `tenants.plan`; sin ella, `none`/`trial` cuentan como Básico y un plan pagado
que caducó conserva su plan (la caducidad la maneja el bloqueo de suscripción). `none`, `trial` y
`basico` tienen rango 0 (`template-access.policy.ts:32`). El editor recibe
`templateAccess.proIncluded = evaluateTemplateAccess(templatePlan, 'pro')`
(`apps/api/src/modules/tenants/tenants.service.ts:192`).

**Bajada Pro → Básico (dos etapas).** Billing aplica la bajada al final del periodo pagado (A1). Ya
con la suscripción Básica vigente, `isTemplateLocked` (`template-access.policy.ts:95`) marca bloqueada
la plantilla Pro y `assertNotLocked` detiene cargar, guardar, subir imágenes y publicar (A2); el sitio
publicado sigue en línea. Para salir, el tenant cambia a una plantilla Básica (se archiva el proyecto
anterior) o mejora a Pro. Si la suscripción caduca (no está vigente), no hay bloqueo de plantilla: el
tenant no puede publicar por `PublishAllowedGuard`, aunque sí guardar borradores.

**Flujos:**

| Ruta                              | Guards y comprobaciones previas                                                                                             | Qué validaba del contenido                                                          |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `PATCH /sites/:tenantId/schema`   | JWT, dueño del tenant, `assertNotLocked` (`sites.service.ts:155`). Sin `PublishAllowedGuard` (borrador).                    | Solo que `project` sea objeto (`dto/save-schema.dto.ts:7`).                         |
| `POST /sites/:tenantId/publish`   | JWT, `PublishAllowedGuard` + límite de tasa (`sites.controller.ts:104`), dueño, `assertNotLocked` (`sites.service.ts:177`). | `project` objeto y `exportedHtml` texto; sanitiza el HTML solo de tenants sin pago. |
| `PATCH /sites/:tenantId/template` | JWT, `PublishAllowedGuard`, dueño, `assertCanUse(templatePlan, tier)` (`sites.service.ts:269`).                             | Correcto: una plantilla Pro exige plan con Pro (`TEMPLATE_REQUIRES_PRO`).           |

**El filtro de bloques es solo del cliente:** `sectionBlocks(proIncluded)`
(`apps/web/src/features/editor/blocks/index.ts:6`) ofrece los bloques Pro solo con Pro, pero el
servidor no revisaba qué secciones trae el proyecto.

**Qué sirve `tenant-sites` a un Básico.** El HTML publicado tal cual. Motion se inyecta al servir solo
si `is_pro` (`apps/tenant-sites/lib/compose-site.ts:163`), y `get_public_tenant_site` calcula `is_pro`
como «sirviendo + suscripción vigente + plan `pro`/`empresarial`»
(`supabase/migrations/20261011060638_tenant_business_profile.sql`). Los atributos de Motion en un sitio
Básico quedan **inertes**; el markup y el CSS de una sección Pro del kit, en cambio, **sí se ven**.

**Amenazas:**

| Actor                                                 | Qué puede hacer (antes)                                                                                                 | Impacto                           | Después de A1                                                                             |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------- |
| Básico malicioso (llamada directa)                    | `PATCH schema` / `POST publish` con secciones Pro del kit (galería, testimonios, equipo…) copiadas de una plantilla Pro | Ingresos: Pro sin pagar           | `report`: queda en el log. `enforce`: 403 `SECTIONS_REQUIRE_PRO`.                         |
| Básico malicioso con bloques Pro del editor (`lzb-*`) | Pegar el markup a mano                                                                                                  | Bajo: sin Motion se ven estáticos | **Hueco conocido**: no se marcan (escritos a mano, sin `data-lz-slot`).                   |
| Básico con atributos de Motion                        | Agregar `data-lz-reveal`, `data-lz-counter`…                                                                            | Ninguno: Motion no se inyecta     | Se registran en el log; nunca bloquean.                                                   |
| Cliente viejo/cacheado tras bajar a Básico            | Seguir guardando con la plantilla Pro                                                                                   | —                                 | Ya lo impedía `assertNotLocked`; el guard además lo trata como `downgraded` (solo aviso). |
| Tenant en vista previa (`none`/`trial`)               | Igual que Básico                                                                                                        | Ingresos                          | Igual que Básico.                                                                         |
| Tenant ajeno                                          | Nada: la propiedad se valida antes que el guard                                                                         | —                                 | Sin cambio.                                                                               |

## Exposición real (Supabase, solo lectura, 2026-10-14)

Conteos, sin leer esquemas completos: 6 tenants (3 sin Pro en el plan: 2 `basico` vigentes, 1 `none`).
Ningún tenant está en «plantilla Pro + plan Básico». Con la regla del guard (pares `slot/variant` del
manifiesto que no venían en la plantilla del tenant): **0** esquemas marcados, **0** con bloques Pro
del editor y **0** con atributos de Motion. Un conteo más burdo por slot (cualquier `gallery`,
`team`, `testimonials`, `marquee`) encuentra **1**: un tenant Básico sobre la plantilla Básica legacy
`barberia-v1` (inactiva, anterior al kit), que trae `team` y `testimonials` con la variante
`urban-luxe`, idénticos a los de su plantilla. Por eso el guard exime lo que la plantilla del tenant ya
traía y solo conoce variantes del manifiesto: con `enforce` ese tenant no se bloquea. Plantillas
activas: las 8 Básicas sin marcadores Pro; las 8 Pro, con ellos.

## Qué se hace cumplir

`SchemaPlanGuard` (`apps/api/src/modules/sites/schema-plan-guard.service.ts`) corre en el servidor al
guardar (`sites.service.ts:162`) y al publicar (`sites.service.ts:185`), después de validar dueño y
bloqueo. La lógica es pura (`plan-guard.ts`):

1. Busca en el proyecto (cada `attributes` de componente) y, al publicar, en el HTML exportado: pares
   `data-lz-slot` + `data-lz-variant` que el manifiesto marca **solo Pro** (17 variantes) y los 9
   atributos de Motion. La lista llega desde `catalog.manifest.json` vía
   `plan-catalog.generated.ts` (lo escribe `kit:manifest`; `pnpm lint` falla si quedó viejo).
2. Sin marcadores: termina ahí, sin consulta a la base. Con marcadores: lee el estado del tenant; si su
   plan incluye Pro (`proIncluded`, la misma regla del editor), está limpio.
3. Quita lo que la plantilla actual del tenant ya traía (solo entonces lee esa plantilla).
4. Veredicto: `clean`, `downgraded` (plantilla Pro sobre plan sin Pro: solo aviso, nunca bloquea; la
   regla de bajada A1/A2 decide ese caso) o `flagged`. Solo bloquean **secciones**; los atributos de
   Motion solos se registran pero no bloquean (no hacen nada sin Pro).

**Modos** (`SCHEMA_PLAN_ENFORCEMENT`, en `apps/api/.env`):

- `off`: no revisa nada.
- `report` (**por defecto**, también si el valor es inválido): log estructurado
  `{"event":"schema_plan_guard","mode","action","tenantId","plan","templatePlan","entitled","templateId","templateTier","verdict","sections","hooks","truncated","blocked","catalog"}`
  en nivel WARN; no cambia ninguna respuesta.
- `enforce`: además responde **403 `SECTIONS_REQUIRE_PRO`** con «Tu plan no incluye algunas secciones
  Pro de este sitio. Quítalas o mejora a Pro para guardar y publicar.» y `details.sections`.

**Costo:** un recorrido iterativo del proyecto ya parseado, con tope de 500 000 nodos (si lo pasa,
deja de buscar y el log dice `truncated`), y una pasada lineal por las etiquetas `data-lz-*` del HTML.
Un proyecto Pro real de 98 KB se revisa en ~0.12 ms; 700 000 nodos se cortan en ~75 ms; sin búfers
nuevos ni caché. Pensado para la VM e2-small (contenedor de 900 MB).

## Verificación

Sin escribir en datos reales: script de desarrollo sobre los 42 proyectos compilados del kit y HTML
de ejemplo (Básico con secciones Pro → marcado y, con `enforce`, 403; Pro → limpio; bajado →
`downgraded` sin bloquear; bloque desconocido o escrito a mano → limpio; lo que trae la plantilla →
exento; `off` y modo inválido → nunca bloquea; anidamiento de 200 000 niveles sin desbordar la pila).
Tests existentes de la API: jest 200/200 y node 196/196. `openapi.json` no cambia. La prueba de punta
a punta contra la API con un tenant Básico de prueba queda pendiente: no se llamó a ningún endpoint de
escritura.

## Despliegue

1. Desplegar la API con `SCHEMA_PLAN_ENFORCEMENT=report` (o sin la variable).
2. Durante ~1 semana, revisar los logs del contenedor (`schema_plan_guard`). Un `flagged` de un tenant
   que no hizo trampa es un falso positivo: corregir antes de seguir.
3. Sin falsos positivos: `SCHEMA_PLAN_ENFORCEMENT=enforce` en `/opt/lattiz/.env` y reiniciar el
   contenedor de la API. El front muestra el mensaje del 403 (aún no tiene copy propio para
   `SECTIONS_REQUIRE_PRO`).

## Huecos conocidos

- **Bloques del editor** (`lzb-*`): escritos a mano, sin `data-lz-slot`/`data-lz-variant`; no se marcan.
  `lzb-gallery-grid` es Básico en el editor aunque la galería es solo Pro en el kit. Cerrarlo pide
  que el editor salga del manifiesto (trabajo posterior).
- **Variantes desconocidas** (plantillas legacy anteriores al kit, como `urban-luxe`): no se marcan.
- **HTML ya publicado:** el guard no revisa sitios existentes; actúa en el próximo guardado o
  publicación.
- **Bajada:** no se inventa comportamiento nuevo; sigue la regla actual (bloqueo de plantilla hasta
  cambiar de plantilla o mejorar).
