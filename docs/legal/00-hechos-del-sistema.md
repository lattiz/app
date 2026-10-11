# Hechos del sistema Lattiz

Fecha de corte: 2026-10-11. Commit: `c465bde`. Alcance: lo que el código, las migraciones, `docs/decisions/` y los hechos en vivo del orquestador permiten afirmar hoy. No es un documento legal.

Limitaciones: no hubo acceso directo a Supabase, Stripe, Vercel ni Google Cloud. Esos hechos se citan como «MCP (orquestador, 2026-10-11)». El repositorio de la landing (`lattiz.app`) no está en este workspace. No se leyeron valores vivos de la configuración de negocio en producción: donde se da un número «sembrado», es el que escribió la migración; alguien pudo cambiarlo después en la base y eso queda indicado. No se leyeron archivos de entorno ni secretos.

Estados: `CONFIRMADO` (el texto legal puede afirmarlo), `NO IMPLEMENTADO` (una capacidad que unos términos típicos prometerían y el sistema no tiene), `DESCONOCIDO` (depende de un panel o de una decisión que no se ve en el código).

Los plazos marcados «configurable» se leen de la configuración de negocio (la base manda sobre el entorno y este sobre el respaldo de código), salvo los que se indican como fijos en código.

---

## 1. Alta y autenticación

| ID | Hecho (como se redactaría) | Evidencia | Estado |
|---|---|---|---|
| AUT-1 | La cuenta se crea con el correo: el sistema envía un código de un solo uso y, al verificarlo, abre la sesión. No hay alta con Google, Apple ni Facebook en la aplicación. | `apps/web/src/lib/auth.ts` `sendSignupOtp`, `verifySignupOtp` | CONFIRMADO |
| AUT-2 | Después del código, la persona elige una contraseña. El ingreso posterior es correo y contraseña. El cierre de sesión lo hace el navegador contra el proveedor de identidad. | `apps/web/src/lib/auth.ts` `setPassword`, `login`, `logout` | CONFIRMADO |
| AUT-3 | Recuperar la contraseña también usa un código de un solo uso al correo. Al terminar, esa sesión de recuperación se cierra y hay que entrar de nuevo. | `apps/web/src/lib/auth.ts` `sendPasswordReset`, `verifyRecoveryOtp`, `resetPassword` | CONFIRMADO |
| AUT-4 | En producción, las únicas identidades ya creadas son de correo. Qué botones de acceso están encendidos en el panel de Auth (Google, Apple, Facebook u otros) no se ve en el código. | MCP (orquestador, 2026-10-11); la web no llama a un proveedor externo | DESCONOCIDO |
| AUT-5 | La aplicación no pide permisos de una cuenta de Google del usuario. El acceso a Google que sí existe es de servidor, con la cuenta de Lattiz, solo para analítica (tema 6). | `apps/web/src/lib/auth.ts`; `apps/api/src/modules/analytics/ga4.gateway.ts` | CONFIRMADO |
| AUT-6 | Al crear la cuenta no hay casilla ni registro de fecha o versión de Términos o del Aviso. El único registro de aceptación es el de la compra de un dominio (tema 5). | MCP (orquestador, 2026-10-11); `apps/web/src/components/auth/signup-email-form.tsx` | NO IMPLEMENTADO |
| AUT-7 | Al registrarse se guardan el correo y la contraseña en el proveedor de identidad, y se crea el negocio con un nombre tomado de la parte local del correo y una dirección temporal del sitio (`tenant-` y ocho caracteres del identificador). El plan queda en «ninguno». | `supabase/migrations/20260719055135_auto_create_tenant_on_signup.sql` `handle_new_user` | CONFIRMADO |
| AUT-8 | La sesión del panel vive en el almacenamiento de la pestaña y se borra al cerrarla. El token se renueva solo mientras la pestaña sigue abierta. | `apps/web/src/lib/supabase.ts` | CONFIRMADO |
| AUT-9 | Cuánto dura el token de acceso, el código de un solo uso y la contraseña mínima en producción lo define el panel de Auth. En la configuración local del repositorio el token y el código duran 3600 segundos, el código tiene 6 caracteres y la contraseña mínima es 6. Un comentario del código de alta habla de un código de 8 dígitos; eso no está fijado en la aplicación. | `supabase/config.toml` `jwt_expiry`, `otp_length`, `otp_expiry`, `minimum_password_length`; `apps/web/src/lib/auth.ts` | DESCONOCIDO |
| AUT-10 | No hay segundo factor, acceso con teléfono ni captcha en el flujo que ofrece la web. | `apps/web/src/lib/auth.ts`; `supabase/config.toml` `[auth.mfa]`, `[auth.sms]` | CONFIRMADO |

## 2. Inventario de datos personales

Sin valores. Categorías que el sistema guarda o hace guardar a un tercero.

| ID | Hecho (como se redactaría) | Evidencia | Estado |
|---|---|---|---|
| DAT-1 | Identidad: correo, contraseña (la guarda el proveedor de identidad, no la aplicación) y, si existe, un nombre para mostrar. El alta automática no escribe ese nombre; la consulta del perfil tolera que no exista. | `apps/api/src/modules/me/application/get-me.use-case.ts`; `supabase/migrations/20260608222136_create_profiles_table.sql` | CONFIRMADO |
| DAT-2 | Negocio: nombre comercial, dirección del sitio, plan, favicon, imagen para redes, título y descripción para buscadores. El cliente los edita y pueden publicarse en su sitio. | migraciones de negocio, marca y SEO (`20260708020928`, `20260916001417`, `20260922000324`) | CONFIRMADO |
| DAT-3 | Contenido del sitio: el proyecto del editor y el HTML publicado, más las imágenes que sube el cliente. Lo publicado es visible para quien visite el sitio. | `apps/api/src/modules/sites/sites.service.ts` `publishSite` | CONFIRMADO |
| DAT-4 | Dominio: el nombre, las fechas de vencimiento y, solo en dominios gestionados por Lattiz, la fecha y los tipos de acuerdo aceptados al comprar. No se envían al registrador el correo ni el domicilio del cliente (tema 5). | `apps/api/src/modules/domains/domains.service.ts` `initiatePurchase`; `openprovider-registrar.adapter.ts` `registerDomain` | CONFIRMADO |
| DAT-5 | Pagos: Lattiz guarda el identificador de cliente del cobrador y el estado de la suscripción. Al crear ese cliente solo manda el nombre del negocio. La tarjeta, el comprobante y el PDF los tiene el cobrador. Lattiz muestra los últimos pagos leídos de ahí. | `apps/api/src/modules/billing/billing.service.ts` `getOrCreateCustomer`, `getInvoicesForUser` | CONFIRMADO |
| DAT-6 | Analítica (solo Pro): identificadores de la propiedad de Google y un resumen en caché (sesiones, usuarios, canales, serie de 28 días, activos recientes). No hay listado de visitantes con nombre. | `apps/api/src/modules/analytics/analytics.service.ts` `getOverview` | CONFIRMADO |
| DAT-7 | Correos enviados: destinatario, tipo de aviso y datos del mensaje. Esa bandeja no se borra con la cuenta (tema 8). | `supabase/migrations/20261004065516_email_outbox.sql` | CONFIRMADO |
| DAT-8 | Lo que Stripe recoge en el pago (domicilio, RFC, impuestos) y si manda recibos por correo no está en el código. | Panel de Stripe: Checkout → campos de cliente, tax ID, recibos | DESCONOCIDO |
| DAT-9 | Soporte por WhatsApp (Pro): el tema y el mensaje salen del navegador hacia WhatsApp. El identificador de cliente solo si la persona marca la casilla. Lattiz no guarda ese mensaje. | `apps/web/src/features/support/WhatsAppSupportDialog.tsx` | CONFIRMADO |

