'use client';

import { Card } from '@/components/ui';

export interface CirculationStatsCardProps {
  todayPending: number;
  todayCompleted: number;
  currentStreak: number;
}

export function CirculationStatsCard({ todayPending, todayCompleted, currentStreak }: CirculationStatsCardProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="text-center">
        <div className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
          {todayPending}
        </div>
        <div className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          今日待打卡
        </div>
      </Card>
      <Card className="text-center">
        <div className="text-3xl font-bold" style={{ color: 'var(--color-success)' }}>
          {todayCompleted}
        </div>
        <div className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          今日已完成
        </div>
      </Card>
      <Card className="text-center">
        <div className="text-3xl font-bold" style={{ color: 'var(--color-warning)' }}>
          {currentStreak}
        </div>
        <div className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          当前最长连续
        </div>
      </Card>
    </div>
  );
}
