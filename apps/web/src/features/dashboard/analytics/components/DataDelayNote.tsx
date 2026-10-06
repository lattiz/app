import { ClockIcon } from 'lucide-react';

const COPY = {
  inline:
    'Las visitas, usuarios y fuentes de tráfico pueden tardar entre 24-48 horas en actualizarse.',
  empty:
    'Las visitas, usuarios y fuentes de tráfico pueden tardar entre 24-48 horas en aparecer aquí.',
} as const;

export function DataDelayNote({ variant }: { variant: keyof typeof COPY }) {
  if (variant === 'empty') return <p>{COPY.empty}</p>;
  return (
    <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
      <ClockIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <span>{COPY.inline}</span>
    </p>
  );
}
