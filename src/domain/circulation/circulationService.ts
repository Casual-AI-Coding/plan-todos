import type { CirculationLog } from "@/lib/types";

export interface CirculationStats {
  totalCount: number;
  avgCount: number;
}

export const circulationDomainService = {
  calculateStats(logs: CirculationLog[]): CirculationStats {
    if (logs.length === 0) {
      return { totalCount: 0, avgCount: 0 };
    }
    const totalCount = logs.reduce((sum, log) => sum + (log.count || 0), 0);
    const avgCount = totalCount / logs.length;
    return { totalCount, avgCount };
  },

  getTrend(logs: CirculationLog[], days: number = 7): number[] {
    const now = new Date();
    const result: number[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      const dayLog = logs.find((l) => l.completed_at?.startsWith(dateStr));
      result.push(dayLog?.count || 0);
    }
    return result;
  },

  getHighestDay(logs: CirculationLog[]): CirculationLog | null {
    if (logs.length === 0) return null;
    return logs.reduce(
      (max, log) => ((log.count || 0) > (max.count || 0) ? log : max),
      logs[0],
    );
  },

  getLowestDay(logs: CirculationLog[]): CirculationLog | null {
    if (logs.length === 0) return null;
    return logs.reduce(
      (min, log) => ((log.count || 0) < (min.count || 0) ? log : min),
      logs[0],
    );
  },
};
