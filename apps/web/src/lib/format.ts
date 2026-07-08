export function relativeTime(iso: string | null): string {
  if (!iso) return 'nunca';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  if (days > 0) return rtf.format(-days, 'day');
  return rtf.format(-hours, 'hour');
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
