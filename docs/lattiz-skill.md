# Skill `lattiz-template` (Claude Code)

## Cómo funcionan las skills en este repo (descubrimiento, Claude Code 2.1.296)

Fuente: <https://code.claude.com/docs/en/skills.md> (revisado el 2026-10-12) y las skills que ya
viven en `.claude/skills/` (`shadcn`, `supabase`, `grapesjs-studio-sdk`, …).

- **Dónde.** Las skills de proyecto son `.claude/skills/<nombre>/SKILL.md` y se commitean para que
  todo el equipo las tenga. En un monorepo se cargan desde el directorio de arranque y cada padre
  hasta la raíz del repo; una skill dentro de `<subdir>/.claude/skills/` se carga la primera vez que
  Claude lee o edita algo en ese subdirectorio. Este repo ya usa `.claude/skills/` en la raíz.
- **Frontmatter.** Empieza en la línea 1; todos los campos son opcionales y los desconocidos se
  ignoran. Los que usamos:
  - `name` (por defecto, el nombre de la carpeta) y `description` (qué hace y cuándo usarla: Claude
    la compara con cada pedido para invocarla sola; `description` + `when_to_use` se truncan a 1 536
    caracteres en el listado).
  - `argument-hint` (pista de autocompletado para `/nombre`).
  - `allowed-tools`: **pre-aprueba** herramientas durante el turno que invoca la skill (sin pedir
    permiso), p. ej. `Bash(pnpm lattiz *)`. **No restringe**: las demás siguen disponibles. Para
    quitar herramientas existe `disallowed-tools`.
  - Otros disponibles que no usamos: `disable-model-invocation`, `user-invocable`, `model`,
    `effort`, `context: fork` + `agent`, `paths`, `hooks`.
- **Archivos de apoyo.** Se referencian por ruta relativa desde `SKILL.md` (p. ej.
  `references/workflow.md`) y Claude los lee solo cuando los necesita (divulgación progresiva). La
  guía oficial: `SKILL.md` por debajo de 500 líneas, el detalle en archivos aparte.
- **Invocación.** `/lattiz-template una taquería en Querétaro` (el texto llega como `$ARGUMENTS`;
  si la skill no usa el marcador, se agrega como `ARGUMENTS: …` al final) o automática cuando el
  pedido coincide con la `description` («hazme un template para…»).
- **Contexto dinámico.** `` !`comando` `` al inicio de una línea ejecuta el comando antes de cargar
  la skill y pega su salida (lo usa `shadcn`). Un comando que falla aborta la invocación, así que la
  skill de Lattiz no lo usa: pide los datos con `pnpm lattiz giro list --json` dentro del flujo.

## Qué es

`.claude/skills/lattiz-template/` es una skill de proyecto (commiteada): con
`/lattiz-template una taquería en Querétaro` (o «hazme un template para …», «genera el par básico y
pro de …») Claude Code arma el **par Básico + Pro** por el CLI, lo revisa en capturas y se detiene
antes de publicar. Todo pasa por un spec (`packages/template-kit/specs/<giro>-<nombre>.spec.json`); la
skill nunca edita archivos generados ni código.

| Archivo                          | Para qué                                                                      |
| -------------------------------- | ----------------------------------------------------------------------------- |
| `SKILL.md`                       | reglas y flujo (lo que Claude carga al invocarla)                             |
| `references/workflow.md`         | checklist del spec, cómo arreglar cada hallazgo, formato de entrega           |
| `references/commands.md`         | contrato del CLI: flags, formas `--json`, códigos de salida                   |
| `references/copy-guide-es-mx.md` | voz, longitudes, prohibiciones, ejemplos por giro                             |
| `references/review-rubric.md`    | cómo criticar las capturas (pliegue, jerarquía, «no genérico», Básico vs Pro) |
| `references/giro-mapping.md`     | negocio en texto libre → giro; tono → paleta y tipografía                     |

## Cómo se usa

```
/lattiz-template una taquería en Querétaro
/lattiz-template un despacho contable en Monterrey, serio pero moderno
/lattiz-template una veterinaria en CDMX que atiende sobre todo gatos
/lattiz-template estética de uñas y pestañas en Puebla, elegante
/lattiz-template consultorio dental en Mérida, solo el Pro
/lattiz-template boutique de ropa en Guadalajara con pedidos por WhatsApp
/lattiz-template estudio de yoga en León
/lattiz-template florería en Coyoacán
/lattiz-template barbería de caballeros en Tijuana
/lattiz-template consultorio de nutrióloga en Toluca
```

