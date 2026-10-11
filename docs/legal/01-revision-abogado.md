# Paquete de revisión para el abogado

Versión de trabajo del 2026-10-11. Textos candidatos en `docs/legal/final/`. No es un consejo jurídico. Cada afirmación de hecho sale del inventario `docs/legal/00-hechos-del-sistema.md` o de una posición de negocio ya dada. Donde el código y el resumen de negocio no coinciden, el texto sigue al código.

## 1. Cómo se armó cada documento

**Términos y Condiciones.** Se redactó desde cero, con estructura clásica de un SaaS de sitios para pequeños negocios. No había borrador que conservar. Cada conducta del sistema apunta a una fila confirmada del inventario. Los precios de Básico y Pro no se escribieron: se remite a lattiz.app, porque cambian. La cuota de dominio sí se cita ($599.00 MXN más IVA). La prueba no fija días: “la que indique la plataforma”. La aceptación es por uso, porque al crear la cuenta no se guarda fecha ni versión. La compra de dominio sí guarda fecha y tipo de acuerdo. El anexo de encargo cubre a los visitantes y usa los mismos hechos que el aviso.

**Aviso de Privacidad.** Aviso integral más anexo simplificado (cuenta y visitante). Tabla de roles: Lattiz responsable de la cuenta y encargado de los visitantes. Inventario solo con categorías reales. No hay finalidades secundarias: el producto no tiene boletín ni marketing, y el texto lo dice. No se incluyó la divulgación “Limited Use” de Google: no hay acceso con Google del usuario; la analítica usa credencial de Lattiz. Los plazos de derechos se dejaron como “los que establece la legislación aplicable”, sin días ni números de artículo. La eliminación distingue lo que el panel borra y lo que queda en Stripe, Google, archivos, registrador y correos.

**Política de Cookies.** Inventario por superficie (landing, panel, sitios de clientes, vistas previas) con la clave, quién la pone, para qué, duración y categoría. La landing se describió con el hecho ya verificado: sin cookies propias ni `localStorage` en el código revisado, fuentes propias, sin aviso, y Vercel Analytics como medición agregada (la frase “sin cookies de seguimiento” es del proveedor y queda para verificar). El aviso con Aceptar y Rechazar existe solo en sitios Pro, y el medidor no carga antes de aceptar. Fuentes y mapas de los sitios de pago cargan sin ese aviso. No se afirma un banner donde no hay.

## 2. Aclaraciones de negocio incorporadas

