# Rúbrica de revisión visual

Revisa cada captura de `.lattiz/review/<id>/` y responde cada punto con «bien» o con el cambio de spec
que lo arregla. Una plantilla está lista cuando no queda ningún punto marcado como **bloqueante**.

## Pliegue (bloqueante)

- **1366×768** (`laptop-1366x768.png`) y **390×844** (`movil-390x844.png`): se ven marca, titular
  completo, texto y el CTA principal sin scroll. Si el titular parte en 3+ líneas en móvil o empuja el
  CTA fuera: acorta `copy.hero.title`.
- Nada cortado ni encimado (texto sobre texto, botón fuera de la tarjeta, navbar tapando el hero).

## Jerarquía y aire

- Un solo foco por sección: título → apoyo → acción. Si todo pesa igual, sobra texto: recorta.
- Espacios regulares entre secciones; ninguna sección se siente vacía (pocas tarjetas en una
  retícula grande) ni apretada.
- Las cifras de `about.stats` y los precios se leen de un vistazo.

## Contraste y legibilidad

- El texto sobre foto o sobre el color de acento se lee bien (el check ya mide AA; aquí juzgas el
  conjunto). Los placeholders son temporales, pero la paleta debe verse bien con ellos.

## Coherencia

- Las búsquedas de imágenes (`images`) y los `alt` cuentan lo mismo que el copy (una taquería no
  muestra un restaurante de manteles largos).
- Los precios son verosímiles para la ciudad y el giro.
- El nombre del negocio y la colonia aparecen donde deben (navbar, hero/eyebrow, contacto, pie).

## «No genérico» (bloqueante para la Pro)

- Al tapar el logo, ¿se adivina el giro y algo del carácter del lugar? Si podría ser cualquier
  negocio, cambia el titular, el statement de about y elige otra paleta/tipografía `free` con más
  personalidad.

## Básico vs Pro

- **Básico no se ve barato:** tipografía cuidada, buen aire, fotos grandes, CTA claro. Si parece
  plantilla de constructor genérico, prueba otra variante de hero o la siguiente paleta libre.
- **Pro es memorable y claramente más rica:** más secciones (equipo, fotos, reseñas), Motion,
  identidad visual distinta a la Básica (`review.md` → «Gemela» lo resume). Si la diferencia no se
  nota en las capturas de 1440, dale a la Pro un hero `image-bg` u `offset-card` y un about
  `statement`.

## Crítica en la entrega

2–3 frases por plantilla: qué funciona, qué no y qué cambiarías con más tiempo. Sé específico
(«el titular en Anton ocupa 3 líneas en 390», no «se ve bien»).