También sirve en lenguaje natural sin la barra («hazme una plantilla para una cafetería en
Oaxaca»). Si falta el tipo de negocio, Claude pregunta; lo demás (colonia, nombre ficticio, tono)
lo decide y lo dice como «supuestos».

**Lo que garantiza:** spec válido con `--strict` (longitudes, sin promesas, sin datos reales ni
contacto escrito a mano, sin copy repetido), `kit:validate` y `lattiz check` sin FAIL ni WARN de
pliegue, revisión visual con la rúbrica, y una entrega con ids, comandos y supuestos.

**Lo que nunca hace:** imprimir secretos; editar archivos generados, secciones o código; correr
`seed`, `deploy`, `publish` o `ship` sin que se lo pidas en esa conversación (sin terminal, el CLI
además exige `--yes --confirm-remote`); `build --force`; commits o `git push` no pedidos; usar
negocios, marcas, personas o teléfonos reales.

## El ciclo del fundador

1. Pide la plantilla a Claude Code (`/lattiz-template …`). Tarda ~10–15 min por par (dos checks de
   ~25 s, dos revisiones de ~18 s y la escritura del copy).
2. Mírala: `pnpm lattiz dev <idPro>` y `pnpm lattiz dev <idBásico>` (7 tamaños, Motion en Pro).
3. Ajusta lo que quieras **en el spec** (o pídeselo a Claude: «cambia el titular», «otra paleta más
   cálida») y `pnpm lattiz build <stem>`.
4. Fotos reales: con `PIXABAY_API_KEY` el build las trae de Pixabay; si no, ponlas en `images` con `{ "file": "…" }` o `{ "url": "…" }`.
5. Publica tú: `pnpm lattiz ship <idBásico> <idPro>` (cuando el primer seed/deploy real haya
   funcionado de punta a punta). Commitea el spec y lo generado.

## Agregar un giro

1. `packages/template-kit/giros/<giro>.ts` (copia el más parecido) y regístralo en `giros/index.ts`:
   - `id` (también el rubro del kit), `label`, `aliases` (negocios que cubre), `rules` (reglas de copy
     del giro; regulados: cédulas `0000000`, sin promesas), `category` (plural, para la galería),
     `businessCategory` (enum de `business_profile`), `schemaType` (schema.org).
   - ≥ 5 `palettes` con `palette()`: `pnpm --filter @lattiz/template-kit kit:spec presets` debe dar ✓
     en todas (contraste AA de los pares del kit, incluido el acento sobre el velo del hero con foto)
     y los acentos a ≥ 30° entre sí.
   - ≥ 4 `fontPairs` de `FONT_PAIRS`, `shapes`, `sections` por tier (roles), `motion`, `navLabels`,
     `business` demo (teléfono con `0000`), `head`, `copy` con **todas** las claves que leen las
     variantes permitidas (`pnpm lattiz giro show <giro>` las lista), `heroAlternates` (el de
     `{{branch}}` al final), `images` (búsquedas en inglés) y `demoHours`.
2. El rubro en `blueprints/service-landing.shared.ts › verticals` (mapa rol → slot y `schemaType`) y
   motivos de placeholder en `src/lib/placeholders.ts › VERTICAL_MOTIFS`.
3. Si un negocio no se puede armar con las variantes existentes, una variante nueva en
   `sections/<slot>/<variante>/` (máx. 2 por giro, tokens de ritmo/encaje, revisada en un tema claro y
   uno oscuro a 1280/992/390), en su propio commit.
4. Spec de ejemplo con negocio ficticio: `pnpm lattiz spec init --giro <giro> --nombre "…" --twin`,
   datos de demo de otra ciudad, `overrides.basico.copy.hero.text`; `spec validate --strict`,
   `build`, `check` de cada id (en serie), `kit:compare-visual` (≥ 0.33).
5. Agrega el giro a la tabla de `references/giro-mapping.md` y al catálogo de `docs/template-spec.md`.

