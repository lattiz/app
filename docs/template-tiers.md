# Plantillas Basic y Pro

Cómo se definen los dos niveles de plantilla en `packages/template-kit`, qué
promete cada uno en SEO y qué falta fuera del kit (gating, base de datos,
publicador). La fuente de verdad en código es `packages/template-kit/src/tiers.ts`;
este documento la explica y propone lo que aún no está implementado.

## Tiers

|                                     | **Basic**                                                         | **Pro**                                                                            |
| ----------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Quién puede usarla                  | Cualquier tenant                                                  | Tenants con plan Pro (o superior); varias pueden compartir la misma plantilla      |
| Identidad                           | Estructura compartida por rubro; cambia solo el tema              | Arquetipo propio por rubro (orden, variantes, tema, tipografías)                   |
| Secciones contadas                  | 6–7                                                               | 8–10                                                                               |
| Roles obligatorios                  | header, hero, catalog, contact (compacto), faq, footer + whatsapp | header, hero, about, catalog, proof, testimonials, faq, contact, footer + whatsapp |
| Roles opcionales                    | about (breve)                                                     | team, marquee                                                                      |
| Similitud máx. (mismo rubro y tier) | 0.85 (las Basic son pieles de una estructura a propósito)         | 0.5                                                                                |
| Perfil SEO                          | `basic`                                                           | `advanced`                                                                         |
| `editableTokens` (propuesta)        | `color-accent`                                                    | todos los `color-*` + `radius-pill` + `radius-card`                                |
| Blueprint                           | `blueprints/service-landing.basic.ts`                             | `blueprints/service-landing.pro.ts`                                                |

**Regla de conteo:** secciones contadas = todos los slots menos
`floating-whatsapp` (se considera parte del pie) y `marquee` (decorativo).
`floating-whatsapp` es obligatorio en ambos tiers y debe enlazar a
`{{whatsappUrl}}` / `{{whatsappUrl:mensaje}}`.

**Contacto sin formularios en el MVP:** solo botones (WhatsApp, `tel:`,
`mailto:`, mapa). `kit:validate` rechaza cualquier `<form>`.

## Roles → slots

Los blueprints hablan de **roles**; cada rubro resuelve el rol a un slot
(`blueprints/service-landing.shared.ts › verticals`). Para barbería:

| Rol          | Slot                | Variantes Basic   | Variantes Pro                                   |
| ------------ | ------------------- | ----------------- | ----------------------------------------------- |
| header       | `navbar`            | cualquiera        | cualquiera                                      |
| hero         | `hero`              | cualquiera        | cualquiera                                      |
| about        | `about`             | `brief`           | `text-image-offset`, `statement`, `stats-strip` |
| catalog      | `services`          | cualquiera        | cualquiera                                      |
| proof        | `gallery`           | —                 | `grid`, `strip`                                 |
| team         | `team`              | —                 | cualquiera                                      |
| testimonials | `testimonials`      | —                 | cualquiera                                      |
| faq          | `faq`               | `list`, `two-col` | `list`, `two-col`                               |
| contact      | `locations`         | `single`          | `with-contact`                                  |
| marquee      | `marquee`           | —                 | cualquiera                                      |
| whatsapp     | `floating-whatsapp` | cualquiera        | cualquiera                                      |
| footer       | `footer`            | cualquiera        | cualquiera                                      |

`schemaType` del rubro (para el JSON-LD del publicador): `BarberShop`.

Un rubro nuevo agrega su entrada en `verticals` (p. ej. restaurante:
`catalog → menu`, `schemaType: 'Restaurant'`) y su content pack.

## Plantillas actuales

| id                                | Tier  | Tema              | Voz                      | Portada · servicios            | Secciones contadas |
| --------------------------------- | ----- | ----------------- | ------------------------ | ------------------------------ | ------------------ |
| `barberia-oxido-v1` (ÓXIDO)       | pro   | `oxido`           | `oxido` (streetwear)     | `image-bg` · `price-list`      | 10                 |
| `barberia-norte-v1` (Norte)       | pro   | `norte-atelier`   | `norte` (editorial)      | `split` · `editorial-table`    | 10                 |
| `barberia-concreto-v1` (CONCRETO) | pro   | `concreto-brutal` | `concreto` (irreverente) | `offset-card` · `cards`        | 10                 |
| `barberia-base-claro-v1` (TRAZO)  | basic | `trazo-papel`     | `trazo` (amable)         | `centered-arch` · `price-list` | 7                  |
| `barberia-base-oscuro-v1` (FILO)  | basic | `trazo-noche`     | `trazo`                  | `image-bg` · `cards`           | 7                  |
| `barberia-base-solar-v1` (LUMEN)  | basic | `trazo-solar`     | `trazo`                  | `split` · `price-list`         | 7                  |

