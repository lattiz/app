const numberFormat = new Intl.NumberFormat('es-MX');

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function formatDeltaPct(value: number): string {
  return `${value > 0 ? '+' : ''}${value}%`;
}

// Report dates are calendar days in the GA property zone; formatting them in
// UTC keeps the browser's own zone from shifting them by a day.
const shortDate = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});
const longDate = new Intl.DateTimeFormat('es-MX', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
});

function parseDay(isoDay: string): Date {
  return new Date(`${isoDay}T00:00:00Z`);
}

export function formatShortDay(isoDay: string): string {
  return shortDate.format(parseDay(isoDay));
}

export function formatLongDay(isoDay: string): string {
  const text = longDate.format(parseDay(isoDay));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatUpdatedAgo(iso: string, now: number): string {
  const minutes = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return 'Actualizado hace un momento';
  if (minutes < 60) return `Actualizado hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `Actualizado hace ${hours} h`;
}