## 3. Sitio, plantillas y contenido

| ID | Hecho (como se redactaría) | Evidencia | Estado |
|---|---|---|---|
| SIT-1 | El cliente elige una plantilla, edita en el panel y publica HTML. El sitio público se sirve en un subdominio de Lattiz o, si hay dominio conectado y vigente, en ese dominio. | `apps/tenant-sites/lib/tenant-data.ts` `resolveTenantSite` | CONFIRMADO |
| SIT-2 | Las imágenes del cliente van a almacenamiento de objetos. El código puede usar el almacenamiento del proyecto o Cloudflare R2 servido en `assets.lattiz.app`. Hay una migración que reescribe direcciones antiguas hacia R2. El orquestador vio un depósito público de plantillas y reportó que los archivos de clientes ya están en R2. Qué proveedor está activo en el servidor de producción no se leyó. | `apps/api/.env.example` `STORAGE_PROVIDER`, `R2_PUBLIC_URL`; MCP (orquestador, 2026-10-11) | DESCONOCIDO |
| SIT-3 | No hay importación de fotos de stock (Pexels u otro). Las plantillas actuales traen sus propias imágenes. | búsqueda en el repo; `packages/template-kit/templates/` | NO IMPLEMENTADO |
| SIT-4 | No se redimensionan las fotos del cliente al subirlas. Sí se comprueba que el archivo sea una imagen (PNG, JPEG, WebP o GIF) por su contenido, no por el nombre. | `apps/api/src/modules/sites/asset-magic.ts` | CONFIRMADO |
| SIT-5 | La prueba gratuita y el subdominio temporal están en el tema 4. Las vistas previas de plantillas (`templates.lattiz.app`) son páginas estáticas de demostración, con `noindex`. | `apps/template-previews/public/`; `docs/decisions/launch-plan-decisions.md` | CONFIRMADO |
| SIT-6 | Las plantillas de producto que compila el sistema hoy son seis de barbería. No llevan formulario. El contacto es WhatsApp, teléfono, correo o un mapa. | `packages/template-kit/CLAUDE.md`; `packages/template-kit/templates/` | CONFIRMADO |

## 4. Planes, cobro y ciclo de suscripción

| ID | Hecho (como se redactaría) | Evidencia | Estado |
|---|---|---|---|
| COB-1 | Hay dos planes de pago, Básico y Pro, cada uno mensual o anual. El código los identifica por cuatro claves de precio. No hay un plan Empresarial que se pueda comprar; esa palabra solo existe como rango interno por si el plan llegara a llamarse así. | `apps/api/src/modules/billing/billing.constants.ts` `PLAN_LOOKUP_KEYS` | CONFIRMADO |
| COB-2 | En la cuenta viva de Stripe hay cuatro precios en MXN. El Básico mensual es 449 MXN. Los montos de Básico anual, Pro mensual y Pro anual no se copiaron en este inventario. El negocio decidió que esos precios ya incluyen IVA. El código cobra el precio de Stripe tal cual, sin agregar una línea de IVA en la suscripción. | MCP (orquestador, 2026-10-11); `billing.service.ts` `createCheckoutSession` | CONFIRMADO |
| COB-3 | Los tres montos que no son el Básico mensual, y si el precio de Stripe está marcado como IVA incluido, hay que leerlos en el catálogo de precios de Stripe. | Panel de Stripe: Prices, tax behavior | DESCONOCIDO |
| COB-4 | Contratar abre un pago de suscripción del cobrador y regresa al panel. No se fuerza «solo tarjeta» en ese pago (sí en la cuota de dominio). | `billing.service.ts` `createCheckoutSession` | CONFIRMADO |
| COB-5 | No hay periodo de prueba de la suscripción de pago. La prueba sin pagar es otra cosa: ver COB-8. | `createCheckoutSession` no envía `trial_period_days` | CONFIRMADO |
| COB-6 | Cancelar se hace en el portal del cobrador. El orquestador vio que esa cancelación corre al final del periodo pagado. El código abre el portal y, cuando la suscripción termina, baja el plan a «ninguno», quita el dominio del alojamiento y avisa por correo. El sitio deja de servirse en el dominio propio. El contenido no se borra. | MCP (orquestador, 2026-10-11); `billing.service.ts` `createPortalSession`, `onSubscriptionDeleted` | CONFIRMADO |
| COB-7 | Si un cobro de la suscripción falla, Lattiz cuenta el aviso. Al tercer fallo cancela la suscripción en el acto, sin esperar el calendario de reintentos del panel de Stripe. No hay en código una pausa ni unos días de gracia propios. El tiempo entre el primer y el tercer fallo lo pone el panel de Stripe. Mientras el cobrador marca el pago como atrasado y el periodo no ha acabado, el sitio público sigue en línea; el panel ya trata al cliente como no vigente para publicar. | `billing.service.ts` `MAX_PAYMENT_ATTEMPTS`, `onInvoicePaymentFailed`; `entitlement.ts` `computeIsEntitled`; `supabase/migrations/20261010090721_renewal_overdue_site_offline.sql` `tenant_site_is_entitled` | CONFIRMADO |
| COB-8 | Quien nunca ha pagado puede editar y publicar en un subdominio temporal. La ventana empieza en la primera publicación y dura los días configurables. Valor sembrado: 3. Si esa fila faltara, el respaldo de código es 14. Al vencer puede seguir editando el borrador, pero no publicar, cambiar de plantilla ni subir archivos. El sitio muestra una página de Lattiz. | `docs/decisions/free-preview-trial.md`; `settings.registry.ts` `preview.trial_days`; migración `20261009060323_app_settings.sql` | CONFIRMADO |
| COB-9 | Antiabuso de la prueba, configurable salvo donde se dice fijo: correo verificado (sembrado activo), HTML sin scripts ni formularios, aviso y `noindex` en el sitio, tope de archivos 25 MiB, solo imágenes, 6 publicaciones y 20 subidas por minuto. El aviso de que la prueba termina no está sembrado: si no hay valor, cae en el día anterior al fin cuando la prueba es de 3 días (día 2). Un solo correo por cuenta. | `settings.registry.ts` claves `preview.*`; `apps/tenant-sites/lib/free-site.ts` | CONFIRMADO |
| COB-10 | No hay lógica de reembolso de la suscripción ni de la cuota de dominio. La cotización del dominio dice que la compra es irreversible. | `domains.service.ts` `irreversible: true`; no hay llamadas de reembolso en cobro ni dominios | NO IMPLEMENTADO |
| COB-11 | No se emite CFDI. El panel dice que el comprobante de Stripe es un recibo y que, para factura fiscal, hay que escribir a soporte@lattiz.mx. | `apps/web/src/features/dashboard/account/sections/PaymentHistorySection.tsx` | NO IMPLEMENTADO |
| COB-12 | Subir de Básico a Pro es inmediato, por un flujo aparte del portal, con prorrateo. Bajar de Pro a Básico se programa para el fin del periodo, sin prorrateo, y solo dentro del mismo intervalo (mensual sigue mensual, anual sigue anual). Mientras el cambio está programado, el portal no deja cancelar. | `docs/decisions/plan-change-flow.md`; `plan-change.service.ts` `startUpgrade`, `scheduleDowngrade`; MCP (orquestador, 2026-10-11) | CONFIRMADO |
| COB-13 | La cuota anual del dominio (desde el año 2) es un pago único, solo con tarjeta, por un enlace que caduca a los 30 minutos. No hay cargo automático. Detalle en el tema 5. | `domain-renewal-payment.service.ts` `CHECKOUT_TTL_SECONDS` | CONFIRMADO |
| COB-14 | País de la cuenta de Stripe y si el portal o el checkout piden datos fiscales: panel de Stripe (Settings → Business, Customer portal, Checkout). | MCP (orquestador, 2026-10-11) | DESCONOCIDO |

