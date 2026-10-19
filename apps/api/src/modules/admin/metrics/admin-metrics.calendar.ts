/** Business calendar for the admin panel. Mexico City has no DST. */
export const MEXICO_CITY = 'America/Mexico_City';

const DAY_MS = 86_400_000;

const dayFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: MEXICO_CITY,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const monthFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: MEXICO_CITY,
  year: 'numeric',
  month: '2-digit',
});

interface Ymd {
  year: number;
  month: number;
  day: number;
}

export function mexicoCityMonthKey(instant: Date): string {
  return monthFormat.format(instant);
}

export function mexicoCityDayKey(instant: Date): string {
  return dayFormat.format(instant);
}

/** Inclusive list of `YYYY-MM` ending at the month that contains `now`. */
export function mexicoCityMonthKeys(now: Date, months: number): string[] {
  const today = ymd(now);
  const keys: string[] = [];
  for (let index = months - 1; index >= 0; index -= 1) {
    const cursor = new Date(Date.UTC(today.year, today.month - 1 - index, 1));
    const year = cursor.getUTCFullYear();
    const month = cursor.getUTCMonth() + 1;
    keys.push(`${year}-${pad(month)}`);
  }
  return keys;
}

export function mexicoCityMonthStart(monthKey: string): Date {
  const [year, month] = monthKey.split('-').map(Number);
  return mexicoCityStartOfDay(year, month, 1);
}

export function mexicoCityMonthBounds(now: Date): { start: Date; end: Date } {
  const today = ymd(now);
  const start = mexicoCityStartOfDay(today.year, today.month, 1);
  const next =
    today.month === 12
      ? mexicoCityStartOfDay(today.year + 1, 1, 1)
      : mexicoCityStartOfDay(today.year, today.month + 1, 1);
  return { start, end: next };
}

export function mexicoCityDayBounds(day: string): { start: Date; end: Date } {
  const [year, month, dayOfMonth] = day.split('-').map(Number);
  const start = mexicoCityStartOfDay(year, month, dayOfMonth);
  return { start, end: new Date(start.getTime() + DAY_MS) };
}

/** The calendar day before `now` in Mexico City, as `YYYY-MM-DD`. */
export function previousMexicoCityDay(now: Date): string {
  const today = ymd(now);
  const startToday = mexicoCityStartOfDay(today.year, today.month, today.day);
  return mexicoCityDayKey(new Date(startToday.getTime() - DAY_MS));
}

/** Start of the Mexico City day that begins a `days`-long window ending today. */
export function mexicoCityWindowStart(now: Date, days: number): Date {
  const today = ymd(now);
  const startToday = mexicoCityStartOfDay(today.year, today.month, today.day);
  return new Date(startToday.getTime() - (days - 1) * DAY_MS);
}

export function mexicoCityStartOfDay(
  year: number,
  month: number,
  day: number,
): Date {
  const utcMidnight = Date.UTC(year, month - 1, day, 0, 0, 0);
  const offset = zoneOffsetMs(new Date(utcMidnight));
  const start = new Date(utcMidnight - offset);
  const checked = zoneOffsetMs(start);
  if (checked !== offset) return new Date(utcMidnight - checked);
  return start;
}

function ymd(instant: Date): Ymd {
  const key = mexicoCityDayKey(instant);
  const [year, month, day] = key.split('-').map(Number);
  return { year, month, day };
}

function zoneOffsetMs(instant: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: MEXICO_CITY,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  let hour = read('hour');
  if (hour === 24) hour = 0;
  const asUtc = Date.UTC(
    read('year'),
    read('month') - 1,
    read('day'),
    hour,
    read('minute'),
    read('second'),
  );
  return asUtc - instant.getTime();
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}