- **Dominio gestionado.** Lattiz es titular y registrante. El cliente tiene un derecho de uso mientras el plan y la cuota estén al corriente. Términos 1.5, 7.1, 7.2 y anexo A. No se eligió la figura civil (comodato, licencia o mandato): ver la tabla de la sección 3.
- **Primer año, un dominio, según el plan.** Términos 7.3. Extensiones `.com`, `.com.mx`, `.mx`, `.net`, `.org`. Topes en dólares del registrador no se publicaron; se dice que la disponibilidad depende del plan.
- **Cuota desde el año 2.** Términos 7.5. Aviso y pago 28 días antes, enlace de 30 minutos, solo tarjeta, plan activo, sin cargo automático, no reembolsable. Avisos a 28, 14, 7, 3, 1 y 0 días, y a los 7 de atraso.
- **Impago de la cuota.** Términos 7.6. Al vencer, el sitio sale de línea también en la dirección de Lattiz. 15 días naturales para pagar. Después se borra la zona DNS, el uso por la plataforma se pierde y el sitio vuelve a la dirección de Lattiz. El nombre sigue registrado a nombre de Lattiz hasta que venza en el registrador. El correo asociado se describió como lo que dependa de esos registros DNS, y deja de funcionar cuando la zona se borra (a los 15 días), no el mismo día del vencimiento. El resumen de negocio decía que el correo cae al vencer; el código borra el DNS después. El texto sigue al código.
- **Sin traspaso.** Términos 7.8 y 15.2. No se inventaron opciones de salida. Cualquier excepción, caso por caso y por escrito. La decisión de si habrá opciones está en la sección 4, no en el clausulado.
- **Dominio propio.** Términos 7.1 y 7.7. Sigue siendo del cliente. Lattiz solo lo conecta.
- **Compra de dominio definitiva.** Términos 7.4. No se cancela, no se modifica y no se reembolsa.
- **Analítica al bajar, cancelar o suspender.** Términos 8.3 y 8.4. Deja de medirse y de verse en el panel. Lo ya recogido se queda en la cuenta de Google de Lattiz. Se piden 14 meses al crear la propiedad; si el ajuste falla, la propiedad igual queda. Al volver a Pro se reutiliza. Al eliminar la cuenta no se borra en Google (términos 8.5 y 15.4; aviso 10.4).
- **Plantilla Pro al bajar.** Términos 9.1. Hay que confirmar. En la fecha se bloquean cargar, guardar, subir y publicar. El sitio publicado sigue. Las ediciones no se borran: se bloquean. Sin restauración automática.
- **Planes.** Términos 6. Pago por adelantado, renovación automática, IVA incluido en el precio publicado. Subir de plan al momento, con cargo proporcional. Bajar al final del periodo, mismo intervalo. Cancelar al final del periodo pagado. Reembolsos: marcador de negocio.
- **Pagos fallidos.** Términos 6.7. Al tercer aviso se cancela en ese momento. No hay días de gracia propios. Entre intentos, el sitio público sigue en línea y el panel ya no deja publicar. El tiempo entre intentos lo pone Stripe, y no se fijó un número de días.

## 3. Puntos para el abogado

Formulación prudente en el texto, en lugar de dejar un hueco. La pregunta es lo que hay que confirmar o reescribir.