## 5. Dominios

| ID | Hecho (como se redactaría) | Evidencia | Estado |
|---|---|---|---|
| DOM-1 | Hay dos figuras. Dominio gestionado: lo registra Lattiz y el cliente lo usa mientras el plan y la cuota estén al corriente. Dominio propio: el cliente ya lo tiene, Lattiz solo le dice qué registros DNS crear y lo conecta al sitio; lo renueva el cliente. | `docs/decisions/launch-plan-decisions.md`; `domains.service.ts` `initiateConnect` | CONFIRMADO |
| DOM-2 | El registrador en uso es Openprovider. GoDaddy quedó atrás. Cada dominio gestionado se registra con el contacto de Lattiz en dueño, administración, técnica y facturación. No se mandan el correo ni la dirección del cliente. La autorrenovación del registrador se apaga. La privacidad de WHOIS se envía apagada; en `.mx` y `.com.mx` el propio código anota que no se ofrece. | `docs/decisions/openprovider-registrar-migration.md`; `openprovider-registrar.adapter.ts` `registerDomain` | CONFIRMADO |
| DOM-3 | Para comprar hay que aceptar, con casilla, la Política de Privacidad y los Términos, con fecha. Esos enlaces apuntan a `https://www.lattiz.app/privacy` y `https://www.lattiz.app/terms`. Esas páginas aún no existen (tema de la landing). | `domains.service.ts` `REQUIRED_AGREEMENTS`; MCP (orquestador, 2026-10-11) | CONFIRMADO |
| DOM-4 | El primer año va incluido. Solo se ofrece si el precio de compra y el de renovación en el registrador caben en los topes del plan. Topes sembrados: compra 22 USD; renovación Básico 23.67 USD; renovación Pro 42 USD. Son configurables. Si Básico no cubre la renovación y Pro sí, se muestra «Disponible con Pro». Un Pro con baja ya programada compra como Básico. | `docs/decisions/domain-renewal-cap-enforced.md`; migración `20261009072258_domain_price_caps_settings.sql` | CONFIRMADO |
| DOM-5 | Cada cuenta tiene un solo dominio incluido. Pedir otro responde que ya se usó y pide escribir a Lattiz. No hay compra de un segundo dominio de pago. | `docs/decisions/domain-renewal-fee.md`; `domain-errors.ts` `INCLUDED_DOMAIN_ALREADY_USED` | CONFIRMADO |
| DOM-6 | Desde el segundo año la cuota es 599 MXN más IVA (16 %), el mismo monto sembrado en Básico y Pro. Configurable. El enlace de pago se abre 28 días antes del vencimiento. Avisos a 28, 14, 7, 3, 1 y 0 días, y uno a los 7 días de atraso. Solo se puede pagar con suscripción vigente. La cuota no tiene reembolso en el código. Al pagarse, Lattiz renueva un año en el registrador. | `domain-renewal.config.ts`; migración `20261010074530_domain_renewal_cycles_settings.sql`; `docs/decisions/domain-renewal-fee.md` | CONFIRMADO |
| DOM-7 | Si vence sin pago, el sitio deja de servirse también en el subdominio de Lattiz. Hay 15 días para pagar tarde. Después se suelta el servicio (se quita del alojamiento y se borra la zona DNS) y el sitio vuelve al subdominio. El nombre sigue registrado a nombre de Lattiz, con autorrenovación apagada, hasta que el registrador lo pierda. Lattiz no paga recargos de recuperación: si el registrador ya no deja renovar, no hay restauración automática de pago. | `docs/decisions/domain-renewal-fee.md`; `domain-renewal.service.ts`; `domain-renewal.policy.ts` `renewalWindow` | CONFIRMADO |
| DOM-8 | Cancelar la suscripción suspende el sitio al final del periodo: se desconecta el dominio del alojamiento, pero la zona DNS y el registro se conservan para poder reactivarlo si vuelve a pagar. Eliminar la cuenta desconecta el dominio y borra la zona DNS en el acto. No hay traspaso del dominio al cliente. | `domains.service.ts` `suspendDomainForTenant`, `releaseDomain`, `releaseDomainsForUser`; comentario de traspaso al final de `domains.service.ts` | CONFIRMADO |
| DOM-9 | El traspaso del dominio al cliente no está implementado. Es un caso manual. | `domains.service.ts` comentario de transferencia | NO IMPLEMENTADO |
| DOM-10 | El DNS de los dominios gestionados lo lleva Cloudflare cuando el servidor está configurado así; si no, el del registrador. El DNS de `lattiz.app` está en Cloudflare. La región y la cuenta no se leyeron del panel. | `docs/decisions/launch-plan-decisions.md`; `domains.module.ts` | DESCONOCIDO |
| DOM-11 | Extensiones que se buscan: `.com`, `.com.mx`, `.mx`, `.net`, `.org`. | `domains.service.ts` `SEARCH_TLDS` | CONFIRMADO |
| DOM-12 | Reintentos fijos de código: hasta 5 intentos de renovar en el registrador tras el pago (configurable, sembrado 5); el enlace de pago dura 30 minutos (fijo); una auditoría diaria revisa que la autorrenovación siga apagada. | `domain-renewal.config.ts`; `domain-renewal-payment.service.ts` `CHECKOUT_TTL_SECONDS`; `domains.service.ts` cron `0 6 * * *` | CONFIRMADO |

