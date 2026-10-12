# Negocio en texto libre → giro

La fuente de verdad son los `aliases` de `pnpm lattiz giro list --json`; esta tabla agrega los casos
dudosos y el ajuste que hay que hacer en el spec.

| Pedido                                                                                                                                   | Giro          | Ajuste en el spec                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| taquería, tacos al pastor, birria, pozolería, antojitos, cenaduría                                                                       | `restaurante` | menú en `services.prices` (órdenes, kilos, tortillas extra), horario nocturno, tono `calm`; paleta cálida (terracota, talavera, jamaica)   |
| cafetería, café de especialidad, panadería, repostería                                                                                   | `restaurante` | menú de bebidas/pan, horario de mañana, fotos de barra y pan                                                                               |
| marisquería, cocina económica, fonda, comida corrida, pizzería                                                                           | `restaurante` | precios por platillo/paquete del día                                                                                                       |
| bar, cantina, mezcalería                                                                                                                 | `restaurante` | sin promociones de alcohol agresivas; «consumo responsable» en faq                                                                         |
| consultorio médico, pediatra, ginecóloga, nutrióloga, psicóloga, fisioterapia, laboratorio                                               | `clinica`     | especialidad en `team.members[].role`; sin promesas de salud                                                                               |
| dentista, ortodoncia, odontopediatría                                                                                                    | `dental`      |                                                                                                                                            |
| estética, salón de belleza, spa, uñas, pestañas, maquillaje, barbería unisex                                                             | `estetica`    | barbería solo de caballeros → `barberia`                                                                                                   |
| barbería, barber shop                                                                                                                    | `barberia`    |                                                                                                                                            |
| florería, arreglos, eventos florales, vivero                                                                                             | `floreria`    |                                                                                                                                            |
| contador, despacho contable, asesoría fiscal, nómina                                                                                     | `despacho`    |                                                                                                                                            |
| abogado, despacho jurídico, notaría (sin fe pública)                                                                                     | `despacho`    | reescribe `services`, `faq`, `about`, `hero` a jurídico; `"demoProfile": { "category": "legal" }`; `business.tagline: "Despacho jurídico"` |
| boutique, tienda de ropa, zapatería, accesorios, regalos, papelería, decoración, artesanías, tienda de catálogo con pedidos por WhatsApp | `tienda`      | productos en `services.products` (6, con `href` `{{whatsappUrl:Hola, quiero …}}`)                                                          |
| gimnasio, crossfit (no uses la marca: «entrenamiento funcional»), yoga, pilates, box, spinning, danza, artes marciales                   | `gimnasio`    | yoga/pilates: paleta clara (`cal`, `cancha`), tono calmado; box/funcional: oscuras                                                         |
| veterinaria, estética canina, hotel de mascotas                                                                                          | `veterinaria` | estética canina sola: servicios de baño/corte, quita consultas                                                                             |
| hotel, escuela, taller mecánico, inmobiliaria, fotógrafo, tintorería…                                                                    | **ninguno**   | dilo; propone el más cercano (taller → `tienda` no sirve; mejor «giro nuevo») y no improvises                                              |

## Tono → paleta y tipografía

Lee `mood` en `giro show`. Guía rápida:

| Tono pedido                      | Paleta                                        | Tipografía                                                                  |
| -------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------- |
| tradicional, familiar, de barrio | clara cálida (terracota, durazno, arena)      | serif cálida (`young-serif+figtree`, `fraunces+nunito-sans`)                |
| moderno, minimalista             | clara fría (papel, nube, cielo)               | sans moderna (`sora+inter`, `bricolage-grotesque+inter`)                    |
| elegante, premium                | oscura con acento oro/durazno o clara champán | serif fina (`cormorant-garamond+work-sans`, `bodoni-moda+karla`)            |
| juvenil, urbano, enérgico        | oscura con acento vivo (lima, naranja, cian)  | condensada/ancha (`anton+space-grotesk`, `unbounded+manrope`, `syne+karla`) |
| confianza, profesional           | marino, verde inglés, salvia                  | `libre-baskerville+source-sans-3`, `instrument-serif+instrument-sans`       |

Si la combinación ideal no está `free`, toma la siguiente libre del mismo `mood` y menciónalo.