## Dirección de arte y diversidad (A2)

Desde la Fase A2 la skill, después de mapear el giro, corre `giro show` (que ahora trae
`directions[]` ordenadas por uso en el giro y afinidad, `archetypesUsed` y `freeProHeroes`) y
`kit capacity --giro <g> --catalog extended`; elige una dirección y un arquetipo que el giro no use,
crea el spec con `spec init --direccion <id>` y escribe el copy con la voz de `direccion show`. El
linter `--strict` suma avisos de texto genérico (`muletilla`, `rayas`, `mayusculas`, `esqueleto`).
La rúbrica agrega silueta propia y diversidad contra el giro. Sigue editando solo specs y no publica.

## Mantener la skill al día

- La skill no lee código del kit: todo lo que necesita sale de `giro show`, `spec validate --strict`,
  `build --json`, `check --json` y `review`. Si cambia una forma JSON, un flag o un código de salida,
  actualiza `references/commands.md` en el mismo commit.
- Reglas de copy nuevas: en `src/spec/copy-lint.ts` (`COPY_RULES`, `BANNED`, `COPY_LIMITS`) y en
  `references/copy-guide-es-mx.md`.
- Una variante o un giro nuevo no necesitan cambios en la skill (los lee de `giro show`), salvo la
  tabla de `giro-mapping.md`.
- Después de cambiar la skill, pruébala con un pedido real y anota el resultado en la sección de
  evaluación de abajo.

## Límites conocidos

- Nombres, personas, reseñas y cifras son ficticios; las fotos vienen de Pixabay si hay clave (o placeholders; o URLs si se
  pide): el cliente real las cambia en el editor.
- El copy pasa el linter, pero merece una lectura humana antes de vender (sobre todo en giros
  regulados: dental y despacho).
- Portadas `offset-card` y `centered-arch` no tienen encaje automático (`data-lz-fit`): la regla
  `fold` de `check` avisa si el CTA queda bajo el pliegue y la skill acorta el titular.
- Horarios, colonias y mapas de sucursales con dirección propia quedan como texto demo en el
  `.grapesjs`; teléfono, WhatsApp, correo, dirección y ciudad ya son tokens `{{lz:*}}`.
- La skill no publica; el lado remoto (seed, deploy, ship) no se ha probado de punta a punta en este
  entorno.

## Aviso para el fundador y el abogado (giros regulados)

`dental` y `despacho` (y en menor medida `clinica` y `veterinaria`) llevan copy de profesiones
reguladas. Las plantillas usan cédulas `0000000` como marcador, no prometen resultados clínicos,
fiscales ni legales y remiten urgencias a llamar. Los Términos ya ponen la responsabilidad
regulatoria en el cliente; aun así, lee el copy de estos giros (y pásalo por el abogado) antes de
venderlos.

## Evaluación (2026-10-12, local, sin seed ni deploy)

Se siguió `SKILL.md` al pie de la letra para tres pedidos, cada uno como par. Los specs quedaron en
`packages/template-kit/fixtures/spec/skill-eval/` (fuera de `specs/`, para no ocupar paletas del
giro). Para usar uno: muévelo a `specs/`, cambia `$schema` a `./spec.schema.json` y corre
`pnpm lattiz build <stem>`. Lo generado se borró.

| Pedido                                                                   | Tiempo   | validate / build | check (Pro · Básico) | Rondas de revisión          | FAIL | WARN (Pro · Básico)              |
| ------------------------------------------------------------------------ | -------- | ---------------- | -------------------- | --------------------------- | ---- | -------------------------------- |
| (a) taquería en Querétaro → `restaurante-la-lumbre`                      | ~9 min   | 2 / 2            | 1 · 2                | 1 (tipografía de la Básica) | 0    | font 125, tap 3 · font 75, tap 7 |
| (b) despacho contable en Monterrey → `despacho-norma-contable`           | ~11 min  | 2 / 3            | 3 · 1                | 2 (portada Pro, titular)    | 0    | font 96, tap 7 · font 68, tap 7  |
| (c) veterinaria en CDMX → `veterinaria-tejocote`                         | ~14 min  | 2 / 2            | 2 · 1                | 1 (titular Pro)             | 0    | font 124, tap 7 · font 82        |
| (b) repetido con la skill y el CLI corregidos → `despacho-balance-regio` | ~3.5 min | 1 / 1            | 1 · 1                | 0                           | 0    | font 110, tap 7 · font 68, tap 7 |