Los ids existentes se conservan: el seed hace upsert por `--id`. Todas las
imágenes de `assets/barberia/<tema>/` son placeholders generados con la paleta
de cada tema; hay que reemplazarlas por fotos con licencia antes de sembrar
(ver `assets/barberia/README.md`).

## Unicidad dentro de un rubro

Además del límite de similitud por tier, `kit:validate` exige dentro del rubro:
tema único, `fontPair` único, tono de acento a ≥ 30° de cualquier otra plantilla,
titular de portada único y, entre las Pro, variante de portada única. Un tema
`pro` solo sirve a plantillas Pro (y uno `basic` solo a Basic).
`kit:compare-visual` mide la distancia perceptual (SSIM de luminancia + ΔE
CIELAB) entre las portadas a 1280×800 reducidas a tamaño miniatura y falla por
debajo de 0.33; genera `dist/_contact-sheet.png` para la prueba de entrecerrar
los ojos.

## `dist/<id>/template.meta.json`

`kit:build` lo emite junto al `.grapesjs` (cuyo objeto `custom` no cambia:
el editor espera exactamente `{ projectType, id }`):

```json
{
  "id": "barberia-oxido-v1",
  "tier": "pro",
  "family": "service-landing",
  "vertical": "barberia",
  "archetype": "street-luxe",
  "exclusive": false,
  "seoProfile": "advanced",
  "schemaType": "BarberShop",
  "editableTokens": ["color-bg", "…", "radius-pill", "radius-card"],
  "slots": [
    {
      "slot": "navbar",
      "variant": "inline",
      "role": "header",
      "counted": true
    },
    "…"
  ]
}
```

Hoy nadie lo consume: es el contrato para el seed/gating/publicador futuros.

## Contrato SEO

Lo implementa el **publicador** (`apps/tenant-sites`), no la plantilla: las
plantillas son HTML estático y el JSON-LD necesita datos del tenant (nombre,
dirección, horario, teléfono). La plantilla solo garantiza lo que el
validador exige: `<html lang>`, `<title>` y `<meta name="description">` como
placeholders en `<head>`, un único `<h1>`, jerarquía de encabezados sin saltos,
`alt` + `width`/`height` en cada imagen y FAQ en `<details><summary>`.

### Basic

- `<title>`: `{Negocio} | {Giro} en {Ciudad}`, ≤ 60 caracteres (recortar el giro antes que el nombre).
- `<meta name="description">` ≤ 155 caracteres.
- `lang="es-MX"`, `<link rel="canonical">`, favicon, `<meta name="robots">`.
- Open Graph y Twitter con la imagen de la portada.
- `sitemap.xml` y `robots.txt` por dominio.
- JSON-LD `LocalBusiness` (el subtipo de `schemaType`): `name`, `address`, `telephone`, `openingHoursSpecification`, `sameAs` (redes).

### Advanced (Pro) — todo lo de Basic, más

- Título, descripción e imagen OG editables por el tenant.
- Subtipo del rubro (`BarberShop`, …) y un nodo por sucursal.
- `Service` / `Offer` (o `Menu` en restaurantes) a partir del catálogo.
- `FAQPage` extraído del markup `<details><summary>` de la sección FAQ.
- Imagen OG generada (`/api/og`).
- Verificación de Google Search Console.
- GA4 (solo Pro).

> El marcado FAQ y las reseñas autoservidas (`AggregateRating` sobre reseñas
> que el propio negocio muestra) casi nunca generan resultados enriquecidos
> para negocios pequeños: Google los limita a sitios con autoridad o los
> ignora. Son datos correctos, no una palanca de posicionamiento; no se venden
> como tal.