| Cláusula | Tema | Hecho (ID) | Pregunta |
|---|---|---|---|
| Aviso 15.1; este paquete | Ley aplicable | Lattiz es un particular. El inventario no cita leyes | Confirmar que rige la LFPDPPP (texto DOF 20-mar-2025) y su regulación secundaria, y que la autoridad es la Secretaría Anticorrupción y Buen Gobierno. La LGPDPPSO es de sujetos obligados del sector público y no se citó como aplicable en los tres documentos. Si el nombre de la autoridad cambió, corregir el aviso 15.1 |
| Aviso 9.3, 10.7, 11.2, 15.1 y anexo | Plazos ARCO, revocación y aviso de incidente | ARC-1, ARC-3: no hay expediente ni plazo operativo | El texto dice “dentro de los plazos que establece la legislación aplicable”, sin días ni “hábiles” o “naturales”. Insertar el cómputo correcto del texto 2025, o dejar la fórmula si basta |
| Aviso 6.1, 6.4, 6.5, 6.7 y 7 | Remisión, transferencia y tratamiento fuera de México | PRO-1 a PRO-10 | ¿La tabla de proveedores califica bien como remisión a encargados? ¿Stripe, sobre la tarjeta que recoge en su página, es encargado o responsable propio? ¿La frase del aviso 7.2 (el cliente “conoce” el tratamiento en el extranjero) es base suficiente, o hace falta un consentimiento distinto de la transferencia? No se afirmó país salvo Oregón (Supabase) y la UE (interfaz de Openprovider) |
| Aviso 2.3 y 8; Términos 8 y anexo A | Encargado o responsable en Google Analytics | ANA-1, ANA-2, ANA-9 | La propiedad se crea en la cuenta de Google de Lattiz, con credencial de Lattiz, no con permiso del usuario. Para el visitante, el texto trata a Lattiz como encargado del cliente. ¿Lattiz es además responsable frente a Google por ser dueño de la propiedad? ¿Quién aceptó las condiciones de Google? No está en el código |
| Aviso 8.2 | “Limited Use” de Google | AUT-5, ANA-9, PRO-11 | No se incluyó esa divulgación. Solo hay APIs de administración y de datos de Analytics con credencial de Lattiz. No hay OAuth del usuario ni Facebook ni Apple en la aplicación. Confirmar que la política de datos de usuario de Google no obliga al párrafo Limited Use. Si el panel de Auth tuviera Google encendido (AUT-4, desconocido), el texto queda corto |
| Términos 7.1 y 7.8; Aviso 3.1 | Figura del dominio “en uso” y salida | DOM-1, DOM-2, DOM-8, DOM-9 | El texto dice que Lattiz es titular y registrante y que el cliente tiene un derecho de uso. No dice comodato, licencia ni mandato. No hay traspaso en el código. La salida inventada no se escribió: solo “excepción caso por caso, por escrito”. Elegir la figura y si esa frase basta. Las opciones de salida las debe decidir el negocio (sección 4); no están en el texto |
| Términos 2.5, 6.1, 16, 17 y 18 | Contrato de adhesión y consumidor | Clientes que pueden ser personas físicas. Renovación automática en 6.1. Cambios unilaterales en 18 | ¿Hace falta mención expresa a PROFECO, registro de contrato de adhesión, o un formato de consentimiento de la renovación automática? La cláusula 2.5 dice que no se renuncia a un derecho irrenunciable. ¿Alcanza? |
| Términos 16 y 17 | Tope de responsabilidad e indemnidad | No hay nivel de servicio (cláusula 13; no existe en el producto) | El tope propuesto es lo pagado en el periodo inmediato anterior, sin limitar lo que la ley no deje limitar ni los derechos del consumidor. La indemnidad es “en la medida que la ley lo permita”, con aviso de la reclamación. ¿Son exigibles frente a una persona física? |
| Términos 2.2 y 2.3 | Prueba de la aceptación electrónica | AUT-6 no implementado. DOM-3 y DAT-4 sí en la compra del dominio | El texto no dice que al crear la cuenta se guarda fecha y versión: dice que el uso implica aceptación. En el dominio sí hay casilla, fecha y tipo de acuerdo. Los enlaces de esa casilla apuntan hoy a `https://www.lattiz.app/privacy` y `/terms` (con `www`); los textos se publicarán en `https://lattiz.app/...` sin `www`. Esas páginas aún no existen |
| Términos 10.3 y 14.1 | Contenido publicado y retirada | No hay procedimiento de notice-and-takedown en el código | Se dijo que Lattiz puede suspender o dejar de publicar, avisa cuando puede, y no opera un procedimiento formal con plazos propios. ¿Hace falta un conducto y un plazo para reclamaciones de terceros? |
| Aviso 1.1; Términos 2.1 | Identidad del responsable | El inventario no trae razón social, RFC ni domicilio | Los tres datos son marcadores. Confirmar si el responsable es una persona física, los cofundadores o una sociedad. Un encargo de trabajo anterior mencionaba una SAS prevista; el inventario no lo confirma y el texto no lo afirma |
| Aviso 12, fila de comprobantes | Plazo fiscal | COB-11: no hay CFDI. DAT-8: campos fiscales de Stripe, desconocidos. DEL-4: Stripe no se borra con la cuenta | El texto dice que lo fiscal se guarda “el tiempo que exijan las disposiciones fiscales aplicables”, sin años. Definirlo con el contador. El panel pide la factura a `soporte@lattiz.mx`; el soporte del producto es `soporte@lattiz.app`. El texto no fija el `.mx`: dice “el correo que indica el historial de pagos” |
| Cookies 7 y 8; Términos anexo A.3 | Consentimiento en sitios de clientes | ANA-5, CK-9, CK-12, VIS-2 | El medidor espera Aceptar. Fuentes de Google y el mapa del sitio de pago cargan antes, sin aviso. No hay forma de retirar la elección en la página (solo borrar `lz_consent`, 365 días). ¿Ese estándar alcanza para el sitio del cliente? ¿El encargado (Lattiz) o el responsable (el cliente) debe informar las fuentes y el mapa? |
| Aviso 9.3 | Acreditación y gratuidad | ARC-1: no hay módulo | Fórmula usada: escribir desde el correo de la cuenta o dar datos que permitan comprobar la identidad. Ejercicio gratuito, sin excepción por solicitudes excesivas. ¿Hace falta la excepción legal de solicitudes repetidas? |
| Términos 10.4 | Licencia sobre el contenido | DEL-4: imágenes y otros datos sobreviven a la cuenta | La licencia dura mientras exista la cuenta y, sobre lo que no se borra, hasta que salga de esos sistemas. ¿El alcance (alojar, reproducir, mostrar, copias técnicas) es el mínimo correcto? |
| Términos 14.3 | Cláusula que sobrevive | Redacción habitual | Si una cláusula cae, las demás siguen. Si no se exige un incumplimiento, no hay renuncia. Confirmar que conviene dejarlas |
| Términos 18.2 y 18.3; Aviso 14; Cookies 11 | Aviso previo de cambios y de precios | COM-1: no hay correo de “cambiaron los términos” | Compromiso de aviso por correo o en el panel antes de un cambio relevante, y de que un precio nuevo aplica al periodo siguiente. Seguir usando la plataforma después de la fecha se trata como aceptación. No hay registro de esa nueva aceptación (mismo hueco que AUT-6) |
| Términos 6.8 | Reembolsos | COB-10: no hay lógica de reembolso | No se cerró la política. Quedó el marcador. La cuota y la compra del dominio sí se dicen no reembolsables, porque el sistema las marca irreversibles |
| Cookies 3.2 | Vercel Analytics | Hecho adicional de la landing; CK-14 estaba desconocido y este encargo lo acotó | Se llamó “medición agregada de visitas”. La ausencia de cookies de seguimiento es declaración del proveedor, no una prueba nuestra. Verificar en la documentación vigente de Vercel antes de publicar |
| Aviso 11 | Seguridad que sí se afirmó | SEG-1 a SEG-5 | Solo HTTPS, acceso firmado, aislamiento por cuenta, credenciales privilegiadas en el servidor y firma de los avisos de cobro. No se afirmó bloqueo de contraseñas filtradas: el revisor de la base lo marcó apagado (SEG-6). No hace falta describir el hueco en el aviso; no conviene afirmar ese control |
| Aviso 13 | Menores | MEN-1 no implementado | No se dijo que hay control de edad. El servicio no está dirigido a menores y, si se sabe de una cuenta de un menor sin autorización de padre, madre o tutor, se eliminará. Confirmar si hace falta un umbral de edad |
| Términos 5.5 | Prueba otra vez después de cancelar | Desviación: plan `none` puede volver a tener prueba | El texto lo dice, porque el código lo hace. Si la regla de negocio es la contraria, hay que cambiar el código y luego esta cláusula |
| Términos 7.6 | “Perdida definitiva” del dominio | DOM-7 | Para el cliente el uso se pierde y no hay reactivación en el panel. El registro sigue a nombre de Lattiz hasta que el registrador lo suelte, sin pagar recargos. Confirmar que no prometemos de más ni de menos |
| Aviso 4.2 | Sin finalidades secundarias | COM-1, COM-6 | Correcto frente al código. COM-6 deja abierto un boletín fuera de este repositorio (panel de Auth o del correo). Si existe, el aviso está mal |

