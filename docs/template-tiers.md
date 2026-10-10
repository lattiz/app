# Plantillas Basic y Pro

Cómo se definen los dos niveles de plantilla en `packages/template-kit`, qué
promete cada uno en SEO y qué falta fuera del kit (gating, base de datos,
publicador). La fuente de verdad en código es `packages/template-kit/src/tiers.ts`;
este documento la explica y propone lo que aún no está implementado.

## Tiers

|                                     | **Basic**                                                         | **Pro**                                                                            |
| ----------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Quién puede usarla                  | Cualquier tenant                                                  | Solo tenants con suscripción Pro (exclusiva)                                       |
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

| Rol          | Slot                | Variantes Basic   | Variantes Pro     |
| ------------ | ------------------- | ----------------- | ----------------- |
| header       | `navbar`            | cualquiera        | cualquiera        |
| hero         | `hero`              | cualquiera        | cualquiera        |
| about        | `about`             | `brief`           | `urban-luxe`      |
| catalog      | `services`          | cualquiera        | cualquiera        |
| proof        | `gallery`           | —                 | `grid`, `strip`   |
| team         | `team`              | —                 | cualquiera        |
| testimonials | `testimonials`      | —                 | cualquiera        |
| faq          | `faq`               | `list`, `two-col` | `list`, `two-col` |
| contact      | `locations`         | `single`          | `with-contact`    |
| marquee      | `marquee`           | —                 | cualquiera        |
| whatsapp     | `floating-whatsapp` | cualquiera        | cualquiera        |
| footer       | `footer`            | cualquiera        | cualquiera        |

`schemaType` del rubro (para el JSON-LD del publicador): `BarberShop`.

Un rubro nuevo agrega su entrada en `verticals` (p. ej. restaurante:
`catalog → menu`, `schemaType: 'Restaurant'`) y su content pack.

## Plantillas actuales

| id                               | Tier  | Tema         | Secciones contadas |
| -------------------------------- | ----- | ------------ | ------------------ |
| `barberia-base-oscuro-v1` (FILO) | basic | `urban-dark` | 7                  |
| `barberia-base-claro-v1` (TRAZO) | basic | `bone-blue`  | 7                  |
| `barberia-oxido-v1` (ÓXIDO)      | pro   | `urban-dark` | 10                 |
| `barberia-norte-v1` (Norte)      | pro   | `bone-blue`  | 10                 |

ÓXIDO y Norte conservan su id: el seed hace upsert por `--id`. Las imágenes de
`assets/barberia/` (incluida la galería) siguen siendo placeholders generados;
hay que reemplazarlas por fotos reales antes de sembrar.

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
  "exclusive": true,
  "seoProfile": "advanced",
  "schemaType": "BarberShop",
  "editableTokens": ["color-bg", "…", "radius-pill", "radius-card"],
  "slots": [
    {
      "slot": "navbar",
      "variant": "urban-luxe",
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

## Propuesta de base de datos y gating (sin migraciones)

1. `templates.tier text not null default 'basic' check (tier in ('basic','pro'))`,
   llenado por el seed desde `template.meta.json`.
2. Exclusividad: `templates.exclusive boolean` (o derivarla de `tier`) y una
   tabla `template_claims (template_id, tenant_id, claimed_at, released_at)`
   con índice único parcial `where released_at is null`: una Pro tiene a lo
   sumo un dueño vigente.
3. Galería filtrada por plan en el API (`GET /templates`): Basic para todos;
   Pro solo si `tenants.plan = 'pro'` con suscripción vigente (`isEntitled`) y
   la plantilla no está reclamada por otro tenant.
4. `POST /sites/select-template` y `change-template` validan lo mismo en el
   servidor y crean/liberan el claim en la misma transacción.
5. El seed guarda `seo_profile`/`schema_type` si el publicador los va a leer
   de BD en vez de recalcularlos.

## Preguntas abiertas (para el dueño del producto)

- ¿Qué pasa con una plantilla Pro reclamada cuando el tenant cancela o baja a
  Basic? ¿Conserva su sitio publicado, se libera el claim, hay periodo de
  gracia antes de liberarla para otro tenant?
- ¿Los tenants Basic pueden **ver** (vista previa) las plantillas Pro como
  incentivo de upgrade, aunque no puedan elegirlas?
- ¿Un tenant puede moverse entre plantillas (Basic↔Basic, Basic→Pro,
  Pro→otra Pro)? ¿Se pierde su contenido? ¿Cuenta como liberar el claim?
- ¿"Exclusiva" significa un solo tenant en toda la plataforma, o uno por
  ciudad / por rubro?
- ¿Título, descripción e imagen OG editables quedan como función Pro (perfil
  Advanced) aunque hoy estén disponibles para todos?
