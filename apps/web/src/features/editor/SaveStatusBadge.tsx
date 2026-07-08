import { CheckIcon, Loader2Icon, TriangleAlertIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SaveStatus } from './types';

interface SaveStatusBadgeProps {
  status: SaveStatus;
  lastSavedAt: string | null;
  onRetry?: () => void;
}

function formatTime(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SaveStatusBadge({
  status,
  lastSavedAt,
  onRetry,
}: SaveStatusBadgeProps) {
  if (status === 'saving') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2Icon className="size-3 animate-spin" />
        Guardando…
      </span>
    );
  }

  if (status === 'error') {
    return (
      <span className="flex items-center gap-1 text-xs text-destructive">
        <TriangleAlertIcon className="size-3" />
        Error al guardar
        {onRetry && (
          <Button
            variant="link"
            size="xs"
            className="h-auto px-1 text-xs text-destructive"
            onClick={onRetry}
          >
            Reintentar
          </Button>
        )}
      </span>
    );
  }

  const saved = status === 'saved' && lastSavedAt;
  return (
    <span
      className={cn(
        'flex items-center gap-1.5 text-xs text-muted-foreground',
        !saved && 'opacity-0',
      )}
    >
      <CheckIcon className="size-3 text-green-600 dark:text-green-500" />
      {saved ? `Guardado ${formatTime(lastSavedAt)}` : 'Guardado'}
    </span>
  );
}
