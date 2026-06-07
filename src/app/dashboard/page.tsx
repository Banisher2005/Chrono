'use client';

import TodayTimeline from '@/components/TodayTimeline';
import WeeklyFlow from '@/components/WeeklyFlow';
import ChronoGrid from '@/components/ChronoGrid';

export default function DashboardPage() {
  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-[1fr_360px] overflow-hidden">
      <div className="overflow-hidden md:border-r border-chrono-border/30">
        <TodayTimeline />
      </div>
      <div className="hidden md:grid md:grid-rows-2 overflow-hidden">
        <div className="border-b border-chrono-border/30 overflow-hidden">
          <WeeklyFlow />
        </div>
        <div className="overflow-hidden">
          <ChronoGrid />
        </div>
      </div>
    </div>
  );
}
