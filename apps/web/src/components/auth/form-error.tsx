import { Alert, AlertDescription } from '@/components/ui/alert';

/** Inline error surface for auth forms. Rendered below the fields, not as a toast. */
export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <Alert variant="destructive">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
