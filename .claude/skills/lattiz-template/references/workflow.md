# Flujo detallado

## 1. Intake

Del pedido saca, y escribe como «Supuestos» en tu entrega:

| Dato                        | Si falta                                                                                                                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tipo de negocio             | **pregunta** (es lo único sin default)                                                                                                                                                                                                |
| Ciudad                      | CDMX                                                                                                                                                                                                                                  |
| Colonia (`business.branch`) | una colonia conocida y de clase media de esa ciudad (Querétaro: Centro Sur, Jurica; Monterrey: San Pedro, Cumbres; CDMX: Roma Norte, Narvarte, Coyoacán; Guadalajara: Americana, Providencia; Puebla: La Paz; Mérida: García Ginerés) |
| Tono                        | el del giro (`giro show` → `motion`, paletas por `mood`)                                                                                                                                                                              |
| Tiers                       | el par (`--twin`)                                                                                                                                                                                                                     |
| Nombre                      | propón uno ficticio, corto y pronunciable, que no sea de un negocio conocido (búsquedas mentales: ¿suena a cadena real? cambia)                                                                                                       |

Pregunta solo si el tipo de negocio es ambiguo entre dos giros que cambian el resultado (p. ej.
«clínica» dental o médica), o si piden algo que el kit no tiene. Máximo 2 preguntas cortas.

## 2. Giro

`giro list --json` → `aliases` y `references/giro-mapping.md`. Lee `giro show <giro> --json` una vez
y quédate con: `rules`, paletas/tipografías `free: true` con su `mood`, `tiers.*.defaultSections`,
`copy.<slot>.keys` (límites) y `heroAlternates`.

## 3. Spec

`spec init` genera el archivo con el copy del giro. Edítalo con Edit (no lo reescribas entero si no
hace falta). Checklist:

- [ ] `business`: `name`, `shortName` (≤ 14 caracteres, para el logo), `tagline`, `city`, `branch`,
      `address` (calle y número, colonia, ciudad; sin «Ejemplo»), `hours`, `phone`/`whatsapp` con
      `0000` y la lada local (CDMX 55, GDL 33, MTY 81, QRO 442, PUE 222, MÉR 999, LEÓN 477,
      TOL 722, TIJ 664, CUN 998, AGS 449, SLP 444, MOR 443, VER 229, OAX 951, CHIH 614, HMO 662,
      CUL 667), `email` `algo@<nombre>.mx`, `whatsappMessage`.
- [ ] `todo` borrado.
- [ ] `brand.palette.preset` y `brand.fontPair` con `free: true` y `mood` acorde (si ningún par del giro
      va con el tono, toma uno de `otherFontPairs` con `free: true`); `brand.shape` del giro. La Básica: el compilador le da la siguiente paleta libre; si quieres otra, ponla en
      `overrides.basico.brand`.
- [ ] `copy.hero`: `eyebrow` (`<Giro> · {{branch}}`), `title` con un `<span class="lz-title__serif">…</span>`
      en la palabra clave (≤ 40 ideal), `text` (≤ 150), CTAs.
- [ ] `overrides.basico.copy.hero.title` y `.text` propios (más directos que la Pro).
- [ ] `copy.about` (summary, statement, paragraphs, stats), `copy.services` (6 precios de ejemplo
      verosímiles para la ciudad, 2 promos con `{{whatsappUrl:mensaje}}`), `copy.team` (si el Pro lo
      usa), `copy.testimonials` (3 reseñas concretas, nombre + inicial), `copy.faq` (6 preguntas
      reales del giro), `copy.locations.contactText`, `copy.footer.about`, `copy.head.description`.
- [ ] Nada de `{{lz:*}}`, teléfonos, correos o direcciones escritos a mano en el copy.

## 4. Validar → compilar → checar

```
pnpm lattiz spec validate <stem> --strict --json   # errores = 0; avisos generico/repetido/acentos = 0 idealmente
pnpm lattiz build <stem> --json                    # code 0
pnpm lattiz check <idPro> --json                   # luego
pnpm lattiz check <idBásico> --json                # nunca a la vez
```

Cómo arreglar lo típico:

| Hallazgo                | Cambio en el spec                                                                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `longitud`              | acorta la clave indicada                                                                                                                        |
| `fit` FAIL en hero      | `copy.hero.title` más corto (≤ 32 si es Anton/Archivo en mayúsculas), luego `copy.hero.text`; si no, otra variante de hero en `sections.<tier>` |
| `fold` WARN             | `copy.hero.title` ≤ 28 caracteres con hero `offset-card` o `centered-arch` (no tienen encaje automático); o fija `hero` en `split`              |
| `overflow`              | palabras largas en `copy.<slot>`; o variante distinta                                                                                           |
| `contrast`              | otra paleta curada (`free: true`)                                                                                                               |
| `kit` `unique-headline` | otro `copy.hero.title` (o `copy.hero.alternates`)                                                                                               |
| `kit` `similarity`      | quita variantes fijadas; el compilador elige                                                                                                    |
| `motion` WARN           | normalmente se acepta; si una sección no anima, `motion.overrides`                                                                              |

Cuenta cada pasada validate→build→check como una iteración; a la 4.ª sin éxito, detente.

## 5. Revisión visual

`pnpm lattiz review <id>` (uno a la vez). Abre con Read, en este orden:
`laptop-1366x768.png`, `movil-390x844.png`, `escritorio-1440x900.png`; luego las de `secciones/`
que dudes. Evalúa con `review-rubric.md`. Corrige solo vía spec y vuelve a build → check → review del
id afectado. Máximo 2 rondas.

## 6. Entrega

Formato (breve, en español):

```
Listo: <idBásico> (Básico) y <idPro> (Pro), spec packages/template-kit/specs/<stem>.spec.json
Ver: pnpm lattiz dev <idPro>   ·   pnpm lattiz dev <idBásico>
Checks: Pro WARN (n), Básico WARN (n), 0 FAIL — WARN aceptados: …
Supuestos: …
Crítica: Pro — … · Básico — …
Publicar (cuando tú decidas): pnpm lattiz ship <idBásico> <idPro>
```

No hagas commit salvo que te lo pidan; si lo piden, commitea el spec y los archivos que el build
generó (`templates/`, `themes/`, `content/`, `demo-profiles/`, `assets/<giro>/<id>/`).