### Brechas frente a `apps/tenant-sites` hoy (no implementadas en esta fase)

| Punto del contrato                               | Hoy                                                                                    | Brecha                                                                        |
| ------------------------------------------------ | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Título `{Negocio} \| {Giro} en {Ciudad}`         | `seo_title` o el nombre del tenant (`app/route.ts › injectSeo`)                        | Falta el patrón y el tope de 60                                               |
| Meta description                                 | Se **añade** una segunda `<meta name="description">`; la de la plantilla se queda      | Quitar la de la plantilla como ya se hace con `<title>`; tope de 155          |
| `lang`                                           | Llega desde la plantilla (`docEl.lang` del proyecto)                                   | Ninguna mientras la plantilla lo traiga (el validador lo exige)               |
| Canonical, robots, OG, favicon                   | Sí                                                                                     | `twitter:description` no se emite                                             |
| `sitemap.xml` / `robots.txt`                     | Sí, por host (vacío en la vista previa)                                                | —                                                                             |
| JSON-LD `LocalBusiness`                          | No existe                                                                              | Todo (datos de dirección/horario/sucursales aún no están estructurados en BD) |
| Título/descr./OG editables                       | `seo_title`, `seo_description`, `social_preview_url` existen para **todos** los planes | Decidir si se restringen a Pro o se quedan en ambos                           |
| `FAQPage`, `Service`/`Offer`, nodos por sucursal | No                                                                                     | Todo                                                                          |
| Search Console                                   | No                                                                                     | Meta de verificación por tenant                                               |
| GA4 solo Pro                                     | Sí (`tenant_analytics`, elegibilidad derivada)                                         | —                                                                             |

Hallazgo relacionado: el saneador de sitios sin pago
(`apps/api/src/modules/sites/sanitize-html.sanitizer.ts`) no permite
`<details>`, `<summary>` ni `<iframe>`. En una vista previa gratuita el FAQ
queda como texto plano (las preguntas y respuestas se ven, sin el despliegue)
y los mapas desaparecen. No se tocó en esta fase.

## `editableTokens` (propuesta para el editor)

Solo datos: el kit los emite, nada los consume.

- **Basic:** `color-accent`. Un solo color de marca; la estructura y el resto
  del tema son el producto.
- **Pro:** todos los `color-*` y los dos radios.

Al implementarlo, el editor debe re-validar el contraste AA de los pares del
tema (`CONTRAST_PAIRS` del validador) cuando el tenant cambia un color, y
derivar `on-accent` si el nuevo acento lo exige. Ver la idea de fase 3 en
`CONVENTIONS.md` (Global Styles del SDK sobre `:root`).

## Acceso por plan (implementado)

El acceso se **deriva al leer**; no hay columna de bloqueo. La API es la única
autoridad y el dashboard solo refleja lo que responde.

- **Regla:** `evaluateTemplateAccess(plan, tier)` en
  `apps/api/src/modules/templates/template-access.policy.ts`, por **rango**
  (`none`/`trial`/`basico` = 0, `pro` = 1, `empresarial` = 2; un plan
  desconocido cuenta como Básico). Básico solo usa `basic`; Pro usa `basic` y
  `pro`. **No hay plantillas exclusivas** (`exclusive: false` en `tiers.ts`):
  cualquier tenant Pro puede usar cualquier plantilla Pro, y varias pueden
  compartirla.
- **Plan efectivo:** `tenants.plan` (sincronizado desde el precio de Stripe)
  combinado con `computeIsEntitled` (estado + `current_period_end`) de la última
  suscripción, el mismo cálculo que usan la facturación y GA4.
- **Bloqueo (A2):** `locked = vigente && rango(plan) < tier(plantilla actual)`.
  Mientras dura, la API responde `403 TEMPLATE_LOCKED_BY_PLAN` al cargar,
  guardar, subir imágenes y publicar. El sitio publicado sigue en línea. Una
  baja involuntaria (pago vencido, periodo terminado) **no** bloquea: ya la
  cubre el bloqueo por suscripción. Cancelar y volver a suscribirse como Básico
  sí bloquea.
