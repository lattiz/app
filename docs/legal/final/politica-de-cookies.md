# Política de Cookies

Versión 1.0. Última actualización: 12 de octubre de 2026

Esta política explica qué cookies y tecnologías parecidas usan el sitio informativo de Lattiz, el panel y los sitios que publican nuestros clientes. Léela con el Aviso de Privacidad (`https://lattiz.app/privacy`) y los Términos (`https://lattiz.app/terms`).

## Resumen en lenguaje llano

El resumen ayuda a ubicarte. No sustituye al texto de las cláusulas.

- Usamos cookies y el almacenamiento del navegador para que el panel funcione y recuerde preferencias.
- `lattiz.app` no pone cookies propias ni usa almacenamiento local en el código revisado. Mide las visitas de forma agregada.
- El panel guarda la sesión en la pestaña, una cookie del menú y preferencias en el navegador. No tiene un aviso de cookies.
- En los sitios de los clientes, las fuentes y, en un sitio de pago, el mapa pueden cargar sin preguntar. La medición de Google solo carga en el plan Pro, y solo si el visitante acepta.
- Esa elección dura 365 días. El sitio no tiene un botón para cambiarla después. Se borra desde el navegador.
- Tú respondes por el contenido de tu sitio y por informar a tus visitantes. Lattiz responde por `lattiz.app` y por el panel.
- El pago se hace en la página de Stripe. Las cookies de esa página las pone Stripe, no el panel.

## 1. Qué son

1.1 Las cookies son pequeños archivos que un sitio guarda en tu navegador. También usamos el almacenamiento del navegador: el que permanece (`localStorage`) y el que muere con la pestaña (`sessionStorage`). En esta política, “cookies” incluye esas tecnologías cuando hacen un papel parecido.

1.2 Las usamos para entrar al panel, recordar una preferencia o, en los sitios Pro, recordar si el visitante aceptó la medición de visitas. No las usamos para un boletín ni para publicidad de Lattiz.

1.3 Según para qué sirven, en este texto las llamamos así: estrictamente necesarias, funcionales, de preferencia, de consentimiento o de medición.

## 2. Cómo está armado este inventario

2.1 Hay cuatro superficies: el sitio informativo `https://lattiz.app`, el panel `https://dashboard.lattiz.app`, los sitios publicados de los clientes y las vistas previas de plantillas en `templates.lattiz.app`.

2.2 Solo listamos lo que el código revisado pone o carga. Donde la duración la define un tercero y no está confirmada, lo decimos. No afirmamos un aviso de cookies donde no existe.

## 3. Sitio informativo (`lattiz.app`)

3.1 Es un sitio de información. No tiene formularios ni inicio de sesión. En el código revisado no pone cookies propias ni usa almacenamiento local. No tiene un aviso de cookies. Las fuentes se cargan desde el propio sitio, no desde un servicio externo de tipografías.

3.2 Mide la audiencia con Vercel Analytics. Lo describimos como medición agregada de visitas. Ese proveedor declara que esa medición no usa cookies de seguimiento de terceros. Esa declaración es del proveedor; esta versión no la verifica por fuera de su documentación.

| Nombre o clave | Quién la pone | Para qué | Duración | Categoría |
|---|---|---|---|---|
| Ninguna cookie propia ni clave de almacenamiento en el código revisado | — | — | — | — |
| Medición de Vercel Analytics (sin clave propia en el código revisado) | Vercel | Medición agregada de visitas del sitio informativo | La define Vercel. No está confirmada aquí | Medición |

## 4. Panel (`dashboard.lattiz.app`)

4.1 El panel no carga analítica, no carga el script de pago de Stripe y no tiene un aviso de cookies. El pago abre el sitio de Stripe en otra página. Las cookies de esa página las pone Stripe, no el panel.

