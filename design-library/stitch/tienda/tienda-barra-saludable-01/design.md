---
name: Barra saludable · Crema y oliva
colors:
  background: '#FFFDE6'
  surface: '#FFFDE6'
  surface-container-low: '#FBF8D2'
  surface-container-high: '#EFEAB8'
  on-background: '#26280F'
  on-surface: '#26280F'
  on-surface-variant: '#4F5128'
  outline: '#858040'
  outline-variant: '#D9D49A'
  primary: '#407B85'
  on-primary: '#FFFFFF'
  secondary: '#405C85'
  on-secondary: '#FFFFFF'
  tertiary: '#858040'
  on-tertiary: '#1B1C08'
typography:
  display-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 64px
    fontWeight: '800'
    lineHeight: 66px
  headline-md:
    fontFamily: Bricolage Grotesque
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 38px
  body-lg:
    fontFamily: DM Sans
    fontSize: 19px
    fontWeight: '400'
    lineHeight: 30px
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label-caps:
    fontFamily: DM Sans
    fontSize: 13px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.08em
rounded:
  sm: 12px
  DEFAULT: 20px
  lg: 28px
  full: 9999px
spacing:
  container-max: 1200px
  gutter: 24px
  section-gap: 96px
  stack-md: 20px
---

## Brand & Style

Barra de smoothies y snacks saludables en Polanco, CDMX. Fresca, luminosa, deportiva pero cálida: una barra de jugos moderna. Superficies cremosas, esquinas generosas, botones en cápsula, chips pequeños, tarjetas con sombra muy suave, fotos con esquinas redondeadas.

## Colors

Fondo crema #FFFDE6. Oliva #858040 solo para superficies, bandas, detalles y texto grande (sobre crema da ~4:1, no sirve para texto pequeño). Verde azulado #407B85 y azul #405C85 para texto de acento y botones (sobre crema ~4.7:1 y ~6.7:1). Texto principal oliva casi negro #26280F. Sobre una banda oliva usa texto oscuro #1B1C08 o crema según el contraste. Puedes proponer variantes cercanas de tono si el contraste AA (4.5:1) lo exige; el ánimo es claro, cremoso y natural. Para los sabores usa pequeñas barras o puntos de color: verde hoja, rojo frutos rojos, café cacao y azul espirulina.

## Typography

Titulares con carácter (como Bricolage Grotesque, peso 700–800) y cuerpo sans limpio (como DM Sans). Ejemplos de estilo, no lista cerrada: cualquier par similar de Google Fonts sirve. Exactamente dos familias, ambas de Google Fonts; nunca una tercera ni fuentes de íconos. Tamaño mínimo de cuerpo 14px.

## Layout

Cuadrícula de 12 columnas. Una página larga. Se permiten bento, elementos encimados y tarjetas apiladas.

## Hard constraints (Lattiz kit; estrictas para que el harvester pueda mapear el diseño)

- Sin degradados como fondo del texto principal; el texto siempre con contraste alto.
- Íconos solo SVG en línea: sin fuentes de íconos (ni Material Symbols ni Font Awesome).
- Estructura semántica por sección: header, hero (un h1), prueba social, servicios, testimonios, FAQ, CTA, contacto, footer. Cada sección con un id (hero, datos, menu, proceso, snacks, resenas, preguntas, cierre, contacto).
- Una sola columna en móvil.
- Sin formularios ni campos: el contacto es un botón de WhatsApp, un enlace de teléfono y uno de correo.
- Sin carruseles, sliders, video, iframes ni canvas.
- Sin marcas reales ni imágenes de personas reales identificables; toda imagen es un marcador reemplazable.
- Todo el copy en español de México (es-MX), tuteo, frases cortas, sin superlativos ni promesas de salud.
