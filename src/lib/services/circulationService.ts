// src/lib/services/circulationService.ts
export interface CirculationLog {
  id: string;
  count: number;
  date: string;
}

export interface CirculationStats {
  totalCount: number;
  avgCount: number;
}

export function calculateCirculationStats(
  logs: CirculationLog[],
): CirculationStats {
  if (logs.length === 0) {
    return { totalCount: 0, avgCount: 0 };
  }
  const totalCount = logs.reduce((sum, log) => sum + log.count, 0);
  const avgCount = totalCount / logs.length;
  return { totalCount, avgCount };
}

export function getCirculationTrend(
  logs: CirculationLog[],
  days: number = 7,
): number[] {
  const now = new Date();
  const result: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    const dayLog = logs.find((l) => l.date.startsWith(dateStr));
    result.push(dayLog?.count || 0);
  }
  return result;
}

export function getHighestCirculationDay(
  logs: CirculationLog[],
): CirculationLog | null {
  if (logs.length === 0) return null;
  return logs.reduce(
    (max, log) => (log.count > max.count ? log : max),
    logs[0],
  );
}

export function getLowestCirculationDay(
  logs: CirculationLog[],
): CirculationLog | null {
  if (logs.length === 0) return null;
  return logs.reduce(
    (min, log) => (log.count < min.count ? log : min),
    logs[0],
  );
}
