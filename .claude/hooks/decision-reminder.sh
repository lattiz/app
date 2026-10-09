#!/usr/bin/env bash
# PostToolUse(Bash: git commit*): recuerda registrar decisiones ya aplicadas, probadas y commiteadas. Solo para el agente principal.
input="$(cat)"

# Los subagentes no escriben decisiones.
[ -n "$(printf '%s' "$input" | jq -r '.agent_id // empty')" ] && exit 0

# Evita el bucle: el commit de la propia decisión no dispara otro recordatorio.
cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // empty')"
case "$cmd" in *"docs(decisions)"*) exit 0 ;; esac

msg='Se acaba de commitear. Revisa si ese trabajo incluyó una decisión importante (librería/versión/enfoque elegido o descartado, arquitectura o despliegue, causa raíz, hallazgo no obvio) que además esté APLICADA, PROBADA (tests, typecheck, build o verificación manual) y COMMITEADA. Si cumple las cuatro: crea docs/decisions/<slug>.md (formato en docs/decisions/README.md), añade una línea al índice y commitea con mensaje "docs(decisions): <slug>". Si no cumple alguna, no hagas nada ni lo menciones.'
jq -n --arg m "$msg" '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:$m}}'