Los tiempos de la primera ronda se solapan (los checks esperaban turno en serie) e incluyen escribir
los arreglos del CLI; el pedido repetido se midió de corrido. Cada `check` tardó 24–27 s y ~0.9–1.1
GiB; cada `review`, ~16–20 s. Los WARN `font`/`tap` son las etiquetas de 11–12 px y los enlaces del
pie de las variantes compartidas (los mismos que en las barberías); ninguno se arregla desde el spec.

**Lo que hubo que adivinar:** colonia (Cimatario, Del Valle, Portales, Cumbres), nombre ficticio,
horario (nocturno en la taquería), paleta y tipografía por tono, y en la veterinaria el ángulo (gatos)
para no repetir la del giro.

**Lo que faltaba y se arregló (commits aparte):**

- Los pares tipográficos libres del restaurante eran todos serifas; la Básica de la taquería salió en
  Cormorant (de bar de vinos). `giro show` ahora lista `otherFontPairs` (fe5058a).
- El linter marcaba «¿Qué formas de pago aceptan?» como copiado de otra plantilla; las preguntas ya no
  cuentan y el aviso nombra hasta tres frases (e0b2828).
- La portada `offset-card` no tiene encaje: con un titular largo el CTA quedaba bajo el pliegue a
  1366×768 y `check` pasaba. Nueva regla `fold` (dd5e492); la skill la trata como bloqueante. Encontró
  además tres plantillas de ejemplo de la Fase 4 (arregladas en 0b26420) y la Pro de florería de la
  Fase 2 (sin tocar: ver pendientes).
- El placeholder del hero de despacho dibujaba una balanza (de abogados) (d01bcd9).
- Con dos pares, el giro despacho se quedó con una paleta curada; el build pedía una paleta propia
  pero el modelo no sabía qué tonos quedaban. `giro show` ahora da `usedAccentHues` y
  `freeHueRanges` (fd0fc32).
- `list --offline --json` por tubería se cortaba a 64 KiB (JSON inválido) (60e72cd).
- Las etiquetas del menú del giro («Cocina», «Reservar») no siempre van con el negocio: la skill ahora
  sabe que `copy.navbar.links` las cambia.

### Crítica visual (línea base de calidad)

- **`restaurante-la-lumbre-v1` (Pro):** nocturno con mostaza y DM Serif: se siente taquería de
  noche; el hero con foto a todo lo ancho y la cinta de «Pastor al carbón» dan carácter. Con fotos
  reales del trompo sería vendible; el menú («Cocina», «Reservar») aún suena a restaurante.
- **`restaurante-base-la-lumbre-v1` (Básico):** tras pasar a Anton, el titular en mayúsculas
  condensadas con el acento en itálica suena a puesto de barrio y no a bistró; el arco verde con
  placeholder ocupa mucho en móvil hasta que haya foto.
- **`despacho-norma-contable-v1` (Pro):** Sora enorme en `offset-card` con verde inglés: moderno y
  seguro, claramente distinto de Cifra Clara. Sin serif, el acento solo es color; con una foto real
  de reunión ganaría calidez.
- **`despacho-base-norma-contable-v1` (Básico):** portada dividida con DM Serif y berenjena:
  profesional, nada barata, un poco más clásica que la Pro (está bien para un despacho).
- **`veterinaria-tejocote-v1` (Pro):** Fraunces grande con «sin estrés» en itálica azul y formas
  orgánicas: amable y clara; la tarjeta inclinada con la huella da movimiento.
- **`veterinaria-base-tejocote-v1` (Básico):** lila con Lora y el arco con la huella: cálida, se
  entiende el giro al instante; el titular con la colonia ancla el negocio en Portales.
- **`despacho-balance-regio-v1` (Pro):** nocturno con oro y Playfair en portada dividida: elegante,
  se distingue de los otros dos despachos.
- **`despacho-base-balance-regio-v1` (Básico):** paleta propia verde azulado (186°) derivada con AA:
  limpia y legible; prueba que un giro lleno sigue aceptando plantillas.
