---
name: kit-contact-site-tokens
description: el .grapesjs lleva {{lz:*}} para contacto; el HTML del kit los resuelve con el demo
type: project
date: 2026-10-12
commit: 062afb3
---

El kit compila las variables de contacto (`{{phone}}`, `{{phoneUrl}}`, `{{whatsappUrl[:msg]}}`, `{{email}}`, `{{emailUrl}}`, `{{address}}`, `{{city}}`) a `{{lz:phone|phone_tel|whatsapp_url|email|address|city}}` **solo en el `.grapesjs`**; WhatsApp conserva el mensaje como `{{lz:whatsapp_url}}?text=…`. Todo HTML del kit (`dist/<id>/index.html`, que el seed publica tal cual en templates.lattiz.app, y lo que valida `kit:validate`) los resuelve con `bindSiteTokens` de tenant-sites y un perfil sacado de `business` (`src/lib/profile.ts`; la calle sin la ciudad porque `formatAddress` la agrega). Nombre, horarios, colonias y mapas de sucursales con dirección propia siguen como texto demo.

**Why:** una plantilla adoptada publicaba el teléfono, WhatsApp y dirección demo y no se enlazaba a «Datos del negocio». Resolver en el kit (no en el seed) deja intacto el seed y el preview estático sale de la misma función que usa `composeSiteHtml`. Se descartó tokenizar `{{name}}` (sin perfil el logo quedaría vacío) y hacer dos renders (el preview podría divergir del binding real).
**How to apply:** nunca escribas `{{lz:*}}` en el copy (no compila): usa las variables del kit. Sin perfil, los tokens quedan vacíos (enlaces `?text=…`, «en .»); pedir teléfono/dirección antes de publicar es decisión de producto pendiente. Ver [[business-profile-site-tokens]], [[template-spec-compiler]].