## 4. Decisiones de negocio pendientes

Cada marcador distinto. El mismo texto se repite a propósito, para sustituirlo de una pasada.

| # | Marcador | Dónde |
|---|---|---|
| 1 | Resuelto el 2026-10-11: 12 de octubre de 2026 | Términos, encabezado. Aviso, encabezado. Cookies, encabezado |
| 2 | Resuelto el 2026-10-11: Carlos Abad García Pérez (persona física, según su constancia de situación fiscal) | Términos 2.1. Aviso 1.1. Aviso, anexo simplificado (cuenta) |
| 3 | Resuelto el 2026-10-11: el de la constancia de situación fiscal | Términos 2.1. Aviso 1.1 |
| 4 | Resuelto el 2026-10-11: domicilio fiscal de la constancia (Poza Rica de Hidalgo, Veracruz) | Términos 2.1. Aviso 1.1, 16.2 y anexo simplificado (cuenta) |
| 5 | Resuelto el 2026-10-11: contacto@lattiz.app | Términos 15.1, 21.1 y anexo A.4. Aviso 1.2, 9.2, 10.1, 16.1 y anexo (cuenta y visitante). Cookies 12.1 |
| 6 | Resuelto el 2026-10-11: Poza Rica de Hidalgo, Veracruz (domicilio del responsable; pendiente de confirmar con el abogado) | Términos 20.2 |
| 7 | Resuelto el 2026-10-11: los pagos no son reembolsables, salvo lo que exija la ley | Términos 6.8 |

