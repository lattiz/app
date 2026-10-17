import { Alert, AlertAction, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { readApiErrorMessage } from '@/lib/admin-errors';

export function QueryAlert({
  error,
  pending = false,
  onRetry,
}: {
  error: unknown;
  pending?: boolean;
  onRetry: () => void;
}) {
  return (
    <Alert variant="destructive">
      <AlertTitle>{readApiErrorMessage(error)}</AlertTitle>
      <AlertAction>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={onRetry}
        >
          Reintentar
        </Button>
      </AlertAction>
    </Alert>
  );
}