4.2 La sesión de acceso no está en una cookie propia nuestra. Vive en el almacenamiento de la pestaña. La pone la librería del proveedor de identidad. Hace falta para entrar. Se borra al cerrar la pestaña. Cuánto dura cada acceso en producción lo define ese proveedor y no está confirmado en esta versión.

| Nombre o clave | Quién la pone | Para qué | Duración | Categoría |
|---|---|---|---|---|
| Sesión de acceso (almacenamiento de la pestaña; no es una cookie con nombre propio de Lattiz) | Proveedor de identidad, desde el panel | Entrar y mantener la sesión | Muere al cerrar la pestaña. La caducidad del acceso la define el proveedor de identidad | Estrictamente necesaria |
| `sidebar_state` | El panel | Recordar si el menú lateral está abierto o cerrado | 7 días | Funcional |
| `lattiz-theme` | El panel, en almacenamiento local | Tema claro, oscuro o del sistema | Hasta que la borres. Sin caducidad | Preferencia |
| `lattiz-onboarding-dismissed` | El panel, en almacenamiento local | Recordar que cerraste la guía de inicio | Hasta que la borres. Sin caducidad | Preferencia |
| `lattiz-onboarding-panel-collapsed` | El panel, en almacenamiento local | Recordar si el panel de avance está plegado | Hasta que la borres. Sin caducidad | Preferencia |
| `lattiz.editor.advancedStyles` | El panel, en almacenamiento local | Recordar si el editor muestra estilos avanzados | Hasta que la borres. Sin caducidad | Preferencia |
| `lattiz.planChangeReturnTo` | El panel, en almacenamiento de la pestaña | Volver a la ruta anterior después de cambiar de plan. Se borra al usarla | Muere con la pestaña | Funcional |

## 5. Sitios de los clientes

5.1 El servidor de esos sitios no pone cookies en el código revisado. El aviso de medición no es una cookie: es un recuadro en la página.

5.2 Ese recuadro solo existe si el sitio lleva medición de visitas: plan Pro, suscripción vigente y medición lista. No aparece en la prueba gratuita ni en Básico.

| Nombre o clave | Quién la pone | Para qué | Duración | Categoría |
|---|---|---|---|---|
| `lz_consent` | El aviso del propio sitio, en almacenamiento local | Guardar si el visitante aceptó o rechazó la medición, y la hora | 365 días. Si el navegador bloquea el almacenamiento, la elección no se guarda y el aviso vuelve | Consentimiento |
| `_ga` y cookies afines | Google, solo después de Aceptar | Medir visitas del sitio Pro | La define Google. Lattiz no la fija | Medición |

5.3 `lz_consent` solo existe si el sitio lleva esa medición. Guarda `granted` o `denied`.

## 6. Vistas previas de plantillas

6.1 La aplicación de vistas previas no escribe almacenamiento local, almacenamiento de pestaña ni cookies. Las páginas cargan fuentes de Google. No hay un aviso de cookies. Son demostraciones y piden a los buscadores que no las indexen.

| Nombre o clave | Quién la pone | Para qué | Duración | Categoría |
|---|---|---|---|---|
| Ninguna en el código de esa aplicación | — | — | — | — |

## 7. Cookies y recursos de terceros

7.1 Además de las tablas, estos recursos se cargan de verdad:

- **Pago.** El panel te manda a la página de Stripe. Stripe puede poner sus cookies ahí. No las pone el panel.
- **Medición del plan Pro.** Tras Aceptar, el sitio pide el medidor en `www.googletagmanager.com`. De ahí salen las cookies de la cláusula 5. Las señales publicitarias y la personalización de anuncios van apagadas en la configuración que envía el sitio.
- **Fuentes.** Las plantillas vigentes cargan hojas de `fonts.googleapis.com` y archivos de `fonts.gstatic.com`. En un sitio de pago y en las vistas previas eso ocurre sin esperar un aviso. En la prueba gratuita las fuentes también pueden cargarse. En `lattiz.app` las fuentes salen del propio sitio.
- **Mapas.** La sección de ubicación puede incrustar un mapa de `www.google.com`. En un sitio de pago se carga sin esperar el aviso de medición. En la prueba gratuita ese mapa no se carga.
- **Enlaces que no cargan hasta el clic.** WhatsApp (`wa.me`), Instagram, Facebook y reseñas de Google. No hay reproductor de YouTube ni de Vimeo en las plantillas vigentes.
- **Imágenes del sitio.** Se sirven desde el almacenamiento de Lattiz (en `assets.lattiz.app` cuando el origen es ese almacenamiento).