## 6. Analíticas (plan Pro)

| ID | Hecho (como se redactaría) | Evidencia | Estado |
|---|---|---|---|
| ANA-1 | Con plan Pro y suscripción vigente, Lattiz crea una propiedad de Google Analytics 4 y un flujo web dentro de la cuenta de Google de Lattiz. La zona horaria por defecto es Ciudad de México y la moneda MXN. El cliente no conecta su propia cuenta. | `analytics.service.ts` `runProvisioning`; `analytics.config.ts` | CONFIRMADO |
| ANA-2 | Quién es el dueño de la cuenta de Google, quién aceptó los términos de Google y qué dice la pantalla de consentimiento de OAuth no está en el código. No hay inicio de sesión con Google del usuario. | Variables `GA4_ACCOUNT_ID` y credencial de cuenta de servicio; panel de Google Cloud / Analytics | DESCONOCIDO |
| ANA-3 | Al crear la propiedad se pide conservar los datos de eventos 14 meses. Si ese ajuste falla, la propiedad igual queda lista. | `ga4.gateway.ts` `setRetention` (`FOURTEEN_MONTHS`); `analytics.service.ts` (el fallo no aborta) | CONFIRMADO |
| ANA-4 | El medidor solo se inserta en el sitio publicado si el plan es Pro, la suscripción da derecho al servicio y la propiedad está lista. No va en la prueba gratuita ni en Básico. | `get_public_tenant_site` en `20261009060323_app_settings.sql`; `free-site.ts` `composePublishedHtml` | CONFIRMADO |
| ANA-5 | Antes de cargar Google, el sitio muestra un aviso con Aceptar y Rechazar. Google solo se pide si la persona acepta. La elección se guarda en el navegador 365 días, por dominio. No hay enlace al aviso de privacidad ni forma de retirar el consentimiento después. Señales publicitarias y personalización de anuncios van apagadas en la configuración que envía el sitio. | `apps/tenant-sites/lib/analytics-snippet.ts` | CONFIRMADO |
| ANA-6 | El panel Pro muestra un resumen de 28 días (sesiones, usuarios, canales) y activos de los últimos 30 minutos. El resumen se vuelve a pedir como máximo cada hora (configurable; respaldo 3600 segundos). Los activos recientes se guardan en memoria unos 30 segundos. | `analytics.service.ts` `RANGE_DAYS`, `REALTIME_WINDOW_MINUTES`; `analytics.config.ts` | CONFIRMADO |
| ANA-7 | Al bajar a Básico, al cancelar o al suspender el derecho, el medidor deja de insertarse y el panel deja de mostrar cifras. La propiedad de Google y el resumen guardado no se borran. Si vuelve a Pro, se reutiliza la misma propiedad. | `analytics.service.ts` `getOverview` (plan distinto de Pro → no elegible); comentario de borrado de propiedad | CONFIRMADO |
| ANA-8 | Eliminar la cuenta borra la ficha interna de analítica junto con el negocio, pero no llama a Google para borrar la propiedad. La propiedad queda huérfana en la cuenta de Lattiz. | `analytics.service.ts` comentario junto a `properties.delete`; `delete-account.use-case.ts` | NO IMPLEMENTADO |
| ANA-9 | El tablero se alimenta con la API de administración y la API de datos de Google Analytics, con credencial de Lattiz, no con el permiso de un usuario final. | `ga4.gateway.ts` | CONFIRMADO |

## 7. Cambio de plan Pro → Básico

| ID | Hecho (como se redactaría) | Evidencia | Estado |
|---|---|---|---|
| BAJ-1 | La baja aplica al terminar el periodo ya pagado. Hasta entonces el cliente sigue en Pro. | `plan-change.policy.ts` `evaluatePlanChange`; `docs/decisions/plan-change-flow.md` | CONFIRMADO |
| BAJ-2 | Si la plantilla actual es Pro, hay que confirmar que se pierde el acceso. Al llegar la fecha, cargar, guardar, subir y publicar quedan bloqueados. El sitio ya publicado sigue en línea. Las ediciones no se borran ni se ocultan por un plazo: se bloquean. No hay restauración automática. | `docs/decisions/template-access-by-plan.md`; `template-access.policy.ts` `lockBlocksEditing`; `template-access.copy.ts` | CONFIRMADO |
| BAJ-3 | Cambiar a otra plantilla archiva antes una copia del proyecto y del HTML, y el proyecto nuevo no hereda el contenido. Esa copia no tiene pantalla de restauración. | `sites.service.ts` (archivo al cambiar plantilla); `template-access.policy.ts` `migrateContentOnSwitch` | CONFIRMADO |
| BAJ-4 | La analítica deja de recogerse en el sitio y deja de verse en el panel cuando el plan ya es Básico. Lo ya recogido en Google se queda (ANA-7). El aviso previo a la baja hoy solo lista la plantilla, no la analítica. | `plan-change-impact.ts` | CONFIRMADO |
| BAJ-5 | Si el dominio gestionado renueva por encima del tope de Básico, la baja se niega. Si no se puede leer el precio, también se niega. | `plan-change.policy.ts` `DOWNGRADE_DOMAIN_ABOVE_BASIC_CAP`; `docs/decisions/domain-renewal-cap-enforced.md` | CONFIRMADO |
| BAJ-6 | El dominio no se quita por el solo hecho de bajar de plan. Sigue mientras la suscripción esté vigente y se pague la cuota. | `suspendDomainForTenant` solo corre al terminar la suscripción | CONFIRMADO |

