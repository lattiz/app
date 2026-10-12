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