7.2 No usamos un banco de fotos de un tercero ni un inicio de sesión con redes sociales.

## 8. Qué consentimiento existe, y dónde

8.1 En `lattiz.app` no hay aviso de cookies. La medición agregada de visitas carga con el sitio.

8.2 En el panel no hay aviso de cookies. Lo que se guarda es necesario para entrar o es una preferencia del propio panel.

8.3 En el sitio del cliente, el aviso con Aceptar y Rechazar solo aparece cuando se inserta la medición del plan Pro. Google solo se pide si la persona acepta. Si rechaza, el medidor no se carga. La elección dura 365 días en ese dominio. El aviso no incluye hoy un enlace a esta política ni al Aviso de Privacidad, ni un control para cambiar la elección después.

8.4 Las fuentes de Google y, en el sitio de pago, el mapa se cargan sin esperar ese aviso. No hay un segundo aviso para esos recursos.

8.5 En las vistas previas no hay aviso. Se cargan las fuentes de Google.

8.6 No afirmamos un centro de preferencias ni un enlace de “configurar cookies” en el pie de estas páginas. No existe en el producto hoy.

## 9. Cómo gestionarlas en el navegador

9.1 Puedes bloquear o borrar cookies y datos de sitios desde la configuración de tu navegador. El camino exacto depende del navegador (por ejemplo, privacidad o datos de sitios).

9.2 Si borras `lz_consent` en un sitio de cliente, el aviso de medición vuelve a mostrarse, siempre que ese sitio siga en Pro con medición activa.

9.3 Si borras el almacenamiento del panel, se restablecen el tema, la guía y la preferencia de estilos. Si cierras la pestaña, se acaba la sesión del panel.

9.4 Si bloqueas por completo el almacenamiento, puede que no puedas entrar al panel o que el aviso de medición se repita en cada visita.

9.5 Las cookies que pone Stripe en su página, o Google después de una aceptación, se gestionan en el navegador o con las herramientas de esos proveedores. Lattiz no las borra desde el panel.

## 10. Sitios de los clientes: quién responde

10.1 Tú eres responsable del contenido de tu sitio y de informar a tus visitantes. Lattiz aloja el sitio y, si tienes Pro, inserta el aviso y el medidor como dicen los Términos.

10.2 Lattiz responde por las cookies y el almacenamiento de `lattiz.app` y del panel. En el sitio del cliente, Lattiz pone `lz_consent` y carga el medidor solo después de Aceptar. Las fuentes, el mapa y los enlaces salen de la plantilla que publicas.

10.3 Si un visitante quiere ejercer derechos sobre el alojamiento o sobre la medición que opera Lattiz, el canal está en el Aviso de Privacidad. Si la solicitud es sobre el contenido del negocio, le corresponde a ese negocio.

## 11. Cambios

11.1 Si cambia lo que guardamos o lo que cargan los sitios, actualizaremos esta política en `https://lattiz.app/cookies` y la fecha de arriba. Si el cambio es relevante para tu cuenta, te avisaremos por correo o con un aviso en el panel.

## 12. Contacto

12.1 Contacto general, privacidad y asuntos legales: `contacto@lattiz.app`. Soporte del panel: `soporte@lattiz.app`.

12.2 El responsable es el indicado en el Aviso de Privacidad.