## 8. Eliminación de cuenta y solicitudes de borrado

| ID | Hecho (como se redactaría) | Evidencia | Estado |
|---|---|---|---|
| DEL-1 | Existe una pantalla de eliminación (`/account/delete`, se escribe DELETE), pero ningún menú ni botón del panel lleva a ella: en la práctica el cliente no puede eliminar su cuenta por sí mismo y debe pedirlo por correo. Al ejecutarse, la cuenta se borra en el acto. Primero se cancelan de inmediato las suscripciones que aún puedan cobrar. Si eso falla, la cuenta no se borra. | `apps/web/src/routes/_authenticated/account.delete.tsx`; `billing.service.ts` `cancelSubscriptionsForUser` | CONFIRMADO |
| DEL-2 | Enseguida se desconecta el dominio del alojamiento y se intenta borrar la zona DNS. Si eso falla, la cuenta igual se borra y queda un barrido posterior. El registro del dominio en el registrador no se cancela ni se traspasa. | `delete-account.use-case.ts`; `domains.service.ts` `releaseDomainsForUser` | CONFIRMADO |
| DEL-3 | Después se borra el perfil de la aplicación y el usuario de identidad. Con el usuario caen en cascada el negocio, el sitio, los dominios internos, la suscripción interna, la analítica interna y los archivos de plantilla archivados. | `delete-account.use-case.ts`; claves foráneas `ON DELETE CASCADE` en las migraciones de negocio, sitio, dominios, suscripciones y analítica | CONFIRMADO |
| DEL-4 | No se borran: el cliente y las facturas en Stripe, la propiedad de Google Analytics, los archivos de imágenes del cliente, el dominio en el registrador, ni la bandeja de correos (conserva el correo de destino, incluido el aviso de cuenta eliminada). | `delete-account.use-case.ts`; `email_outbox` sin clave hacia el negocio; `analytics.service.ts` | NO IMPLEMENTADO |
| DEL-5 | No hay exportación de los datos de la cuenta. | búsqueda de un caso de uso de exportación; no existe | NO IMPLEMENTADO |
| DEL-6 | No hay un plazo de gracia ni un trabajo programado que borre después. Es inmediato, salvo lo que DEL-4 deja en terceros. | `delete-account.use-case.ts` | CONFIRMADO |
| DEL-7 | Copias de seguridad de la base, ventanas de recuperación y versiones de los archivos: panel de Supabase (Backups / PITR) y de R2 (lifecycle). No están en el código. | — | DESCONOCIDO |
| DEL-8 | El correo de soporte para pedir un borrado existe como dirección (tema 15). No hay bandeja ni expediente de solicitudes. | `apps/web/src/features/support/support.ts` `SUPPORT_EMAIL` | NO IMPLEMENTADO |

## 9. Derechos ARCO operativos

| ID | Hecho (como se redactaría) | Evidencia | Estado |
|---|---|---|---|
| ARC-1 | No hay módulo, formulario ni bitácora de solicitudes de acceso, rectificación, cancelación u oposición. | búsqueda en la aplicación | NO IMPLEMENTADO |
| ARC-2 | El canal que sí existe es el correo soporte@lattiz.app (Básico y Pro) y, en Pro con suscripción vigente, WhatsApp si el número de soporte está configurado. La eliminación de cuenta del tema 8 es de autoservicio. | `support.ts` | CONFIRMADO |
| ARC-3 | Quién atiende ese correo y en qué plazo no está en el sistema. | Decisión del negocio | DESCONOCIDO |

## 10. Datos de visitantes de los sitios de clientes

| ID | Hecho (como se redactaría) | Evidencia | Estado |
|---|---|---|---|
| VIS-1 | Las plantillas de producto no tienen formularios. No recogen nombre ni correo del visitante en el sitio. El contacto abre WhatsApp, el teléfono, el correo o un enlace. | `packages/template-kit` regla `form`; secciones con `wa.me` | CONFIRMADO |
| VIS-2 | Recursos que las plantillas vigentes cargan solas, sin clic: hojas de fuentes de `fonts.googleapis.com` y archivos de `fonts.gstatic.com`; un mapa embebido de `www.google.com` (iframe) en la sección de ubicación. Esos mapas no cargan en la prueba gratuita endurecida, porque ahí no se permiten marcos. | `packages/template-kit/src/lib/compile.ts`; `src/lib/content.ts` `mapsEmbedUrl`; `free-site.ts` `FREE_CONTENT_SECURITY_POLICY` | CONFIRMADO |
| VIS-3 | Enlaces que no cargan hasta que el visitante hace clic: `wa.me`, Instagram, Facebook y reseñas de Google (`google.com` / `maps`). No hay reproductor de YouTube ni Vimeo en las plantillas vigentes. | plantillas en `packages/template-kit/templates/` | CONFIRMADO |
| VIS-4 | Google Analytics (`www.googletagmanager.com`) solo entra tras Aceptar, y solo en sitios de pago Pro (ANA-4, ANA-5). | `analytics-snippet.ts` | CONFIRMADO |
| VIS-5 | Las imágenes publicadas salen del almacenamiento de Lattiz (`assets.lattiz.app` cuando el origen es R2). | `R2_PUBLIC_URL` en `apps/api/.env.example` | CONFIRMADO |
| VIS-6 | Direcciones IP de visitantes: el alojamiento de los sitios es Vercel y el de la API pasa por un proxy en la VM. No hay en el código un registro de IP de visitantes ni su plazo. Registros del proxy: tema 14. | `deploy/docker-compose.prod.yml` | DESCONOCIDO |
| VIS-7 | En las vistas previas de plantillas queda una página antigua (`medical-center`) que referencia scripts de `cdn.jsdelivr.net`. No está entre las seis plantillas que el sistema compila hoy. Si ese HTML sigue publicado en el sitio de previews, carga ese tercero. | `apps/template-previews/public/medical-center-v1/index.html` | DESCONOCIDO |

## 11. Cookies y almacenamiento local

