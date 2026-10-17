import { Alert, AlertDescription } from '@/components/ui/alert';

/** Inline error for auth forms. The message is already in Spanish. */
export function FormError({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <Alert variant="destructive">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