- **Elegir o cambiar plantilla:** `403 TEMPLATE_REQUIRES_PRO` si el plan no la
  incluye. Un tenant bloqueado siempre puede cambiar a una Básica (es la salida).
- **Archivar antes de reemplazar:** cambiar de plantilla copia el proyecto
  (`grapesjs_json`) y el HTML publicado a `template_archives` y luego lo
  reemplaza, en una sola transacción. Nada se borra ni se le muestra al tenant.
- **Bajar de plan:** `GET /tenants/:tenantId/plan-change-impact?target=basico`
  lista lo que se pierde (hoy solo `template_loss`, con su fecha). `POST
/billing/plan-change` exige `acknowledgeLosses: true` si hay pérdidas; si no,
  `409 PLAN_CHANGE_IMPACT_NOT_ACKNOWLEDGED`. `analytics` y `domain_renewal_cap`
  están reservados en el contrato; un dominio con renovación sobre el tope
  Básico ya impide la baja (`DOWNGRADE_DOMAIN_ABOVE_BASIC_CAP`).
- **Galería:** `GET /templates` devuelve `tier`, `accessible` y `lockedReason`
  por plantilla para el plan del tenant; `GET /tenants/me` trae
  `templateAccess: { current, locked }`.
- **Seed:** `--tier basic|pro` (por defecto el `tier` de `template.meta.json`).
  Si un re-seed cambia el tier de una plantilla en uso, avisa cuántos tenants la
  usan (solo consulta).

### Supuestos (el dueño puede cambiarlos; cada uno vive en un solo lugar)

|     | Supuesto                                                                                                            | Dónde se cambia                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| A1  | Una baja voluntaria aplica al **fin del periodo pagado**; hasta entonces sigue con Pro.                             | `evaluatePlanChange` (timing `period_end`) en `plan-change.policy.ts`; ya era así. |
| A2  | Bloqueado: el sitio publicado **sigue en línea**; editar, guardar, subir y publicar se bloquean; aviso persistente. | `TEMPLATE_ACCESS_ASSUMPTIONS.lockBlocksEditing`                                    |
| A3  | Los tenants Básico **ven** las Pro bloqueadas, con vista previa y "Mejorar a Pro".                                  | `TEMPLATE_ACCESS_ASSUMPTIONS.showLockedTemplates`                                  |
| A4  | Cambiar de plantilla **no migra** el contenido (se archiva el anterior).                                            | `TEMPLATE_ACCESS_ASSUMPTIONS.migrateContentOnSwitch` + `projectForSwitch`          |
| A5  | Tenants sin pago o en prueba (`none`, `trial`) cuentan como Básico.                                                 | `PLAN_RANK` en `template-access.policy.ts`                                         |

Las plantillas Pro existentes (ÓXIDO, Norte, Concreto) siguen en `basic` hasta
re-sembrarlas con `--tier pro`. Antes, correr
`supabase/tests/template_access/precheck_pro_templates.sql` (solo lectura) y
decidir qué hacer con cada tenant que aparezca.

## Decisiones pendientes del dueño

- **Cancelación desde el portal de Stripe:** la configuración por defecto
  permite cancelar al fin del periodo. Al terminar, el tenant queda sin
  suscripción vigente (no bloqueado por plantilla; aplica el bloqueo por
  suscripción). Si después se suscribe como Básico, queda bloqueado sin haber
  visto el aviso de pérdida. ¿Se acepta, o se desactiva la cancelación en el
  portal y se hace solo desde Lattiz?
- **Tenant bloqueado que nunca elige:** hoy queda bloqueado indefinidamente con
  el sitio publicado en línea. ¿Se le cambia a una Básica tras N días? ¿Se le
  avisa por correo?
- **Retención de `template_archives`:** hoy no se purga nada. ¿Cuánto tiempo se
  guarda? ¿Se ofrece restaurar al volver a Pro?
- **Dominio con renovación sobre el tope Básico:** la baja está bloqueada por
  completo. ¿Se permite bajar dejando de cubrir la renovación, o con un cargo?
- **Tenants en plantillas que pasan a Pro:** decidir por tenant si se les
  respeta (copia Básica equivalente), se les mueve o se les ofrece Pro.
- **Preview de plantillas Pro para Básico:** implementado como visible (A3);
  confirmar.