No hay banner de consentimiento en el panel ni en las vistas previas de plantillas. En el sitio del cliente el banner existe solo cuando se inserta la analítica, y el script de Google no carga antes de Aceptar. Fuentes y mapas del sitio de pago sí cargan sin preguntar.

La landing se verifica en su repo. El orquestador ya vio Vercel Analytics instalado, sin página de cookies.

### Panel (`apps/web`)

| ID | Hecho (como se redactaría) | Evidencia | Estado |
|---|---|---|---|
| CK-1 | `lattiz-theme` en almacenamiento local. Lo pone el panel. Valores: claro, oscuro o sistema. Preferencia de presentación. Dura hasta que se borra el almacenamiento. Sin caducidad. | `apps/web/src/lib/theme-provider.tsx` `STORAGE_KEY` | CONFIRMADO |
| CK-2 | `lattiz-onboarding-dismissed` en almacenamiento local. Valor `true` si la persona cerró la guía. Preferencia. Sin caducidad. | `apps/web/src/features/onboarding/onboarding.store.ts` `DISMISS_KEY` | CONFIRMADO |
| CK-3 | `lattiz-onboarding-panel-collapsed` en almacenamiento local. Si el panel de avance está plegado. Preferencia. Sin caducidad. | `OnboardingProgressPanel.tsx` `COLLAPSE_KEY` | CONFIRMADO |
| CK-4 | `lattiz.editor.advancedStyles` en almacenamiento local. Si el editor muestra estilos avanzados. Preferencia. Sin caducidad. | `apps/web/src/features/editor/style-mode.ts` `ADVANCED_STYLES_STORAGE_KEY` | CONFIRMADO |
| CK-5 | `lattiz.planChangeReturnTo` en almacenamiento de la pestaña. Ruta a la que volver tras cambiar de plan. Se borra al usarla. Muere con la pestaña. Funcional. | `usePlanChange.ts` `RETURN_TO_KEY` | CONFIRMADO |
| CK-6 | Sesión de acceso en almacenamiento de la pestaña (no en almacenamiento local). La pone la librería de identidad. Estrictamente necesaria para entrar. Muere al cerrar la pestaña. La caducidad del token en producción es la de AUT-9. | `apps/web/src/lib/supabase.ts` | CONFIRMADO |
| CK-7 | Cookie propia `sidebar_state`. La pone el panel al abrir o cerrar el menú lateral. Duración 7 días, ruta `/`. Funcional. El código no fija `Secure` ni `SameSite`. | `apps/web/src/components/ui/sidebar.tsx` `SIDEBAR_COOKIE_NAME`, `SIDEBAR_COOKIE_MAX_AGE` | CONFIRMADO |
| CK-8 | El panel no carga analítica, Stripe.js ni un banner de cookies. El pago abre el sitio de Stripe en otra página; las cookies de ese sitio las pone Stripe, no el panel. | búsqueda en `apps/web`; `createCheckoutSession` devuelve una URL | CONFIRMADO |

### Sitios de clientes (`apps/tenant-sites`)

| ID | Hecho (como se redactaría) | Evidencia | Estado |
|---|---|---|---|
| CK-9 | `lz_consent` en almacenamiento local. Lo pone el aviso del propio sitio. Guarda `granted` o `denied` y la hora. Caduca a los 365 días. Categoría: consentimiento. Solo existe si el sitio lleva analítica (ANA-4). Si el navegador bloquea el almacenamiento, la elección no persiste y el aviso vuelve. | `analytics-snippet.ts` `KEY`, `TTL` | CONFIRMADO |
| CK-10 | Cookies de Google Analytics (`_ga` y afines). Las pone Google, solo después de Aceptar, con el medidor `www.googletagmanager.com`. La duración exacta la define Google, no Lattiz. | `analytics-snippet.ts` `loadGA` | DESCONOCIDO |
| CK-11 | No hay cookies puestas por el servidor de sitios en el código. El aviso no es una cookie: es un recuadro en la página. | `apps/tenant-sites` (sin `document.cookie`) | CONFIRMADO |
| CK-12 | Fuentes de Google y el mapa embebido cargan en el sitio de pago sin esperar el aviso. En la prueba gratuita el mapa no carga; las fuentes sí pueden cargarse. | `compile.ts`; `free-site.ts` | CONFIRMADO |

### Vistas previas de plantillas (`apps/template-previews`)

| ID | Hecho (como se redactaría) | Evidencia | Estado |
|---|---|---|---|
| CK-13 | El código de esa aplicación no escribe almacenamiento local, de sesión ni cookies. Las páginas cargan fuentes de Google. No hay banner. | búsqueda en `apps/template-previews` | CONFIRMADO |

### Landing

| ID | Hecho (como se redactaría) | Evidencia | Estado |
|---|---|---|---|
| CK-14 | Cookies, almacenamiento y banner de `lattiz.app`, incluido lo que ponga Vercel Analytics. | Repo de la landing. El orquestador ya vio Vercel Analytics instalado y que no hay página de cookies. | DESCONOCIDO |

## 12. Proveedores y ubicación

| ID | Hecho (como se redactaría) | Evidencia | Estado |
|---|---|---|---|
| PRO-1 | Identidad y base de datos: Supabase. El pooler de producción está en Oregón, Estados Unidos (`aws-1-us-west-2`). Postgres 17.6. | MCP (orquestador, 2026-10-11) | CONFIRMADO |
| PRO-2 | Cobros: Stripe, precios en MXN. País de la entidad: panel de Stripe. | MCP (orquestador, 2026-10-11) | DESCONOCIDO |
| PRO-3 | Registrador: Openprovider. La API de producción está en la Unión Europea. El contacto del dominio es el de la cuenta de Lattiz en ese panel. | `apps/api/.env.example` `OPENPROVIDER_BASE_URL`; `registerDomain` | CONFIRMADO |
| PRO-4 | DNS de dominios gestionados: Cloudflare o el registrador, según el arranque del servidor. Ubicación de la cuenta de Cloudflare: panel. | `domains.module.ts`; `docs/decisions/launch-plan-decisions.md` | DESCONOCIDO |
| PRO-5 | Sitios publicados, previews y la landing: Vercel. Región de funciones, Speed Insights y drenaje de logs: panel de Vercel. | `docs/decisions/vercel-web-deploy-requirements.md`; sin acceso a Vercel | DESCONOCIDO |
| PRO-6 | Archivos: Cloudflare R2 como destino (`assets.lattiz.app`). Región del bucket: panel de R2. | `docs/decisions/launch-plan-decisions.md`; `R2_PUBLIC_URL` | DESCONOCIDO |
| PRO-7 | Correo de la aplicación: Resend, de `no-reply@lattiz.app`, respuesta a `hola@lattiz.app`, cuando el arranque elige ese proveedor. El valor en el servidor no se leyó. Los códigos de acceso los manda el correo de Supabase Auth, no este canal. | `apps/api/.env.example` `EMAIL_PROVIDER`, `EMAIL_FROM`, `EMAIL_REPLY_TO`; `docs/decisions/launch-plan-decisions.md` | DESCONOCIDO |
| PRO-8 | Analítica: Google Analytics 4, cuenta de Lattiz. Región del tratamiento: panel de Google. | `ga4.gateway.ts` | DESCONOCIDO |
| PRO-9 | Fuentes y mapas: Google (tema 10). Mensajería de contacto y soporte Pro: WhatsApp. | `compile.ts`; `support.ts` | CONFIRMADO |
| PRO-10 | La API corre en una sola máquina virtual, detrás de un proxy HTTPS. Región de esa máquina: no está en el código. | `docs/decisions/launch-plan-decisions.md`; `deploy/docker-compose.prod.yml` | DESCONOCIDO |
| PRO-11 | No se usan Pexels, Cloudinary, Facebook Login ni Sign in with Apple en este repositorio. | búsqueda en dependencias y en `auth.ts` | CONFIRMADO |

