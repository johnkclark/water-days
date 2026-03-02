'use client';

import { useState, useEffect } from 'react';
import StatsCards from '@/components/StatsCards';
import CalendarHeatmap from '@/components/CalendarHeatmap';
import { supabase, type SwimLog } from '@/lib/supabase';
import { SEASON_START, SEASON_END } from '@/lib/constants';
import { calculateStats } from '@/lib/utils';

export default function DashboardPage() {
  const [logs, setLogs] = useState<SwimLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const { data } = await supabase
        .from('swim_logs')
        .select('*')
        .gte('date', SEASON_START)
        .lte('date', SEASON_END)
        .order('date', { ascending: true });

      setLogs((data as SwimLog[]) || []);
      setIsLoading(false);
    }

    fetchLogs();
  }, []);

  const stats = calculateStats(logs);

  return (
    <div className="animate-fade-in mx-auto max-w-lg px-4 pt-4 pb-8">
      <h1 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
        Dashboard
      </h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <StatsCards stats={stats} />
          <CalendarHeatmap logs={logs} />
        </div>
      )}
    </div>
  );
}
