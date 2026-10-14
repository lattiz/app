# Guía de copy (es-MX)

## Voz

- **Tuteo**, español de México, frases cortas. Como habla el dueño del negocio con un cliente que
  entra por primera vez: claro, cálido, concreto. Nada de «¡Bienvenidos a nuestro sitio web!».
- **Concreto > adjetivos.** «Tortillas hechas a mano cada mañana» en lugar de «la mejor calidad».
  Un dato verificable por frase (horario, ingrediente, duración, qué incluye).
- **Sabor local sin cliché.** Menciona la colonia (`{{branch}}`) o la ciudad (`{{city}}`) una o dos
  veces, un platillo o costumbre del lugar si viene al caso (cochinita en Mérida, cabrito en
  Monterrey, chiles en nogada en temporada en Puebla). No sombreros, «ándale», ni folclor de postal.
- **Básico vs Pro.** La Básica es directa y útil (qué, cuánto, cómo pedir). La Pro cuenta un poco
  más de historia y personalidad, sin alargar el hero.

## Voz de la dirección (specs con `layout.direction`)

`pnpm lattiz direccion show <id> --json` › `voice` manda sobre la voz general de arriba en registro y
ritmo (p. ej. `tinta-papel` y `marmol-sobrio` hablan de usted; `neon-nocturno` va en frases de cartel).
Respeta `voice.rules` y nunca uses `voice.avoid`. El ejemplo (`headline`, `cta`) es de tono, no se
copia. El CTA es el mismo en toda la página (menú, portada, cierre y pie).

## Disciplina de longitud

Los límites exactos salen de `giro show` (`copy.<slot>.keys[].limit`). En la práctica:

| Clave                          | Ideal                                                | Por qué                                                                                                                        |
| ------------------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `hero.title`                   | 24–40 caracteres, 1 `<span class="lz-title__serif">` | el hero debe caber en 1366×768 con el CTA visible; las fuentes condensadas en mayúsculas (Anton, Archivo Black) aguantan menos |
| `hero.text`                    | 90–140                                               | 2–3 líneas en escritorio                                                                                                       |
| CTAs                           | 2–3 palabras                                         | «Agendar cita», «Pedir por WhatsApp»                                                                                           |
| `services.prices[].name`       | ≤ 30                                                 | tarjetas de 3 columnas                                                                                                         |
| `services.prices[].price`      | ≤ 12                                                 | «$450», «Desde $1,200», «$90/persona»                                                                                          |
| `faq.items[].answer`           | 1–2 frases                                           |                                                                                                                                |
| `testimonials.reviews[].text`  | 1–2 frases con un detalle concreto                   |                                                                                                                                |
| `hero.facts[]` (`hero/bento`)  | `value` ≤ 10, `label` ≤ 40; 2–3 datos                | cifras verificables marcadas «de ejemplo»; el 4.º no se muestra y en móvil no aparecen                                         |
| `hero.details[]` (`hero/rail`) | `label` ≤ 14, `value` ≤ 32; 2–3 filas                | ficha práctica: horario, dónde, cómo agendar                                                                                   |
| `cta.*` (rol `cta`)            | `title` ≤ 48, `text` ≤ 140, CTAs ≤ 24/18             | cierre de la página: una invitación y el mismo CTA de siempre                                                                  |

## Prohibido (el linter `--strict` lo detecta)

- Promesas y superlativos: «garantizado», «el/la mejor», «número uno», «100 % efectivo», «sin
  dolor», «resultados inmediatos», «antes y después», «baja de peso», «ganamos tu caso», «evita
  multas».
- Salud y derecho: no diagnósticos, curas ni resultados; cédulas `0000000`; urgencias → llamar/911.
- Datos reales: negocios, marcas (alimentos, cosméticos, gimnasios, bancos…), personas, teléfonos,
  cédulas. Reseñas inventadas con nombre + inicial («Mariana R.»).
- Contacto escrito a mano: usa `{{phone}}`, `{{phoneUrl}}`, `{{whatsappUrl:mensaje}}`, `{{email}}`,
  `{{emailUrl}}`, `{{address}}`, `{{city}}` (se vuelven tokens `{{lz:*}}` que el cliente llena).
- Relleno: «Lorem», «TODO», «[nombre]», «...».
- Texto de IA (avisos `muletilla`, `rayas`, `mayusculas`, `esqueleto`): «al siguiente nivel», «sin
  complicaciones», «experiencia única», «sumérgete», «más que un…», «tu mejor versión», «En el mundo
  de…»; más de una raya (—) por texto; MAYÚSCULAS sostenidas; Títulos En Mayúsculas De Título; tres
  frases seguidas que arrancan igual («Somos… Somos… Somos…»).

## Ejemplos por giro (titular · texto)

- **Restaurante (taquería, Querétaro):** «Tacos al pastor <span…>al carbón</span>, desde las 7 pm.» ·
  «Trompo, tortillas hechas a mano y salsas de molcajete. Pide por WhatsApp y pasa por tu orden.»
- **Clínica:** «Consultas <span…>sin prisa</span>, cerca de casa.» · «Tiempo para escucharte,
  estudios en el mismo lugar y seguimiento por WhatsApp.»
- **Dental (Mérida):** «Tu dentista en <span…>García Ginerés</span>.» · «Valoración con fotos y un
  plan por escrito con precios antes de empezar.»
- **Estética (Puebla):** «Tu rato para <span…>consentirte</span>.» · «Corte, color y uñas con calma;
  agenda por WhatsApp y llega a tu hora.»
- **Despacho contable (Monterrey):** «Tus cuentas <span…>en orden</span>, cada mes.» · «Contabilidad,
  declaraciones y nómina con un contador que te contesta.»
- **Despacho jurídico:** «Asesoría legal <span…>clara</span> para tu familia y tu negocio.» ·
  «Te explicamos opciones, tiempos y honorarios por escrito antes de empezar.»
- **Tienda (Guadalajara):** «Piezas elegidas <span…>una por una</span>.» · «Ropa y regalos de talleres
  locales; aparta por WhatsApp y recoge en la Americana.»
- **Gimnasio (León):** «Entrena con <span…>constancia</span>, no con prisa.» · «Grupos de 12, coaches
  que corrigen tu técnica y clases desde las 6 am.»
- **Veterinaria (CDMX):** «Cuidamos a tu mascota <span…>como familia</span>.» · «Consultas con tiempo,
  vacunas al día y baño con recordatorio por WhatsApp.»
- **Florería:** «Flores para cada <span…>ocasión</span>.» · «Ramos hechos a mano; pide por WhatsApp y
  entregamos el mismo día.»

## Reseñas, equipo, FAQ

- Reseñas: una situación concreta (cumpleaños, primera cita, urgencia de domingo) + un detalle
  (puntualidad, explicación, envoltura). Nunca «excelente servicio, 100 % recomendado».
- Equipo: nombre ficticio completo, rol corto, 2 etiquetas; en giros regulados la primera etiqueta es
  `Cédula 0000000`.
- FAQ: las 6 dudas que de verdad frenan la compra en ese giro (precio, cita, pago, cancelación,
  qué llevar, envíos/estacionamiento/niños/mascotas), con `¿` de apertura.