## 13. Seguridad (huecos, sin ampliar)

| ID | Hecho (como se redactaría) | Evidencia | Estado |
|---|---|---|---|
| SEG-1 | El panel y la API se hablan con un token firmado, verificado en el servidor. El algoritmo permitido es el de curva elíptica que usa el proveedor de identidad actual. | `apps/api/src/common/auth/supabase-jwt.guard.ts` | CONFIRMADO |
| SEG-2 | El sitio público y el panel viajan por HTTPS en el despliegue descrito (el proxy escucha 80 y 443). | `deploy/docker-compose.prod.yml` servicio `caddy` | CONFIRMADO |
| SEG-3 | Todas las tablas públicas de producción tienen aislamiento por fila activado. Ocho solo las alcanza la credencial de servidor. | MCP (orquestador, 2026-10-11) | CONFIRMADO |
| SEG-4 | La credencial privilegiada de identidad y almacenamiento no está en la aplicación del navegador. La usa el servidor para borrar la cuenta y, si el almacenamiento aún es el del proyecto, para subir archivos. | `apps/api/.env.example` comentario de `SUPABASE_SERVICE_ROLE_KEY`; `apps/web` solo clave anónima | CONFIRMADO |
| SEG-5 | Los avisos de cobro se rechazan si la firma no coincide. | `billing.service.ts` `handleWebhook` | CONFIRMADO |
| SEG-6 | Huecos que el revisor de la base marcó (aviso, no bloqueo): una función de mantenimiento es ejecutable por visitantes anónimos y por usuarios ingresados; la lectura del sitio público es ejecutable por anónimos y eso es intencional (es la única puerta del sitio); un disparador de «fecha de actualización» no fija la ruta de búsqueda; la protección de contraseñas filtradas del proveedor de identidad está apagada. | MCP (orquestador, 2026-10-11) | CONFIRMADO |

## 14. Retención

| ID | Hecho (como se redactaría) | Evidencia | Estado |
|---|---|---|---|
| RET-1 | Registros del contenedor de la API y del proxy: rotación por tamaño, 10 MB y 3 archivos (unos 30 MB), no por días. | `deploy/docker-compose.prod.yml` `logging` | CONFIRMADO |
| RET-2 | No hay en el repositorio el plazo de los access logs del proxy, de Vercel ni de Cloudflare. | `Caddyfile` no está en el repo; paneles de Vercel y Cloudflare | DESCONOCIDO |
| RET-3 | Analítica de eventos en Google: se pide 14 meses al crear la propiedad (ANA-3). El resumen en la base se refresca cada hora; no es el archivo legal. | `ga4.gateway.ts` `setRetention` | CONFIRMADO |
| RET-4 | Copias de la base y versiones de archivos: paneles de Supabase y de R2. | — | DESCONOCIDO |
| RET-5 | La bandeja de correos no tiene caducidad en el código. El soporte por WhatsApp no se archiva en Lattiz. | `email_outbox`; `WhatsAppSupportDialog.tsx` | CONFIRMADO |
| RET-6 | No hay expediente de soporte con plazo. | — | NO IMPLEMENTADO |

## 15. Comunicaciones

| ID | Hecho (como se redactaría) | Evidencia | Estado |
|---|---|---|---|
| COM-1 | Correos de la aplicación, todos transaccionales: bienvenida al pagar, pago fallido, sitio suspendido, sitio reactivado, dominio listo, compra de dominio fallida, cuenta eliminada, avisos de renovación (próxima, último, renovado, vencido, dominio perdido), fin de la prueba, y alertas internas al negocio. No hay boletín ni correo de marketing en el código. | `apps/api/src/modules/email/domain/email-kinds.ts` `EMAIL_KINDS` | CONFIRMADO |
| COM-2 | El envío real está sembrado como activo, hasta 20 correos por pasada (configurable). Si un envío falla, se reintenta a los 1 minuto, 5 minutos, 30 minutos, 2 horas y 6 horas, y se rinde al sexto intento. Esos tiempos son fijos. | migración `20261009064312_seed_email_dns_settings.sql`; `email-kinds.ts` `EMAIL_BACKOFF_MS`, `EMAIL_MAX_ATTEMPTS` | CONFIRMADO |
| COM-3 | Remitente previsto: `no-reply@lattiz.app`. Respuesta: `hola@lattiz.app`. Alertas internas sembradas a `avisos@lattiz.app` (configurable; vacío no envía). | `apps/api/.env.example` `EMAIL_FROM`, `EMAIL_REPLY_TO`; migración de renovación `alerts.admin_email` | CONFIRMADO |
| COM-4 | El código de alta y el de recuperación los manda Supabase Auth, no la lista de COM-1. El texto de esas plantillas está en el panel de Auth. | `auth.ts`; `supabase/config.toml` plantillas comentadas | DESCONOCIDO |
| COM-5 | Direcciones que el producto muestra, y no coinciden entre sí: soporte del panel `soporte@lattiz.app`; factura fiscal `soporte@lattiz.mx`; abuso de sitios de prueba `soporte@lattiz.app`; landing `hola@lattiz.app` con la etiqueta «contacto@lattiz.app». | `support.ts`; `PaymentHistorySection.tsx`; `apps/tenant-sites/.env.example` `PREVIEW_ABUSE_REPORT_URL`; MCP landing | CONFIRMADO |
| COM-6 | No hay correo de marketing conocido en este repositorio. Si Auth o Resend tuvieran una audiencia aparte, sería del panel. | `EMAIL_KINDS` | DESCONOCIDO |

