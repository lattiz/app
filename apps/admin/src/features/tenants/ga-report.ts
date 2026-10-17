export type GaDailyPoint = {
  date: string;
  sessions: number;
};

export type GaSnapshot = {
  sessions: number;
  activeUsers: number;
  daily: GaDailyPoint[];
};

/** The admin ficha stores the GA4 report as untouched jsonb. */
export function parseGaSnapshot(report: { [key: string]: unknown } | null): GaSnapshot | null {
  if (!report) return null;
  const { sessions, activeUsers } = report;
  if (typeof sessions !== 'number' || typeof activeUsers !== 'number') return null;
  return {
    sessions,
    activeUsers,
    daily: dailyPoints(report.daily),
  };
}

function dailyPoints(value: unknown): GaDailyPoint[] {
  if (!Array.isArray(value)) return [];
  const points: GaDailyPoint[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const date = (item as { date?: unknown }).date;
    const sessions = (item as { sessions?: unknown }).sessions;
    if (typeof date === 'string' && typeof sessions === 'number') {
      points.push({ date, sessions });
    }
  }
  return points;
}
