import { Alert, AlertDescription } from '@/components/ui/alert';

/** Inline error surface for auth forms. Rendered below the fields, not as a toast. */
export function FormError({ message }: { message: string | null }) {
  if (!message) return null;

  switch (message) {
    case 'Invalid login credentials':
      message = 'Correo electrónico o contraseña incorrectos.';
      break;
    case 'User not found':
      message = 'Usuario no encontrado.';
      break;
    case 'Invalid email address':
      message = 'Dirección de correo electrónico inválida.';
      break;
    default:
      message = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.';
  }

  return (
    <Alert variant="destructive">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