## 16. Menores y datos sensibles

| ID | Hecho (como se redactaría) | Evidencia | Estado |
|---|---|---|---|
| MEN-1 | No hay pregunta de edad ni bloqueo de menores en el alta ni en el sitio. | búsqueda en alta y sitios | NO IMPLEMENTADO |
| MEN-2 | Lattiz no tiene un formulario de datos de salud. Las plantillas vigentes son de barbería: nombre del negocio, servicios, precios, dirección, horario y contacto. Eso lo escribe el cliente y se publica. Una vista previa antigua de centro médico no está en el compilador actual (VIS-7). | `packages/template-kit/templates/`; `medical-center-v1` | CONFIRMADO |

---

## NO IMPLEMENTADO

Manejo propuesto: ajustar el texto, salvo que el negocio pida otra cosa.

- AUT-6 — No decir que al crear la cuenta se guarda fecha y versión de Términos o del Aviso.
- SIT-3 — No prometer banco de fotos de stock.
- COB-10 — No prometer reembolsos automáticos. La compra de dominio puede decirse irreversible porque el sistema la marca así y no hay reembolso.
- COB-11 — La factura fiscal es manual, por correo, no un CFDI del sistema.
- DOM-3 — Las casillas de la compra enlazan a páginas que aún no existen. Publicarlas es del repo de la landing; el texto no puede dar por hecho que ya están.
- DOM-9 — No prometer traspaso del dominio al cliente.
- ANA-8 — No decir que borrar la cuenta borra la propiedad de Google Analytics.
- DEL-4 — Listar lo que queda en Stripe, Google, el registrador, los archivos y la bandeja de correos.
- DEL-5 — No prometer exportación de datos.
- DEL-8 y ARC-1 — No describir un expediente de solicitudes ARCO. El canal es el correo y la eliminación de autoservicio.
- MEN-1 — No decir que hay control de edad.
- RET-6 — No inventar un plazo de tickets de soporte.

## DESCONOCIDO

Quién debe resolverlo: el negocio, leyendo el panel indicado.

- AUT-4 — Panel de Supabase Auth → Providers: qué inicios de sesión están habilitados (el código solo ofrece correo).
- AUT-9 — Panel de Supabase Auth → sesiones, OTP y contraseña: caducidad del token, longitud y caducidad del código, longitud mínima de contraseña. La config local no es la de producción.
- DAT-8 y COB-14 — Panel de Stripe: país de la cuenta, campos del Checkout (domicilio, RFC), impuestos y recibos por correo.
- COB-3 — Catálogo de precios de Stripe: montos de Básico anual, Pro mensual y Pro anual, y si el precio está como IVA incluido.
- SIT-2 — Entorno de la API en producción: valor de `STORAGE_PROVIDER` (sin copiar secretos) para decir si los archivos nuevos van a R2.
- DOM-10, PRO-4, PRO-6 — Paneles de Cloudflare y R2: cuenta, y región del bucket.
- PRO-5, VIS-6, RET-2 — Panel de Vercel: región, Speed Insights, log drains, retención de logs.
- PRO-7 — Entorno de la API: `EMAIL_PROVIDER` (si es Resend u otro). Panel de Supabase Auth → SMTP: quién manda los códigos.
- PRO-8, ANA-2 — Cuenta de Google Analytics y proyecto de Google Cloud: dueño, quién aceptó los términos, región. No hay pantalla de consentimiento de «Entrar con Google» en este código.
- PRO-10 — Dónde está la máquina de la API.
- DEL-7, RET-4 — Supabase Backups/PITR y ciclo de vida de R2.
- ARC-3 — Quién lee soporte@lattiz.app y en qué plazo.
- CK-10 — Documentación de Google sobre la duración de las cookies del medidor que carga el sitio tras Aceptar.
- CK-14, VIS-7 — Repo de la landing (cookies, Vercel Analytics, páginas `/privacy`, `/terms` y de cookies) y si `medical-center` sigue publicado en las previews.
- COM-4 y COM-6 — Plantillas de correo de Auth, y si existe alguna lista de marketing fuera de este repo.

## DESVIACIONES

El código manda sobre el resumen de negocio cuando no coinciden.

- Quien cancela o a quien se le termina la suscripción queda con plan «ninguno». Con ese plan, si nunca publicó una prueba (o si la ventana siguiera abierta), el sistema le vuelve a permitir la prueba gratuita. La decisión dice que quien canceló o dejó vencer no tiene prueba. `billing.service.ts` `onSubscriptionDeleted` pone el plan en `none`; `preview-capability.ts` `computePreviewCapability` da la ventana a todo plan `none`.
- No hay días de gracia propios para un pago de suscripción fallido. Hay un tope de 3 avisos y luego cancelación. El sitio público sigue en línea mientras el cobrador dice «atrasado» y el periodo no acabó; el panel ya no deja publicar. Los días entre intentos están en el panel de Stripe, no en el código.
- «Eliminar la cuenta libera el dominio de inmediato» es cierto para el sitio y la zona DNS. El nombre sigue registrado a nombre de Lattiz en Openprovider, con autorrenovación apagada, hasta que venza en el registrador. No hay baja ni traspaso.
- La baja de plan exige confirmar la pérdida de la plantilla Pro, pero el sistema no borra las ediciones: las bloquea y deja el sitio publicado. Al cambiar de plantilla se guarda una copia sin pantalla para restaurarla.
- El respaldo de código de la prueba es 14 días si falta la fila; lo sembrado es 3. El texto debe hablar de «días configurables» y no fijar 14.
- El comentario de alta dice código de 8 dígitos; la config local usa 6 y una hora. Producción: AUT-9.
- Hay varias direcciones de contacto (COM-5). El texto legal tiene que elegir una; el sistema no tiene una sola.

## Recuento de filas de las tablas

| Estado | Filas |
|---|---|
| CONFIRMADO | 92 |
| NO IMPLEMENTADO | 12 |
| DESCONOCIDO | 25 |
| Total | 129 |

El recuento es de filas de las tablas (columna Estado). Las listas de cierre repiten esos identificadores y no suman filas nuevas.