Decisión aparte, sin marcador en el texto porque no se inventó una opción: **salida del dominio gestionado.** El negocio indicó no ofrecer el traspaso y no dio alternativas (liberar el nombre, recomprarlo, traspaso excepcional). El texto solo admite una excepción por escrito, caso por caso. Hay que elegir si esa es la política definitiva.

Correos en los textos: `contacto@lattiz.app` (contacto general, privacidad y asuntos legales) y `soporte@lattiz.app` (soporte del panel). `hola@lattiz.app` solo queda como dirección de respuesta de los avisos automáticos. Sigue desalineado `soporte@lattiz.mx` (factura en el panel). Conviene unificarlos.

## 5. Brechas producto y texto

Manejo elegido: el texto no promete lo que no existe. Recomendación de producto solo donde arreglarlo es barato y claramente mejor.

### No implementado

- **AUT-6.** No se dice que al crear la cuenta se guarda fecha y versión. Se dice que el uso implica aceptación (términos 2.2 y 2.3; aviso 5, consentimiento). Recomendación: guardar casilla, fecha y versión al crear la cuenta. Es barato y es la prueba que el contrato necesita.
- **SIT-3.** No se promete banco de fotos.
- **COB-10.** No hay reembolso automático. La compra de dominio se dice irreversible. La suscripción quedó en el marcador de la sección 4.
- **COB-11.** La factura fiscal es manual, fuera del sistema. No se promete CFDI.
- **DOM-3.** La casilla del dominio apunta a páginas que aún no existen, y con `www`. Publicar estos textos en las URL del producto (y alinear `www`) es el paso siguiente. El texto no da por hecho que ya están en línea.
- **DOM-9.** No se promete traspaso. Términos 7.8.
- **ANA-8.** No se dice que borrar la cuenta borra la propiedad de Google. Aviso 10.4 y términos 15.4. Borrarla de verdad conviene, pero no es un cambio de una línea; el texto ya no lo promete.
- **DEL-4.** Se listó lo que queda en Stripe, Google, archivos, registrador y bandeja de correos.
- **DEL-5.** No se promete exportación. Se dice que no hay descarga de toda la cuenta.
- **DEL-8 y ARC-1.** No hay expediente. El canal es el correo y la eliminación del panel. Recomendación: un buzón único y una nota mínima de la solicitud. Barato frente a no poder probar que se atendió.
- **MEN-1.** No se dice que hay control de edad.
- **RET-6.** No se inventó un plazo de tickets. El soporte por WhatsApp no se archiva (aviso 12).

Otras mejoras baratas, alineadas con lo que el texto ya admite que falta:

- **ANA-5.** El aviso del sitio no enlaza al aviso de privacidad ni deja cambiar la elección. Añadir el enlace y un control para retirarla.
- **BAJ-4.** El aviso en el panel, antes de bajar de plan, solo menciona la plantilla. Conviene mencionar también la analítica. El texto de los términos ya lo explica (8.4).
- **COM-5.** Unificar los correos de contacto. Barato y evita que el aviso y el panel digan cosas distintas.

### Desviaciones (el código manda)

- **Prueba tras cancelar.** Quien termina en plan sin suscripción puede recibir otra vez la prueba si no la usó o si la ventana sigue abierta. El texto lo dice (términos 5.5). Recomendación: si la regla de negocio es no dar prueba a quien ya fue cliente de pago, cerrar ese hueco en el código y borrar la cláusula. Parece acotado y evita prometer un beneficio no deseado.
- **Sin días de gracia en el cobro.** Tope de 3 avisos y cancelación. El sitio público sigue mientras Stripe marca el pago atrasado y el periodo no acabó; el panel ya no deja publicar. Términos 6.7. No se inventaron días.
- **Eliminar la cuenta no suelta el registro del dominio.** Se desconecta el sitio y se intenta borrar el DNS. El nombre sigue a nombre de Lattiz hasta que venza en el registrador. Términos 15.2 y 15.4.
- **Bajar de plan no borra las ediciones de la plantilla Pro.** Las bloquea y deja el sitio publicado. Al cambiar de plantilla hay una copia sin pantalla para restaurarla. Términos 9.1 y 9.2.
- **Duración de la prueba.** No se escribió 14 ni 3. Se remite a lo que indique la plataforma (términos 5.1). Lo sembrado en la base es 3; el respaldo de código, si faltara la fila, es 14.
- **Código de un solo uso.** No se fijó en 6 ni en 8 dígitos. Producción está en el panel de Auth (AUT-9).
- **Varias direcciones de contacto.** Se usaron `contacto@lattiz.app` y `soporte@lattiz.app`. No se copió `soporte@lattiz.mx`.

### Datos que el texto no afirma

Quedan fuera a propósito. Quien los confirme es el negocio, en el panel indicado por el inventario.

- **AUT-4.** Proveedores encendidos en Supabase Auth. El código solo ofrece correo.
- **AUT-9.** Caducidad real del acceso, del código y longitud mínima de contraseña.
- **DAT-8 y COB-14.** País de la cuenta de Stripe, campos del pago, impuestos y recibos por correo.
- **COB-3.** El inventario no copió todos los montos. Este encargo sí los verificó (Básico 449 / 4,490; Pro 699 / 6,990; IVA incluido) y pidió no imprimirlos en los términos.
- **SIT-2, PRO-6.** Si los archivos nuevos van al almacenamiento del proyecto o a R2, y la región del depósito.
- **DOM-10, PRO-4.** Cuenta y región de Cloudflare. El texto dice que el DNS gestionado puede ser Cloudflare o el registrador.
- **PRO-5, VIS-6, RET-2.** Región de Vercel, registros de IP y su plazo.
- **PRO-7.** Si el correo de producción es Resend. El texto dice “previsto”.
- **PRO-8, ANA-2.** Dueño de la cuenta de Google Analytics, quién aceptó las condiciones y la región.
- **PRO-10.** Dónde está el servidor de la API.
- **DEL-7, RET-4.** Copias de la base y ciclo de vida de los archivos.
- **ARC-3.** Quién lee el correo de privacidad y en qué plazo interno.
- **CK-10.** Duración exacta de las cookies de Google. El texto dice que la define Google.
- **VIS-7.** Si la vista previa antigua `medical-center` sigue publicada y carga otro tercero. No se mencionó en los textos.
- **COM-4 y COM-6.** Texto de los correos de Auth, y si hay una lista de marketing fuera de este repositorio.
- **CK-14, acotado.** La landing ya se describió con el hecho de este encargo. Falta verificar la declaración de Vercel sobre cookies.
