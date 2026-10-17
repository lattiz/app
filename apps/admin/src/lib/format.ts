const LOCALE = 'es-MX';
const TIME_ZONE = 'America/Mexico_City';

const dateMedium = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: 'medium',
  timeZone: TIME_ZONE,
});

const dateTimeMedium = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: TIME_ZONE,
});

const monthWithYear = new Intl.DateTimeFormat(LOCALE, {
  month: 'short',
  year: 'numeric',
  timeZone: TIME_ZONE,
});

const monthShort = new Intl.DateTimeFormat(LOCALE, {
  month: 'short',
  timeZone: TIME_ZONE,
});

const dayShort = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'short',
  timeZone: TIME_ZONE,
});

const percentFormat = new Intl.NumberFormat(LOCALE, {
  style: 'percent',
  maximumFractionDigits: 0,
});

const countFormat = new Intl.NumberFormat(LOCALE);

const byteFormat = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const moneyFormatters = new Map<string, Intl.NumberFormat>();
const wholeMoneyFormatters = new Map<string, Intl.NumberFormat>();

/** Centavos → moneda. `currency` puede llegar en minúsculas (Stripe). */
export function formatMoney(cents: number, currency: string): string {
  return moneyFormatter(currency, moneyFormatters, undefined).format(cents / 100);
}

/** Centavos → moneda sin decimales, para cifras grandes del resumen. */
export function formatMoneyWhole(cents: number, currency: string): string {
  return moneyFormatter(currency, wholeMoneyFormatters, 0).format(cents / 100);
}

/** Fracción 0–1 → porcentaje entero, p. ej. 0.256 → "26%". */
export function formatPercent(ratio: number): string {
  return percentFormat.format(ratio);
}

export function formatCount(value: number): string {
  return countFormat.format(value);
}

/** "4.2 MB", "310 KB", "512 B". */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes >= 1024 * 1024) {
    return `${byteFormat.format(bytes / (1024 * 1024))} MB`;
  }
  if (bytes >= 1024) return `${formatCount(Math.round(bytes / 1024))} KB`;
  return `${formatCount(Math.round(bytes))} B`;
}

/** Instante ISO en hora de la Ciudad de México, solo fecha. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return dateMedium.format(date);
}

/** Instante ISO en hora de la Ciudad de México, fecha y hora. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return dateTimeMedium.format(date);
}

/** Mes calendario `YYYY-MM`, sin correrlo al mes anterior. */
export function formatMonth(yearMonth: string): string {
  const date = calendarNoon(yearMonth);
  if (!date) return yearMonth;
  return monthWithYear.format(date);
}

/** Mes corto para el eje, p. ej. "ene". */
export function formatMonthShort(yearMonth: string): string {
  const date = calendarNoon(yearMonth);
  if (!date) return yearMonth;
  return monthShort.format(date);
}

/** Día calendario `YYYY-MM-DD`, sin correrlo al día anterior. */
export function formatDay(isoDay: string): string {
  const date = calendarNoon(isoDay);
  if (!date) return isoDay;
  return dayShort.format(date);
}

function moneyFormatter(
  currency: string,
  cache: Map<string, Intl.NumberFormat>,
  maximumFractionDigits: number | undefined,
): Intl.NumberFormat {
  const code = currency.trim().toUpperCase() || 'MXN';
  const cached = cache.get(code);
  if (cached) return cached;
  try {
    const formatter = new Intl.NumberFormat(LOCALE, {
      style: 'currency',
      currency: code,
      ...(maximumFractionDigits == null
        ? {}
        : {
            minimumFractionDigits: maximumFractionDigits,
            maximumFractionDigits,
          }),
    });
    cache.set(code, formatter);
    return formatter;
  } catch {
    return moneyFormatter('MXN', cache, maximumFractionDigits);
  }
}

/**
 * Noon UTC of that calendar day stays on the same date in Mexico City
 * (UTC−6, sin horario de verano).
 */
function calendarNoon(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = match[3] ? Number(match[3]) : 1;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return new Date(Date.UTC(year, month - 1, day, 18));
}
