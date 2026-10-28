# Negocio en texto libre → giro

La fuente de verdad son los `aliases` de `pnpm lattiz giro list --json`; esta tabla agrega los casos
dudosos y el ajuste que hay que hacer en el spec.

| Pedido                                                                                                                                   | Giro               | Ajuste en el spec                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| taquería, tacos al pastor, birria, pozolería, antojitos, cenaduría                                                                       | `restaurante`      | menú en `services.prices` (órdenes, kilos, tortillas extra), horario nocturno, tono `calm`; paleta cálida (terracota, talavera, jamaica)   |
| cafetería, café de especialidad, panadería, repostería                                                                                   | `restaurante`      | menú de bebidas/pan, horario de mañana, fotos de barra y pan                                                                               |
| marisquería, cocina económica, fonda, comida corrida, pizzería                                                                           | `restaurante`      | precios por platillo/paquete del día                                                                                                       |
| bar, cantina, mezcalería                                                                                                                 | `restaurante`      | sin promociones de alcohol agresivas; «consumo responsable» en faq                                                                         |
| consultorio médico, pediatra, ginecóloga, nutrióloga, psicóloga, fisioterapia, laboratorio                                               | `clinica`          | especialidad en `team.members[].role`; sin promesas de salud                                                                               |
| dentista, ortodoncia, odontopediatría                                                                                                    | `dental`           |                                                                                                                                            |
| estética, salón de belleza, spa, uñas, pestañas, maquillaje, barbería unisex                                                             | `estetica`         | barbería solo de caballeros → `barberia`                                                                                                   |
| barbería, barber shop                                                                                                                    | `barberia`         |                                                                                                                                            |
| florería, arreglos, eventos florales, vivero                                                                                             | `floreria`         |                                                                                                                                            |
| contador, despacho contable, asesoría fiscal, nómina                                                                                     | `despacho`         |                                                                                                                                            |
| abogado, despacho jurídico, notaría (sin fe pública)                                                                                     | `despacho`         | reescribe `services`, `faq`, `about`, `hero` a jurídico; `"demoProfile": { "category": "legal" }`; `business.tagline: "Despacho jurídico"` |
| boutique, tienda de ropa, zapatería, accesorios, regalos, papelería, decoración, artesanías, tienda de catálogo con pedidos por WhatsApp | `tienda`           | productos en `services.products` (6, con `href` `{{whatsappUrl:Hola, quiero …}}`)                                                          |
| gimnasio, crossfit (no uses la marca: «entrenamiento funcional»), yoga, pilates, spinning, danza                                         | `gimnasio`         | yoga/pilates: paleta clara (`cal`, `cancha`), tono calmado; box/funcional: oscuras                                                         |
| box, boxeo, muay thai, MMA, jiu-jitsu (BJJ), karate, taekwondo, kickboxing, lucha, dojo, artes marciales                                 | `academia-combate` | agresiva: `neon-nocturno` (oscura); dojo familiar/infantil: `tinta-papel` (clara)                                                          |
| veterinaria, estética canina, hotel de mascotas                                                                                          | `veterinaria`      | estética canina sola: servicios de baño/corte, quita consultas                                                                             |
| hotel, escuela, taller mecánico, inmobiliaria, fotógrafo, tintorería…                                                                    | **ninguno**        | dilo; propone el más cercano (taller → `tienda` no sirve; mejor «giro nuevo») y no improvises                                              |

## Dirección y arquetipo (catálogo extended, `layout`)

Una dirección fija paleta, tipografía, estilos, primitivos, portadas y voz. Prefiere la que el giro
**todavía no usa** (`giro show` › `directions[].used`) y que va con el tono:

| Tono pedido                        | Dirección           | Arquetipo       | Giros donde encaja                                        |
| ---------------------------------- | ------------------- | --------------- | --------------------------------------------------------- |
| de autor, editorial, pausado       | `cantera-editorial` | editorial       | despacho, restaurante, florería, estética                 |
| nocturno, urbano, con actitud      | `neon-nocturno`     | bold / showcase | barbería, gimnasio, academia de combate, taquería, tienda |
| amable, familiar, suave            | `jardin-suave`      | soft / booking  | estética, veterinaria, florería, dental                   |
| preciso, minimalista, monocromo    | `tinta-papel`       | minimal / trust | despacho, tienda, consultorio, barbería, dojo familiar    |
| cálido, de mostrador, hecho a mano | `terracota-calida`  | catalog         | fonda, florería, tienda, estética                         |
| confianza premium, clínico         | `marmol-sobrio`     | trust / booking | clínica, dental, despacho, veterinaria                    |

Dos plantillas del mismo giro no comparten dirección **y** arquetipo; si el giro ya usa la ideal,
toma la siguiente con el mismo tono y dilo en la entrega.

## Tono → paleta y tipografía (specs sin dirección)

Lee `mood` en `giro show`. Guía rápida:

| Tono pedido                      | Paleta                                        | Tipografía                                                                  |
| -------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------- |
| tradicional, familiar, de barrio | clara cálida (terracota, durazno, arena)      | serif cálida (`young-serif+figtree`, `fraunces+nunito-sans`)                |
| moderno, minimalista             | clara fría (papel, nube, cielo)               | sans moderna (`sora+inter`, `bricolage-grotesque+inter`)                    |
| elegante, premium                | oscura con acento oro/durazno o clara champán | serif fina (`cormorant-garamond+work-sans`, `bodoni-moda+karla`)            |
| juvenil, urbano, enérgico        | oscura con acento vivo (lima, naranja, cian)  | condensada/ancha (`anton+space-grotesk`, `unbounded+manrope`, `syne+karla`) |
| confianza, profesional           | marino, verde inglés, salvia                  | `libre-baskerville+source-sans-3`, `instrument-serif+instrument-sans`       |

Si la combinación ideal no está `free`, toma la siguiente libre del mismo `mood` y menciónalo.
