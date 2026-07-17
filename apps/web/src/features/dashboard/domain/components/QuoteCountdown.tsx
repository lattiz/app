import { useEffect, useState } from 'react';
import { TimerIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  expiresAt: string;
  onExpire: () => void;
}

function remainingSeconds(expiresAt: string): number {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
}

/** Live countdown for the 10-minute quoteToken TTL. */
export function QuoteCountdown({ expiresAt, onExpire }: Props) {
  const [seconds, setSeconds] = useState(() => remainingSeconds(expiresAt));

  useEffect(() => {
    setSeconds(remainingSeconds(expiresAt));
    const interval = window.setInterval(() => {
      const left = remainingSeconds(expiresAt);
      setSeconds(left);
      if (left <= 0) {
        window.clearInterval(interval);
        onExpire();
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  return (
    <p
      className={cn(
        'flex items-center gap-1.5 text-sm text-muted-foreground',
        seconds <= 60 && seconds > 0 && 'text-destructive',
      )}
    >
      <TimerIcon className="size-4" />
      Precio bloqueado por:{' '}
      <span className="font-semibold tabular-nums">
        {minutes}:{String(rest).padStart(2, '0')}
      </span>
    </p>
  );
}
