const REASON_MIN = 3;
const REASON_MAX = 300;

export function actionReasonError(reason: string): string | null {
  const trimmed = reason.trim();
  if (trimmed.length < REASON_MIN)
    return 'Escribe un motivo de al menos 3 caracteres.';
  if (trimmed.length > REASON_MAX)
    return 'El motivo puede tener hasta 300 caracteres.';
  return null;
}
